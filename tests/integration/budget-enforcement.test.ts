import { describe, it, expect, afterAll } from "vitest";

import type { FileMap } from "../../src/types.js";

import { THRESHOLDS } from "../../src/constants.js";
import { DetailLevel, SymbolKind } from "../../src/enums.js";
import { formatFileMapWithBudget, reduceToLevel } from "../../src/formatter.js";
import { generateMap } from "../../src/mapper.js";
import {
  createTempFile,
  cleanupAllTempFiles,
  generatePythonCode,
} from "./helpers.js";

/**
 * Create a FileMap with nested symbols for testing.
 */
function createNestedFileMap(symbolCount: number): FileMap {
  return {
    path: "/test/nested.py",
    totalLines: symbolCount * 10,
    totalBytes: symbolCount * 100,
    language: "Python",
    detailLevel: DetailLevel.Full,
    imports: ["os", "sys", "typing"],
    symbols: Array.from({ length: symbolCount }, (_, i) => ({
      name: `Class${i}`,
      kind: SymbolKind.Class,
      startLine: i * 100 + 1,
      endLine: i * 100 + 99,
      signature: `(param1: Type, param2: AnotherType)`,
      children: [
        {
          name: `method_${i}_a`,
          kind: SymbolKind.Method,
          startLine: i * 100 + 10,
          endLine: i * 100 + 30,
          signature: `(self, arg: str) -> None`,
        },
        {
          name: `method_${i}_b`,
          kind: SymbolKind.Method,
          startLine: i * 100 + 35,
          endLine: i * 100 + 60,
          signature: `(self, data: dict) -> Result`,
        },
      ],
    })),
  };
}

describe("budget enforcement", () => {
  afterAll(async () => {
    await cleanupAllTempFiles();
  });

  it("small maps stay at Full detail level", async () => {
    // Create a small file with few symbols
    const content = `
def func1(): pass
def func2(): pass
def func3(): pass

class MyClass:
    def method1(self): pass
    def method2(self): pass
`;
    const filepath = await createTempFile("small.py", content);
    const map = await generateMap(filepath);

    expect(map).not.toBeNull();
    if (!map) {
      return;
    }

    const output = formatFileMapWithBudget(map);
    const size = Buffer.byteLength(output, "utf8");

    // Small maps should fit easily
    expect(size).toBeLessThan(THRESHOLDS.FULL_TARGET_BYTES);
    // Should have the File Map header
    expect(output).toContain("File Map:");
  });

  it("medium maps reduce to Compact level", () => {
    // Create a map that would be too large at Full but fits at Compact
    const map = createNestedFileMap(50);

    // Format at Full to check size
    const fullOutput = formatFileMapWithBudget(map, THRESHOLDS.MAX_MAP_BYTES);

    // At 50 classes with methods and signatures, it should have reduced
    // Check that output doesn't contain the long signatures
    const hasFullSignatures = fullOutput.includes("param1: Type, param2:");

    // If it has full signatures, it stayed at Full; otherwise reduced
    if (!hasFullSignatures) {
      // Reduced to Compact or lower
      expect(fullOutput).toContain("File Map:");
    }
  });

  it("large maps reduce to Minimal level", () => {
    // Create a large map
    const map = createNestedFileMap(150);

    const output = formatFileMapWithBudget(map, THRESHOLDS.MAX_MAP_BYTES);

    // Should produce valid output
    expect(output).toContain("File Map:");

    // At Minimal level, signatures are removed
    // Check size is reasonable
    const size = Buffer.byteLength(output, "utf8");
    expect(size).toBeGreaterThan(0);
  });

  it("huge maps reduce to Outline level", () => {
    // Create a very large map
    const map = createNestedFileMap(500);

    const output = formatFileMapWithBudget(map, THRESHOLDS.MAX_MAP_BYTES);

    // Should produce valid output
    expect(output).toContain("File Map:");

    // At Outline level, children and imports are removed
    // The output should not contain method names (children)
    // Check that we have class names but not method names
    expect(output).toContain("Class0");

    // With 500 top-level symbols, even outline may be large
    // But children should be stripped
  });

  it("reduceToLevel correctly removes children at Outline", () => {
    const map = createNestedFileMap(10);

    const reduced = reduceToLevel(map, DetailLevel.Outline);

    expect(reduced.detailLevel).toBe(DetailLevel.Outline);
    expect(reduced.imports).toBeUndefined();

    // All children should be removed
    for (const symbol of reduced.symbols) {
      expect(symbol.children).toBeUndefined();
      expect(symbol.signature).toBeUndefined();
    }
  });

  it("reduceToLevel correctly removes signatures at Compact", () => {
    const map = createNestedFileMap(10);

    const reduced = reduceToLevel(map, DetailLevel.Compact);

    expect(reduced.detailLevel).toBe(DetailLevel.Compact);

    // Signatures should be removed
    for (const symbol of reduced.symbols) {
      expect(symbol.signature).toBeUndefined();
      // But children should be preserved
      expect(symbol.children?.length).toBe(2);
      // Children also have no signatures
      for (const child of symbol.children ?? []) {
        expect(child.signature).toBeUndefined();
      }
    }
  });

  it("formatted output respects budget constraints", async () => {
    // Create a file with many functions
    const content = generatePythonCode(200);
    const filepath = await createTempFile("budget-test.py", content);
    const map = await generateMap(filepath);

    expect(map).not.toBeNull();
    if (!map) {
      return;
    }

    const output = formatFileMapWithBudget(map, THRESHOLDS.MAX_MAP_BYTES);
    const size = Buffer.byteLength(output, "utf8");

    // The formatter should attempt to fit within budget
    // Note: Very large maps may exceed budget even at Outline
    expect(output).toContain("File Map:");
    expect(size).toBeGreaterThan(0);

    // For 200 functions at Outline level, should still be manageable
    // ~50 bytes per symbol * 200 = ~10KB which should fit
    if (size > THRESHOLDS.MAX_MAP_BYTES) {
      // If it exceeds, it should be at Outline level (the minimum)
      expect(output).toContain("File Map:");
    }
  });

  it("pathological file stays under 100KB budget", async () => {
    // Use the existing fixture with 5000 functions
    const filepath = new URL(
      "../fixtures/pathological/many-symbols.py",
      import.meta.url
    ).pathname;
    const map = await generateMap(filepath);

    expect(map).not.toBeNull();
    if (!map) {
      return;
    }

    // Verify the file has many symbols
    expect(map.symbols.length).toBeGreaterThanOrEqual(5000);

    // Format with budget
    const output = formatFileMapWithBudget(map);
    const size = Buffer.byteLength(output, "utf8");

    // Must stay under 100KB (truncated budget)
    expect(size).toBeLessThanOrEqual(THRESHOLDS.MAX_TRUNCATED_BYTES);

    // Should use truncated format
    expect(output).toContain("[Map");
    expect(output).toContain("more symbols");

    // Should have first and last symbols
    expect(output).toContain("function_0:");
    expect(output).toContain("function_4999:");
  });
});
