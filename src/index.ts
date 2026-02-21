import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import {
  createReadTool,
  createLsTool,
  DEFAULT_MAX_LINES,
  DEFAULT_MAX_BYTES,
} from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { promisify } from "node:util";

import { formatFileMapWithBudget } from "./formatter.js";
import { generateMap, shouldGenerateMap } from "./mapper.js";

const execAsync = promisify(exec);

/**
 * File extensions that are binary/image files and should be
 * delegated directly to the built-in read tool without map generation.
 */
const BINARY_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".ico",
  ".tiff",
  ".tif",
  ".svg",
  ".avif",
  ".heic",
  ".heif",
  // Audio/video
  ".mp3",
  ".mp4",
  ".wav",
  ".avi",
  ".mov",
  ".mkv",
  ".flac",
  ".ogg",
  ".webm",
  // Archives
  ".zip",
  ".tar",
  ".gz",
  ".bz2",
  ".xz",
  ".7z",
  ".rar",
  // Binary data
  ".bin",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".o",
  ".a",
  ".wasm",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
]);

// In-memory cache for maps
const mapCache = new Map<string, { mtime: number; map: string }>();

/**
 * Reset the map cache. Exported for testing purposes only.
 */
export function resetMapCache(): void {
  mapCache.clear();
}

export default function piReadMapExtension(pi: ExtensionAPI): void {
  // Get the current working directory
  const cwd = process.cwd();

  // Create the built-in read tool to delegate to
  const builtInRead = createReadTool(cwd);

  // Create the built-in ls tool for directory fallback
  const builtInLs = createLsTool(cwd);

  // Register our enhanced read tool
  pi.registerTool({
    name: "read",
    label: "Read",
    description: `Read the contents of a file. Supports text files and images (jpg, png, gif, webp). Images are sent as attachments. For text files, output is truncated to ${DEFAULT_MAX_LINES} lines or ${Math.round(DEFAULT_MAX_BYTES / 1024)}KB (whichever is hit first). If truncated, a structural map of the file is included to enable targeted reads. Use offset/limit for large files.`,
    parameters: Type.Object({
      path: Type.String({
        description: "Path to the file to read (relative or absolute)",
      }),
      offset: Type.Optional(
        Type.Number({
          description: "Line number to start reading from (1-indexed)",
        })
      ),
      limit: Type.Optional(
        Type.Number({ description: "Maximum number of lines to read" })
      ),
    }),

    async execute(toolCallId, params, signal, onUpdate) {
      const { path: inputPath, offset, limit } = params;

      // If offset or limit provided, delegate directly (targeted read)
      if (offset !== undefined || limit !== undefined) {
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // Resolve path
      const absPath = resolve(cwd, inputPath.replace(/^@/, ""));

      // Skip binary/image files — delegate directly without map generation
      if (BINARY_EXTENSIONS.has(extname(absPath).toLowerCase())) {
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // Check file size and line count
      let stats;
      try {
        stats = await stat(absPath);
      } catch {
        // Let built-in handle the error
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // For non-regular files, handle appropriately
      if (!stats.isFile()) {
        if (stats.isDirectory()) {
          // Instead of letting EISDIR propagate and sending a custom steer message,
          // we run ls and embed the listing directly into the thrown error.
          // This prevents steer from breaking parallel executions.
          let lsText: string | null = null;
          try {
            const lsResult = await builtInLs.execute(
              toolCallId,
              { path: inputPath },
              signal
            );
            lsText = lsResult.content
              .filter(
                (c): c is { type: "text"; text: string } => c.type === "text"
              )
              .map((c) => c.text)
              .join("\n");
          } catch {
            // best-effort: if ls fails, just let the error through without listing
          }

          if (lsText !== null) {
            // eslint-disable-next-line @factory/structured-logging
            throw new Error(
              `EISDIR: illegal operation on a directory, read '${absPath}'\n\nFallback ls output for this directory:\n${lsText}`
            );
          }

          // Fallback if ls fails for some reason
          return builtInRead.execute(toolCallId, params, signal, onUpdate);
        }
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // Quick check: if file is small enough by bytes, delegate
      if (stats.size <= DEFAULT_MAX_BYTES) {
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // Need to check line count too
      let totalLines: number;
      try {
        const { stdout } = await execAsync(`wc -l < "${absPath}"`, { signal });
        totalLines = Number.parseInt(stdout.trim(), 10) || 0;
      } catch {
        // If we can't count lines, delegate
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // If within threshold, delegate
      if (!shouldGenerateMap(totalLines, stats.size)) {
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // File exceeds threshold - generate map and inline it in the tool result
      const result = await builtInRead.execute(
        toolCallId,
        params,
        signal,
        onUpdate
      );

      // Generate or retrieve cached map
      let mapText: string;
      const cached = mapCache.get(absPath);

      if (cached && cached.mtime === stats.mtimeMs) {
        mapText = cached.map;
      } else {
        const fileMap = await generateMap(absPath, { signal });

        if (!fileMap) {
          // Map generation failed, return original result
          return result;
        }

        mapText = formatFileMapWithBudget(fileMap);
        mapCache.set(absPath, { mtime: stats.mtimeMs, map: mapText });
      }

      // Append map to the tool result content
      return {
        ...result,
        content: [...result.content, { type: "text" as const, text: mapText }],
      };
    },
  });
}
