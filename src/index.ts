import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent";

import {
  createReadTool,
  createLsTool,
  DEFAULT_MAX_LINES,
  DEFAULT_MAX_BYTES,
} from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { promisify } from "node:util";

import type { FileMapMessageDetails } from "./types.js";

import { formatFileMapWithBudget } from "./formatter.js";
import { generateMap, shouldGenerateMap } from "./mapper.js";

export type { FileMapMessageDetails } from "./types.js";

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

// Pending maps waiting to be sent after tool_result
const pendingMaps = new Map<
  string,
  {
    path: string;
    map: string;
    details: FileMapMessageDetails;
  }
>();

// Pending directory listings waiting to be sent after a read-on-directory error
const pendingDirectoryLs = new Map<string, { path: string; listing: string }>();

/**
 * Reset the map cache. Exported for testing purposes only.
 */
export function resetMapCache(): void {
  mapCache.clear();
}

/**
 * Reset the pending maps. Exported for testing purposes only.
 */
export function resetPendingMaps(): void {
  pendingMaps.clear();
  pendingDirectoryLs.clear();
}

/**
 * Get pending maps for testing inspection.
 */
export function getPendingMaps(): Map<
  string,
  { path: string; map: string; details: FileMapMessageDetails }
> {
  return pendingMaps;
}

