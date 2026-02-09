import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import {
  createReadTool,
  DEFAULT_MAX_LINES,
  DEFAULT_MAX_BYTES,
} from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

import { formatFileMapWithBudget } from "./formatter.js";
import { generateMap, shouldGenerateMap } from "./mapper.js";

const execAsync = promisify(exec);

// In-memory cache for maps
const mapCache = new Map<string, { mtime: number; map: string }>();

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function piReadMapExtension(pi: ExtensionAPI): void {
  // Get the current working directory
  const cwd = process.cwd();

  // Create the built-in read tool to delegate to
  const builtInRead = createReadTool(cwd);

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

      // Check file size and line count
      let stats;
      try {
        stats = await stat(absPath);
      } catch {
        // Let built-in handle the error
        return builtInRead.execute(toolCallId, params, signal, onUpdate);
      }

      // For small files or non-regular files, delegate directly
      if (!stats.isFile()) {
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

      // File exceeds threshold - generate map
      // First, get the built-in result
      const result = await builtInRead.execute(
        toolCallId,
        params,
        signal,
        onUpdate
      );

      // Check cache
      const cached = mapCache.get(absPath);
      let mapText: string;

      if (cached && cached.mtime === stats.mtimeMs) {
        // Cache hit
        mapText = cached.map;
      } else {
        // Generate new map
        const fileMap = await generateMap(absPath, { signal });

        if (fileMap) {
          mapText = formatFileMapWithBudget(fileMap);
          // Cache it
          mapCache.set(absPath, { mtime: stats.mtimeMs, map: mapText });
        } else {
          // Map generation failed, return original result
          return result;
        }
      }

      // Append map to content
      if (result.content && result.content.length > 0) {
        const [firstContent, ...restContent] = result.content;
        if (firstContent && firstContent.type === "text") {
          // Find and modify the truncation message
          let { text } = firstContent;

          // Add truncation notice if not present
          if (!text.includes("[Truncated:") && !text.includes("lines shown")) {
            text += `\n\n[Truncated: showing first ${DEFAULT_MAX_LINES} lines of ${totalLines.toLocaleString()} (${formatSize(DEFAULT_MAX_BYTES)} of ${formatSize(stats.size)})]`;
          }

          // Append the map
          text += mapText;

          return {
            ...result,
            content: [{ type: "text" as const, text }, ...restContent],
          };
        }
      }

      return result;
    },
  });
}
