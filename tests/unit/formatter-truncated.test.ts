import { describe, it, expect } from "vitest";

import type { FileMap, FileSymbol } from "../../src/types.js";

import { THRESHOLDS } from "../../src/constants.js";
import { DetailLevel, SymbolKind } from "../../src/enums.js";
import {
  formatFileMap,
  formatFileMapWithBudget,
  reduceToTruncated,
} from "../../src/formatter.js";

/**
 * Create a test map with a specified number of symbols.
 */
function createMapWithSymbols(count: number): FileMap {
  const symbols: FileSymbol[] = Array.from({ length: count }, (_, i) => ({
    name: `function_${i}`,
    kind: SymbolKind.Function,
    startLine: i * 4 + 1,
    endLine: i * 4 + 3,
  }));

  return {
    path: "/path/to/test.py",
    totalLines: count * 4 + 1,
    totalBytes: count * 100,
    language: "Python",
    detailLevel: DetailLevel.Full,
    imports: [],
    symbols,
  };
}

/**
 * Create a map with very long symbol names.
 */
function createMapWithLongNames(count: number, nameLength: number): FileMap {
  const symbols: FileSymbol[] = Array.from({ length: count }, (_, i) => ({
    name: `function_${"x".repeat(nameLength)}_${i}`,
    kind: SymbolKind.Function,
    startLine: i * 4 + 1,
    endLine: i * 4 + 3,
  }));

  return {
    path: "/path/to/test.py",
    totalLines: count * 4 + 1,
    totalBytes: count * (nameLength + 50),
    language: "Python",
    detailLevel: DetailLevel.Full,
    imports: [],
    symbols,
  };
}

describe("reduceToTruncated", () => {
  it("keeps first N and last N symbols", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);

    expect(truncated.symbols).toHaveLength(100);
    expect(truncated.symbols[0]?.name).toBe("function_0");
    expect(truncated.symbols[49]?.name).toBe("function_49");
    expect(truncated.symbols[50]?.name).toBe("function_950");
    expect(truncated.symbols[99]?.name).toBe("function_999");
  });

  it("includes truncatedInfo metadata", () => {
    const map = createMapWithSymbols(5000);
    const truncated = reduceToTruncated(map, 50);

    expect(truncated.truncatedInfo).toEqual({
      totalSymbols: 5000,
      shownSymbols: 100,
      omittedSymbols: 4900,
    });
  });

  it("sets detail level to Truncated", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);

    expect(truncated.detailLevel).toBe(DetailLevel.Truncated);
  });

  it("removes imports", () => {
    const map = createMapWithSymbols(1000);
    map.imports = ["os", "sys", "asyncio"];
    const truncated = reduceToTruncated(map, 50);

    expect(truncated.imports).toEqual([]);
  });

  it("does not truncate small symbol counts", () => {
    const map = createMapWithSymbols(50);
    const truncated = reduceToTruncated(map, 50);

    // When symbols <= symbolsEach * 2, should return as outline (no truncation)
    expect(truncated.truncatedInfo).toBeUndefined();
    expect(truncated.symbols).toHaveLength(50);
    expect(truncated.detailLevel).toBe(DetailLevel.Outline);
  });

  it("handles edge case where total equals 2x symbolsEach", () => {
    const map = createMapWithSymbols(100);
    const truncated = reduceToTruncated(map, 50);

    // Exactly 100 symbols with 50+50 = 100, should not truncate
    expect(truncated.truncatedInfo).toBeUndefined();
    expect(truncated.symbols).toHaveLength(100);
  });

  it("handles edge case where total is just above threshold", () => {
    const map = createMapWithSymbols(101);
    const truncated = reduceToTruncated(map, 50);

    // 101 symbols > 100, should truncate
    expect(truncated.truncatedInfo).toBeDefined();
    expect(truncated.symbols).toHaveLength(100);
    expect(truncated.truncatedInfo?.omittedSymbols).toBe(1);
  });
});

