import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { promisify } from "node:util";

import type { FileMap, FileSymbol } from "../types.js";

import { DetailLevel, SymbolKind } from "../enums.js";

const execAsync = promisify(exec);

/**
 * Codemap JSON symbol structure.
 */
interface CodemapSymbol {
  name: string;
  kind: string;
  signature?: string;
  lines: [number, number];
  exported: boolean;
  is_default: boolean;
  is_async: boolean;
  is_static: boolean;
  is_abstract: boolean;
  parent_name: string | null;
  comment?: string;
}

interface CodemapFile {
  path: string;
  language: string;
  lines: [number, number];
  detail_level: string;
  token_estimate: number;
  symbols: CodemapSymbol[];
}

interface CodemapOutput {
  stats: unknown;
  total_tokens: number;
  codebase_tokens: number;
  files: CodemapFile[];
}

/**
 * Map codemap kinds to our SymbolKind.
 */
function mapKind(kind: string): SymbolKind {
  switch (kind) {
    case "class": {
      return SymbolKind.Class;
    }
    case "interface": {
      return SymbolKind.Interface;
    }
    case "function": {
      return SymbolKind.Function;
    }
    case "method": {
      return SymbolKind.Method;
    }
    case "variable":
    case "const":
    case "let": {
      return SymbolKind.Variable;
    }
    case "type":
    case "type_alias": {
      return SymbolKind.Type;
    }
    case "enum": {
      return SymbolKind.Enum;
    }
    case "property": {
      return SymbolKind.Variable;
    }
    case "heading": {
      return SymbolKind.Class;
    } // For markdown headings
    default: {
      return SymbolKind.Unknown;
    }
  }
}

/**
 * Convert codemap symbols to our FileSymbol format.
 * Groups children under their parents.
 */
function convertSymbols(codemapSymbols: CodemapSymbol[]): FileSymbol[] {
  const symbolMap = new Map<string, FileSymbol>();
  const rootSymbols: FileSymbol[] = [];

  // First pass: create all symbols
  for (const cs of codemapSymbols) {
    const symbol: FileSymbol = {
      name: cs.name,
      kind: mapKind(cs.kind),
      startLine: cs.lines[0],
      endLine: cs.lines[1],
    };

    if (cs.signature) {
      symbol.signature = cs.signature;
    }

    const modifiers: string[] = [];
    if (cs.is_async) {
      modifiers.push("async");
    }
    if (cs.is_static) {
      modifiers.push("static");
    }
    if (cs.is_abstract) {
      modifiers.push("abstract");
    }
    if (cs.exported) {
      modifiers.push("export");
    }
    if (cs.is_default) {
      modifiers.push("default");
    }

    if (modifiers.length > 0) {
      symbol.modifiers = modifiers;
    }

    // Store with a key for parent lookup
    symbolMap.set(cs.name, symbol);

    if (cs.parent_name && symbolMap.has(cs.parent_name)) {
      // Add as child of parent
      const parent = symbolMap.get(cs.parent_name);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(symbol);
      }
    } else {
      rootSymbols.push(symbol);
    }
  }

  return rootSymbols;
}

/**
 * Map language name to display name.
 */
function getLanguageDisplayName(language: string): string {
  const names: Record<string, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    markdown: "Markdown",
    cpp: "C++",
    c: "C",
    rust: "Rust",
  };
  return names[language] ?? language;
}

/**
 * Generate a file map using codemap CLI.
 */
export async function codemapMapper(
  filePath: string,
  signal?: AbortSignal
): Promise<FileMap | null> {
  try {
    const stats = await stat(filePath);
    const totalBytes = stats.size;

    // Codemap works best when run from the file's directory with a relative path
    const fileDir = dirname(filePath);
    const fileName = basename(filePath);

    // Run codemap to get JSON output
    const { stdout, stderr } = await execAsync(
      `codemap "${fileName}" -o json 2>/dev/null`,
      {
        signal,
        timeout: 30_000, // 30s timeout for large files
        maxBuffer: 5 * 1024 * 1024, // 5MB buffer
        cwd: fileDir,
      }
    );

    if (!stdout) {
      if (stderr) {
        console.error(`Codemap mapper stderr: ${stderr}`);
      }
      return null;
    }

    const output: CodemapOutput = JSON.parse(stdout);

    if (!output.files || output.files.length === 0) {
      console.error("Codemap returned no files");
      return null;
    }

    const [file] = output.files;
    if (!file) {
      console.error("Codemap returned empty file array");
      return null;
    }

    const [, totalLines] = file.lines;
    const symbols = convertSymbols(file.symbols);

    return {
      path: filePath,
      totalLines,
      totalBytes,
      language: getLanguageDisplayName(file.language),
      symbols,
      detailLevel: DetailLevel.Full,
    };
  } catch (error) {
    if (signal?.aborted) {
      return null;
    }
    console.error(`Codemap mapper failed: ${error}`);
    return null;
  }
}
