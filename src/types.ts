import type { DetailLevel, SymbolKind } from "./enums.js";

/**
 * Represents a symbol extracted from a file.
 */
export interface FileSymbol {
  /** Symbol name (e.g., class name, function name) */
  name: string;
  /** Symbol kind */
  kind: SymbolKind;
  /** Starting line number (1-indexed) */
  startLine: number;
  /** Ending line number (1-indexed) */
  endLine: number;
  /** Optional signature (for functions/methods) */
  signature?: string;
  /** Child symbols (for nested structures like methods in classes) */
  children?: FileSymbol[];
  /** Additional modifiers (async, static, etc.) */
  modifiers?: string[];
}

/**
 * Result of generating a file map.
 */
export interface FileMap {
  /** Absolute file path */
  path: string;
  /** Total line count */
  totalLines: number;
  /** Total file size in bytes */
  totalBytes: number;
  /** Detected language */
  language: string;
  /** Extracted symbols */
  symbols: FileSymbol[];
  /** Import list (if applicable) */
  imports?: string[];
  /** Detail level used for this map */
  detailLevel: DetailLevel;
}

/**
 * Map generation options.
 */
export interface MapOptions {
  /** Maximum map size in bytes (default: 20KB) */
  maxBytes?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Language information.
 */
export interface LanguageInfo {
  /** Language identifier */
  id: string;
  /** Display name */
  name: string;
}