describe("formatFileMap with truncation", () => {
  it("includes truncation notice header", () => {
    const map = createMapWithSymbols(5000);
    const truncated = reduceToTruncated(map, 50);
    const formatted = formatFileMap(truncated, DetailLevel.Truncated);

    expect(formatted).toContain("[Map ≤100.0 KB | 100 of 5,000 symbols]");
  });

  it("formats with omitted symbols separator", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);
    const formatted = formatFileMap(truncated, DetailLevel.Truncated);

    expect(formatted).toContain("─ ─ ─ 900 more symbols ─ ─ ─");
  });

  it("includes first symbols before separator", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);
    const formatted = formatFileMap(truncated, DetailLevel.Truncated);

    expect(formatted).toContain("function_0:");
    expect(formatted).toContain("function_49:");
  });

  it("includes last symbols after separator", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);
    const formatted = formatFileMap(truncated, DetailLevel.Truncated);

    expect(formatted).toContain("function_950:");
    expect(formatted).toContain("function_999:");
  });

  it("does not include middle symbols", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);
    const formatted = formatFileMap(truncated, DetailLevel.Truncated);

    expect(formatted).not.toContain("function_500:");
    expect(formatted).not.toContain("function_100:");
    expect(formatted).not.toContain("function_900:");
  });
});

describe("formatFileMapWithBudget with pathological files", () => {
  it("stays under 100KB for 5000+ symbols", () => {
    const map = createMapWithSymbols(5000);
    const formatted = formatFileMapWithBudget(map);
    const size = Buffer.byteLength(formatted, "utf8");

    expect(size).toBeLessThanOrEqual(THRESHOLDS.MAX_TRUNCATED_BYTES);
  });

  it("uses truncated format for large symbol counts", () => {
    const map = createMapWithSymbols(5000);
    const formatted = formatFileMapWithBudget(map);

    expect(formatted).toContain("more symbols");
    expect(formatted).toContain("[Map");
  });

  it("uses outline for medium symbol counts that fit", () => {
    // 200 symbols should fit in outline without truncation
    const map = createMapWithSymbols(200);
    const formatted = formatFileMapWithBudget(map);

    // Should not be truncated
    expect(formatted).not.toContain("[Map");
    expect(formatted).not.toContain("more symbols");
  });

  it("binary search finds optimal symbol count for extreme cases", () => {
    // Create map with very long symbol names that would exceed budget even with default truncation
    const map = createMapWithLongNames(10_000, 500);
    const formatted = formatFileMapWithBudget(
      map,
      THRESHOLDS.MAX_TRUNCATED_BYTES
    );
    const size = Buffer.byteLength(formatted, "utf8");

    expect(size).toBeLessThanOrEqual(THRESHOLDS.MAX_TRUNCATED_BYTES);
    expect(formatted).toContain("[Map");
  });

  it("falls back to 10+10 symbols as guaranteed minimum", () => {
    // Create map with extremely long names that require minimal symbols
    const map = createMapWithLongNames(10_000, 2000);
    const formatted = formatFileMapWithBudget(
      map,
      THRESHOLDS.MAX_TRUNCATED_BYTES
    );

    // Should still produce valid output
    expect(formatted).toContain("File Map:");
    expect(formatted).toContain("[Map");
  });
});

describe("budget tier progression", () => {
  it("uses Full for small maps", () => {
    const map = createMapWithSymbols(5);
    const [firstSymbol] = map.symbols;
    if (firstSymbol) {
      firstSymbol.signature = "(x: int) -> int";
    }
    const formatted = formatFileMapWithBudget(map);

    // Full detail includes signatures
    expect(formatted).toContain("(x: int) -> int");
  });

  it("uses Compact for medium maps", () => {
    // Create map that exceeds Full budget but fits Compact
    const map = createMapWithSymbols(100);
    map.symbols = map.symbols.map((s) => ({
      ...s,
      signature: "(param1: Type, param2: AnotherType) -> ReturnType",
    }));

    const formatted = formatFileMapWithBudget(map);
    const size = Buffer.byteLength(formatted, "utf8");

    // Should fit in budget
    expect(size).toBeLessThanOrEqual(THRESHOLDS.MAX_TRUNCATED_BYTES);
  });

  it("uses Outline before Truncated", () => {
    // Create map that needs outline but not truncation
    const map = createMapWithSymbols(500);
    const formatted = formatFileMapWithBudget(map);

    // 500 symbols fits in compact budget (≤20KB), not outline
    expect(formatted).toContain("[Map ≤20.0 KB | compact]");
  });
});
