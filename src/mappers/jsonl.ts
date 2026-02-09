import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createInterface } from "node:readline";

import type { FileMap, FileSymbol } from "../types.js";

import { DetailLevel, SymbolKind } from "../enums.js";

interface JsonlSample {
  lineNumber: number;
  preview: string;
  keys: string[];
}

/**
 * Extract schema info from a JSON line.
 */
function analyzeJsonLine(
  line: string
): { keys: string[]; type: string } | null {
  try {
    const parsed = JSON.parse(line);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed)
    ) {
      return { keys: Object.keys(parsed), type: "object" };
    }
    if (Array.isArray(parsed)) {
      return { keys: [], type: `array[${parsed.length}]` };
    }
    return { keys: [], type: typeof parsed };
  } catch {
    return null;
  }
}

/**
 * Generate a file map for a JSON Lines file.
 * Each line is treated as a separate JSON record.
 */
export async function jsonlMapper(
  filePath: string,
  signal?: AbortSignal
): Promise<FileMap | null> {
  try {
    const stats = await stat(filePath);
    const totalBytes = stats.size;

    const samples: JsonlSample[] = [];
    let lineCount = 0;
    let schema: { keys: string[]; type: string } | null = null;

    const stream = createReadStream(filePath, { encoding: "utf8" });
    const rl = createInterface({ input: stream });

    // Abort handling
    signal?.addEventListener("abort", () => {
      rl.close();
      stream.destroy();
    });

    for await (const line of rl) {
      lineCount++;

      // Collect first few samples (only from first 100 lines)
      if (lineCount <= 100 && samples.length < 10 && line.trim()) {
        const lineSchema = analyzeJsonLine(line);
        if (lineSchema) {
          samples.push({
            lineNumber: lineCount,
            preview: line.slice(0, 80) + (line.length > 80 ? "..." : ""),
            keys: lineSchema.keys,
          });

          // Store schema from first valid line
          if (!schema) {
            schema = lineSchema;
          }
        }
      }

      // Continue counting all lines (don't early exit)
    }

    // Build symbols from samples
    const symbols: FileSymbol[] = [];

    // Add schema info as first symbol
    if (schema) {
      symbols.push({
        name: `Schema: ${schema.type}${schema.keys.length > 0 ? ` {${schema.keys.slice(0, 5).join(", ")}${schema.keys.length > 5 ? "..." : ""}}` : ""}`,
        kind: SymbolKind.Class,
        startLine: 1,
        endLine: 1,
      });
    }

    // Add sample entries
    for (const sample of samples.slice(0, 5)) {
      symbols.push({
        name: `Line ${sample.lineNumber}: ${sample.preview}`,
        kind: SymbolKind.Variable,
        startLine: sample.lineNumber,
        endLine: sample.lineNumber,
      });
    }

    // Add "more lines" indicator if applicable
    if (lineCount > samples.length) {
      symbols.push({
        name: `... ${lineCount - samples.length} more lines`,
        kind: SymbolKind.Variable,
        startLine: samples.length + 1,
        endLine: lineCount,
      });
    }

    return {
      path: filePath,
      totalLines: lineCount,
      totalBytes,
      language: "JSON Lines",
      symbols,
      detailLevel: DetailLevel.Full,
    };
  } catch (error) {
    if (signal?.aborted) {
      return null;
    }
    console.error(`JSONL mapper failed: ${error}`);
    return null;
  }
}
