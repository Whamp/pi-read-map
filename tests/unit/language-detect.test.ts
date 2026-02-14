import { describe, it, expect } from "vitest";

import {
  detectLanguage,
  getSupportedExtensions,
  isSupported,
} from "../../src/language-detect.js";

describe("detectLanguage", () => {
  it("detects Python files", () => {
    expect(detectLanguage("file.py")).toEqual({ id: "python", name: "Python" });
    expect(detectLanguage("file.pyw")).toEqual({
      id: "python",
      name: "Python",
    });
    expect(detectLanguage("file.pyi")).toEqual({
      id: "python",
      name: "Python",
    });
  });

  it("detects TypeScript files", () => {
    expect(detectLanguage("file.ts")).toEqual({
      id: "typescript",
      name: "TypeScript",
    });
    expect(detectLanguage("file.tsx")).toEqual({
      id: "typescript",
      name: "TypeScript",
    });
    expect(detectLanguage("file.mts")).toEqual({
      id: "typescript",
      name: "TypeScript",
    });
    expect(detectLanguage("file.cts")).toEqual({
      id: "typescript",
      name: "TypeScript",
    });
  });

  it("detects JavaScript files", () => {
    expect(detectLanguage("file.js")).toEqual({
      id: "javascript",
      name: "JavaScript",
    });
    expect(detectLanguage("file.jsx")).toEqual({
      id: "javascript",
      name: "JavaScript",
    });
    expect(detectLanguage("file.mjs")).toEqual({
      id: "javascript",
      name: "JavaScript",
    });
    expect(detectLanguage("file.cjs")).toEqual({
      id: "javascript",
      name: "JavaScript",
    });
  });

  it("detects Go files", () => {
    expect(detectLanguage("file.go")).toEqual({ id: "go", name: "Go" });
  });

  it("detects Rust files", () => {
    expect(detectLanguage("file.rs")).toEqual({ id: "rust", name: "Rust" });
  });

  it("detects C files", () => {
    expect(detectLanguage("file.c")).toEqual({ id: "c", name: "C" });
    expect(detectLanguage("file.h")).toEqual({
      id: "c-header",
      name: "C Header",
    });
  });

  it("detects C++ files", () => {
    expect(detectLanguage("file.cpp")).toEqual({ id: "cpp", name: "C++" });
    expect(detectLanguage("file.cc")).toEqual({ id: "cpp", name: "C++" });
    expect(detectLanguage("file.cxx")).toEqual({ id: "cpp", name: "C++" });
    expect(detectLanguage("file.hpp")).toEqual({ id: "cpp", name: "C++" });
  });

  it("detects Clojure files", () => {
    expect(detectLanguage("file.clj")).toEqual({
      id: "clojure",
      name: "Clojure",
    });
    expect(detectLanguage("file.cljs")).toEqual({
      id: "clojure",
      name: "ClojureScript",
    });
    expect(detectLanguage("file.cljc")).toEqual({
      id: "clojure",
      name: "Clojure",
    });
    expect(detectLanguage("file.edn")).toEqual({
      id: "clojure",
      name: "EDN",
    });
  });

  it("detects SQL files", () => {
    expect(detectLanguage("file.sql")).toEqual({ id: "sql", name: "SQL" });
  });

  it("detects JSON files", () => {
    expect(detectLanguage("file.json")).toEqual({ id: "json", name: "JSON" });
    expect(detectLanguage("file.jsonc")).toEqual({ id: "json", name: "JSON" });
  });

  it("detects JSON Lines files", () => {
    expect(detectLanguage("file.jsonl")).toEqual({
      id: "jsonl",
      name: "JSON Lines",
    });
  });

  it("detects Markdown files", () => {
    expect(detectLanguage("file.md")).toEqual({
      id: "markdown",
      name: "Markdown",
    });
    expect(detectLanguage("file.mdx")).toEqual({
      id: "markdown",
      name: "Markdown",
    });
  });

  it("detects YAML files", () => {
    expect(detectLanguage("file.yml")).toEqual({ id: "yaml", name: "YAML" });
    expect(detectLanguage("file.yaml")).toEqual({ id: "yaml", name: "YAML" });
  });

  it("detects TOML files", () => {
    expect(detectLanguage("file.toml")).toEqual({ id: "toml", name: "TOML" });
  });

  it("detects CSV files", () => {
    expect(detectLanguage("file.csv")).toEqual({ id: "csv", name: "CSV" });
    expect(detectLanguage("file.tsv")).toEqual({ id: "csv", name: "TSV" });
  });

  it("returns null for unknown extensions", () => {
    expect(detectLanguage("file.xyz")).toBeNull();
    expect(detectLanguage("file.unknown")).toBeNull();
    expect(detectLanguage("file")).toBeNull();
  });

  it("handles paths with directories", () => {
    expect(detectLanguage("/path/to/file.py")).toEqual({
      id: "python",
      name: "Python",
    });
    expect(detectLanguage("./relative/path/file.ts")).toEqual({
      id: "typescript",
      name: "TypeScript",
    });
  });

  it("is case insensitive for extensions", () => {
    expect(detectLanguage("file.PY")).toEqual({ id: "python", name: "Python" });
    expect(detectLanguage("file.TS")).toEqual({
      id: "typescript",
      name: "TypeScript",
    });
  });
});

describe("getSupportedExtensions", () => {
  it("returns all supported extensions", () => {
    const extensions = getSupportedExtensions();
    expect(extensions).toContain(".py");
    expect(extensions).toContain(".ts");
    expect(extensions).toContain(".js");
    expect(extensions).toContain(".go");
    expect(extensions).toContain(".rs");
    expect(extensions).toContain(".sql");
  });

  it("returns extensions with dots", () => {
    const extensions = getSupportedExtensions();
    for (const ext of extensions) {
      expect(ext.startsWith(".")).toBe(true);
    }
  });
});

describe("isSupported", () => {
  it("returns true for supported files", () => {
    expect(isSupported("file.py")).toBe(true);
    expect(isSupported("file.ts")).toBe(true);
    expect(isSupported("file.go")).toBe(true);
  });

  it("returns false for unsupported files", () => {
    expect(isSupported("file.xyz")).toBe(false);
    expect(isSupported("file")).toBe(false);
  });
});
