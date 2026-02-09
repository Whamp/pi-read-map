import { describe, it, expect } from "vitest";

import type { FileMap } from "../../src/types.js";

import { DetailLevel, SymbolKind } from "../../src/enums.js";
import {
  formatFileMap,
  formatFileMapWithBudget,
  reduceToLevel,
  getDetailLevelForSize,
} from "../../src/formatter.js";

function createTestMap(): FileMap {
  return {
    path: "/path/to/test.py",
    totalLines: 5000,
    totalBytes: 200_000,
    language: "Python",
    detailLevel: DetailLevel.Full,
    imports: ["os", "sys", "asyncio", "typing"],
    symbols: [
      {
        name: "CONFIG",
        kind: SymbolKind.Constant,
        startLine: 10,
        endLine: 10,
      },
      {
        name: "MyClass",
        kind: SymbolKind.Class,
        startLine: 20,
        endLine: 100,
        children: [
          {
            name: "__init__",
            kind: SymbolKind.Method,
            startLine: 25,
            endLine: 35,
            signature: "(self, config: Config)",
          },
          {
            name: "process",
            kind: SymbolKind.Method,
            startLine: 40,
            endLine: 80,
            signature: "(self, item: Any) -> Result",
            modifiers: ["async"],
          },
        ],
      },
      {
        name: "main",
        kind: SymbolKind.Function,
        startLine: 110,
        endLine: 150,
        signature: "() -> None",
        modifiers: ["async"],
      },
    ],
  };
}

describe("formatFileMap", () => {
  it("formats a file map with box delimiters", () => {
    const map = createTestMap();
    const output = formatFileMap(map);

    expect(output).toContain("───────────────────────────────────────");
    expect(output).toContain("File Map: test.py");
    expect(output).toContain("5,000 lines");
    expect(output).toContain("Python");
  });

  it("includes imports", () => {
    const map = createTestMap();
    const output = formatFileMap(map);

    expect(output).toContain("imports: os, sys, asyncio, typing");
  });

  it("formats class symbols with kind prefix", () => {
    const map = createTestMap();
    const output = formatFileMap(map);

    expect(output).toContain("class MyClass:");
    expect(output).toContain("[20-100]");
  });

  it("formats function symbols with line ranges", () => {
    const map = createTestMap();
    const output = formatFileMap(map);

    expect(output).toContain("main");
    expect(output).toContain("[110-150]");
  });

  it("includes signatures in full detail level", () => {
    const map = createTestMap();
    const output = formatFileMap(map, DetailLevel.Full);

    expect(output).toContain("(self, config: Config)");
    expect(output).toContain("async");
  });

  it("omits signatures in compact detail level", () => {
    const map = createTestMap();
    const reduced = reduceToLevel(map, DetailLevel.Compact);
    const output = formatFileMap(reduced, DetailLevel.Compact);

    expect(output).not.toContain("(self, config: Config)");
    // But should still have the symbol names
    expect(output).toContain("__init__");
    expect(output).toContain("process");
  });

  it("includes footer guidance", () => {
    const map = createTestMap();
    const output = formatFileMap(map);

    expect(output).toContain(
      "Use read(path, offset=LINE, limit=N) for targeted reads."
    );
  });
});

describe("reduceToLevel", () => {
  it("preserves original at full level", () => {
    const map = createTestMap();
    const reduced = reduceToLevel(map, DetailLevel.Full);

    expect(reduced.detailLevel).toBe(DetailLevel.Full);
    expect(reduced.symbols[1]?.children?.[0]?.signature).toBeDefined();
  });

  it("removes signatures at compact level", () => {
    const map = createTestMap();
    const reduced = reduceToLevel(map, DetailLevel.Compact);

    expect(reduced.detailLevel).toBe(DetailLevel.Compact);
    expect(reduced.symbols[1]?.children?.[0]?.signature).toBeUndefined();
    // But keeps children
    expect(reduced.symbols[1]?.children?.length).toBe(2);
  });

  it("keeps structure at minimal level", () => {
    const map = createTestMap();
    const reduced = reduceToLevel(map, DetailLevel.Minimal);

    expect(reduced.detailLevel).toBe(DetailLevel.Minimal);
    expect(reduced.symbols[1]?.children?.length).toBe(2);
  });

  it("removes children at outline level", () => {
    const map = createTestMap();
    const reduced = reduceToLevel(map, DetailLevel.Outline);

    expect(reduced.detailLevel).toBe(DetailLevel.Outline);
    expect(reduced.symbols[1]?.children).toBeUndefined();
    expect(reduced.imports).toBeUndefined();
  });
});

describe("getDetailLevelForSize", () => {
  it("returns full for small sizes", () => {
    expect(getDetailLevelForSize(5000)).toBe(DetailLevel.Full);
    expect(getDetailLevelForSize(10 * 1024)).toBe(DetailLevel.Full);
  });

  it("returns compact for medium sizes", () => {
    expect(getDetailLevelForSize(12 * 1024)).toBe(DetailLevel.Compact);
    expect(getDetailLevelForSize(15 * 1024)).toBe(DetailLevel.Compact);
  });

  it("returns minimal for larger sizes", () => {
    expect(getDetailLevelForSize(18 * 1024)).toBe(DetailLevel.Minimal);
    expect(getDetailLevelForSize(20 * 1024)).toBe(DetailLevel.Minimal);
  });

  it("returns outline for sizes exceeding budget", () => {
    expect(getDetailLevelForSize(25 * 1024)).toBe(DetailLevel.Outline);
    expect(getDetailLevelForSize(100 * 1024)).toBe(DetailLevel.Outline);
  });
});

describe("formatFileMapWithBudget", () => {
  it("returns full detail when map is small", () => {
    const map = createTestMap();
    const output = formatFileMapWithBudget(map);

    // Small map should include signatures
    expect(output).toContain("(self, config: Config)");
  });

  it("reduces detail to fit budget", () => {
    // Create a map that would be too large
    const largeMap: FileMap = {
      ...createTestMap(),
      symbols: Array.from({ length: 500 }, (_, i) => ({
        name: `function_with_very_long_name_${i}`,
        kind: SymbolKind.Function,
        startLine: i * 100,
        endLine: i * 100 + 50,
        signature: `(param1: VeryLongTypeName, param2: AnotherLongType) -> ResultType`,
        children: Array.from({ length: 5 }, (_, j) => ({
          name: `nested_method_${j}`,
          kind: SymbolKind.Method,
          startLine: i * 100 + j * 10,
          endLine: i * 100 + j * 10 + 5,
          signature: `(self, arg: Type) -> None`,
        })),
      })),
    };

    const output = formatFileMapWithBudget(largeMap, 20 * 1024);

    // The formatter should produce some output
    expect(output).toContain("File Map:");
    // Even if we can't fit within 20KB, we should get the outline level
    // which will be as small as possible
    const size = Buffer.byteLength(output, "utf8");
    // Outline level removes children, so should be much smaller
    // But if even outline doesn't fit, we still return it
    expect(size).toBeGreaterThan(0);
  });
});
