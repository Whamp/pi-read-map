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
import { basename, resolve } from "node:path";
import { promisify } from "node:util";

import type { FileMapMessageDetails } from "./types.js";

import { formatFileMapWithBudget } from "./formatter.js";
import { generateMap, shouldGenerateMap } from "./mapper.js";

export type { FileMapMessageDetails } from "./types.js";

const execAsync = promisify(exec);

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

  // Register tool_result handler to send pending maps
  pi.on("tool_result", (event, _ctx) => {
    if (event.toolName !== "read") {
      return;
    }

    const pending = pendingMaps.get(event.toolCallId);
    if (!pending) {
      return;
    }

    // Send the map as a custom message
    pi.sendMessage({
      customType: "file-map",
      content: pending.map,
      display: true,
      details: pending.details,
    });

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
      summary += theme.fg("warning", "Ctrl+O to expand");

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
          // Run the built-in ls tool and prefix with a notice
          const lsResult = await builtInLs.execute(
            toolCallId,
            { path: inputPath },
            signal,
          );
          const lsText = lsResult.content
            .filter((c): c is { type: "text"; text: string } => c.type === "text")
            .map((c) => c.text)
            .join("\n");
          return {
            content: [
              {
                type: "text" as const,
                text: `read was called on a directory, not a file. Here is ls:\n${lsText}`,
              },
            ],
            details: undefined,
          };
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
