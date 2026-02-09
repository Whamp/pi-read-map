import type { FileMap, MapOptions } from "./types.js";

import { THRESHOLDS } from "./constants.js";
import { detectLanguage } from "./language-detect.js";
import { cMapper } from "./mappers/c.js";
import { codemapMapper } from "./mappers/codemap.js";
import { cppMapper } from "./mappers/cpp.js";
import { csvMapper } from "./mappers/csv.js";
import { ctagsMapper } from "./mappers/ctags.js";
import { fallbackMapper } from "./mappers/fallback.js";
import { goMapper } from "./mappers/go.js";
import { jsonMapper } from "./mappers/json.js";
import { markdownMapper } from "./mappers/markdown.js";
import { pythonMapper } from "./mappers/python.js";
import { rustMapper } from "./mappers/rust.js";
import { sqlMapper } from "./mappers/sql.js";
import { tomlMapper } from "./mappers/toml.js";
import { typescriptMapper } from "./mappers/typescript.js";
import { yamlMapper } from "./mappers/yaml.js";

type MapperFn = (
  filePath: string,
  signal?: AbortSignal
) => Promise<FileMap | null>;

/**
 * Create a mapper with fallback to another mapper.
 */
function withFallback(primary: MapperFn, fallback: MapperFn): MapperFn {
  return async (filePath, signal) => {
    const result = await primary(filePath, signal);
    if (result) {
      return result;
    }
    return fallback(filePath, signal);
  };
}

/**
 * Registry of language-specific mappers.
 *
 * Phase 3: Uses internal tree-sitter/ts-morph mappers with codemap CLI fallback.
 */
const MAPPERS: Record<string, MapperFn> = {
  // Phase 1: Python AST-based
  python: pythonMapper,

  // Phase 2: Go AST-based
  go: goMapper,

  // Phase 3: Internal ts-morph with codemap fallback
  typescript: withFallback(typescriptMapper, codemapMapper),
  javascript: withFallback(typescriptMapper, codemapMapper),

  // Phase 3: Internal regex-based markdown
  markdown: withFallback(markdownMapper, codemapMapper),

  // Phase 3: Internal tree-sitter with codemap fallback
  rust: withFallback(rustMapper, codemapMapper),
  cpp: withFallback(cppMapper, codemapMapper),
  "c-header": withFallback(cppMapper, codemapMapper), // .h files

  // Phase 2: Regex/subprocess mappers
  sql: sqlMapper,
  json: jsonMapper,
  c: cMapper, // .c files use regex

  // Phase 4: Extended coverage
  yaml: yamlMapper,
  toml: tomlMapper,
  csv: csvMapper,
};

/**
 * Generate a structural map for a file.
 *
 * Dispatches to the appropriate language-specific mapper,
 * falling back to ctags (if available) then grep-based extraction.
 */
export async function generateMap(
  filePath: string,
  options: MapOptions = {}
): Promise<FileMap | null> {
  const { signal } = options;

  // Detect language
  const langInfo = detectLanguage(filePath);

  if (!langInfo) {
    // Unknown language, try ctags then fallback
    const ctagsResult = await ctagsMapper(filePath, signal);
    if (ctagsResult) {
      return ctagsResult;
    }
    return fallbackMapper(filePath, signal);
  }

  // Try language-specific mapper
  const mapper = MAPPERS[langInfo.id];

  if (mapper) {
    const result = await mapper(filePath, signal);
    if (result) {
      return result;
    }
    // Mapper failed, fall through to ctags/fallback
  }

  // Try ctags as intermediate fallback (better than grep when available)
  const ctagsResult = await ctagsMapper(filePath, signal);
  if (ctagsResult) {
    return ctagsResult;
  }

  // Use grep-based fallback mapper
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