export default function piReadMapExtension(pi: ExtensionAPI): void {
  // Get the current working directory
  const cwd = process.cwd();

  // Create the built-in read tool to delegate to
  const builtInRead = createReadTool(cwd);

  // Create the built-in ls tool for directory fallback
  const builtInLs = createLsTool(cwd);

  // Register tool_result handler to send pending maps and directory listings
  pi.on("tool_result", (event, _ctx) => {
    if (event.toolName !== "read") {
      return;
    }

    // Send pending directory listing after read-on-directory error
    const pendingLs = pendingDirectoryLs.get(event.toolCallId);
    if (pendingLs) {
      pi.sendMessage(
        {
          customType: "directory-listing",
          content: `${pendingLs.path} is a directory. Here is ls:\n${pendingLs.listing}`,
          display: true,
        },
        { deliverAs: "followUp" }
      );
      pendingDirectoryLs.delete(event.toolCallId);
    }

    const pending = pendingMaps.get(event.toolCallId);
    if (!pending) {
      return;
    }

    // Send the map as a custom message
    pi.sendMessage(
      {
        customType: "file-map",
        content: pending.map,
        display: true,
        details: pending.details,
      },
      { deliverAs: "followUp" }
    );

    // Clean up
    pendingMaps.delete(event.toolCallId);
  });

  // Register custom message renderer for file-map type
  pi.registerMessageRenderer<FileMapMessageDetails>(
    "file-map",
    (message, options, theme: Theme) => {
      const { expanded } = options;
      const { details } = message;

      if (expanded) {
        // Expanded: show full formatted map
        // message.content can be string or array of content blocks
        const content =
          typeof message.content === "string"
            ? message.content
            : message.content
                .filter((c) => c.type === "text")
                .map((c) => (c as { type: "text"; text: string }).text)
                .join("\n");
        return new Text(content, 0, 0);
      }

      // Collapsed: show summary
      const fileName = details ? basename(details.filePath) : "file";
      const symbolCount = details?.symbolCount ?? 0;
      const totalLines = details?.totalLines ?? 0;
      const detailLanguage = details?.language ?? "unknown";

      let summary = theme.fg("accent", "📄 File Map: ");
      summary += theme.fg("toolTitle", theme.bold(fileName));
      summary += theme.fg("muted", ` │ `);
      summary += theme.fg("dim", `${symbolCount} symbols`);
      summary += theme.fg("muted", ` │ `);
      summary += theme.fg("dim", `${totalLines.toLocaleString()} lines`);
      summary += theme.fg("muted", ` │ `);
      summary += theme.fg("dim", detailLanguage);
      summary += theme.fg("muted", ` │ `);
      summary += theme.fg("dim", "Ctrl+O to expand");

      return new Text(summary, 0, 0);
    }
  );

  // Recover from skipped reads caused by map steering
  pi.on("turn_end", (event) => {
    const SKIPPED_TEXT = "Skipped due to queued user message.";

    // Find skipped read results
    const skippedReads = event.toolResults.filter(
      (r) =>
        r.toolName === "read" &&
        !r.isError &&
        r.content.some((c) => c.type === "text" && c.text === SKIPPED_TEXT)
    );

    if (skippedReads.length === 0) {
      return;
    }

    // Extract paths from the assistant message's tool calls.
    // The message is AgentMessage (union); narrow to AssistantMessage.
    const msg = event.message;
    if (!("role" in msg) || msg.role !== "assistant") {
      return;
    }

    const skippedPaths: string[] = [];
    for (const skipped of skippedReads) {
      const tc = msg.content.find(
        (c) =>
          c.type === "toolCall" &&
          c.name === "read" &&
          c.id === skipped.toolCallId
      );
      if (tc && tc.type === "toolCall" && tc.arguments["path"]) {
        skippedPaths.push(String(tc.arguments["path"]));
      }
    }

    if (skippedPaths.length === 0) {
      return;
    }

    const pathList = skippedPaths.map((p) => `- read("${p}")`).join("\n");

    pi.sendMessage(
      {
        customType: "read-recovery",
        content: `The following read() calls were interrupted by a file map delivery and need to be completed:\n${pathList}\nPlease re-issue these reads now.`,
        display: true,
      },
      { deliverAs: "followUp" }
    );
  });

  // Register custom message renderer for read-recovery type
  pi.registerMessageRenderer(
    "read-recovery",
    (message, options, theme: Theme) => {
      const content =
        typeof message.content === "string"
          ? message.content
          : message.content
              .filter((c) => c.type === "text")
              .map((c) => (c as { type: "text"; text: string }).text)
              .join("\n");

      if (options.expanded) {
        return new Text(content, 0, 0);
      }

      const pathCount = (content.match(/^- read\(/gm) || []).length;
      let summary = theme.fg("warning", "Recovery: ");
      summary += theme.fg(
        "dim",
        `${pathCount} interrupted read(s) being re-issued`
      );

      return new Text(summary, 0, 0);
    }
  );

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
          // Get ls output before letting the error propagate
          try {
            const lsResult = await builtInLs.execute(
              toolCallId,
              { path: inputPath },
              signal
            );
            const lsText = lsResult.content
              .filter(
                (c): c is { type: "text"; text: string } => c.type === "text"
              )
              .map((c) => c.text)
              .join("\n");
            pendingDirectoryLs.set(toolCallId, {
              path: absPath,
              listing: lsText,
            });
          } catch {
            // best-effort: if ls fails, just let the error through without listing
          }
          // Delegate to built-in read which will throw EISDIR
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
      let symbolCount: number;
      let language: string;

      if (cached && cached.mtime === stats.mtimeMs) {
        // Cache hit - we need to regenerate map for metadata
        // (alternatively, cache could store metadata too)
        const fileMap = await generateMap(absPath, { signal });
        if (fileMap) {
          mapText = cached.map;
          ({ language } = fileMap);
          symbolCount = fileMap.symbols.length;
        } else {
          return result;
        }
      } else {
        // Generate new map
        const fileMap = await generateMap(absPath, { signal });

        if (fileMap) {
          mapText = formatFileMapWithBudget(fileMap);
          ({ language } = fileMap);
          symbolCount = fileMap.symbols.length;
          // Cache it
          mapCache.set(absPath, { mtime: stats.mtimeMs, map: mapText });
        } else {
          // Map generation failed, return original result
          return result;
        }
      }

      // Store map in pendingMaps for delivery after tool_result event
      pendingMaps.set(toolCallId, {
        path: absPath,
        map: mapText,
        details: {
          filePath: absPath,
          totalLines,
          totalBytes: stats.size,
          symbolCount,
          language,
        },
      });

      // Return the built-in result unmodified (with cleared truncation details
      // since we're providing a map separately)
      return {
        ...result,
        details: undefined,
      };
    },
  });
}
