import type { FileMap, MapOptions } from "./types.js";

import { THRESHOLDS } from "./constants.js";
import { detectLanguage } from "./language-detect.js";
import { cMapper } from "./mappers/c.js";
import { codemapMapper } from "./mappers/codemap.js";
import { fallbackMapper } from "./mappers/fallback.js";
import { goMapper } from "./mappers/go.js";
import { jsonMapper } from "./mappers/json.js";
import { pythonMapper } from "./mappers/python.js";
import { sqlMapper } from "./mappers/sql.js";

/**
 * Registry of language-specific mappers.
 */
const MAPPERS: Record<
  string,
  (filePath: string, signal?: AbortSignal) => Promise<FileMap | null>
> = {
  // Phase 1
  python: pythonMapper,

  // Phase 2: AST-based mappers
  go: goMapper,

  // Phase 2: Codemap-based mappers (tree-sitter)
  typescript: codemapMapper,
  javascript: codemapMapper,
  markdown: codemapMapper,
  rust: codemapMapper,
  cpp: codemapMapper,
  "c-header": codemapMapper, // .h files use codemap

  // Phase 2: Regex/subprocess mappers
  sql: sqlMapper,
  json: jsonMapper,
  c: cMapper, // .c files use regex
};

/**
 * Generate a structural map for a file.
 *
 * Dispatches to the appropriate language-specific mapper,
 * falling back to grep-based extraction if no specific mapper exists.
 */
export async function generateMap(
  filePath: string,
  options: MapOptions = {}
): Promise<FileMap | null> {
  const { signal } = options;

  // Detect language
  const langInfo = detectLanguage(filePath);

  if (!langInfo) {
    // Unknown language, use fallback
    return fallbackMapper(filePath, signal);
  }

  // Try language-specific mapper
  const mapper = MAPPERS[langInfo.id];

  if (mapper) {
    const result = await mapper(filePath, signal);
    if (result) {
      return result;
    }
    // Mapper failed, fall through to fallback
  }

  // Use fallback mapper
  return fallbackMapper(filePath, signal);
}

/**
 * Check if a file should have a map generated.
 * Returns true if the file exceeds the truncation threshold.
 */
export function shouldGenerateMap(
  totalLines: number,
  totalBytes: number
): boolean {
  return totalLines > THRESHOLDS.MAX_LINES || totalBytes > THRESHOLDS.MAX_BYTES;
}
