# Pathological Budget Implementation Plan

## Problem Statement

Files with extreme symbol counts (5,000+) exceed the 20KB map budget even at the Outline detail level. The current `formatFileMapWithBudget()` function falls through all detail levels and returns an oversized map.

**Evidence**:
```bash
# tests/fixtures/pathological/many-symbols.py (5,000 functions)
# Produces 135KB map at Outline level
```

**Current behavior**:
```typescript
// formatter.ts - formatFileMapWithBudget()
for (const level of levels) {
  const reduced = reduceToLevel(map, level);
  const formatted = formatFileMap(reduced, level);
  if (size <= maxBytes) return formatted;
}
// If nothing fits, return Outline anyway (oversized)
return formatFileMap(outline, DetailLevel.Outline);
```

## Proposed Solution

Implement a **Truncated Outline** fallback that shows a representative sample of symbols when even Outline exceeds budget.

### Design

```
───────────────────────────────────────
File Map: many-symbols.py
20,001 lines │ 481 KB │ Python
───────────────────────────────────────

[Truncated: showing 100 of 5,000 symbols]

def function_0: [2-4]
def function_1: [5-7]
def function_2: [8-10]
... (50 symbols)
def function_49: [149-151]

  ─ ─ ─ 4,900 more symbols ─ ─ ─

def function_4950: [14852-14854]
def function_4951: [14855-14857]
... (50 symbols)
def function_4999: [14999-15001]

───────────────────────────────────────
Use read(path, offset=LINE, limit=N) for targeted reads.
───────────────────────────────────────
```

### Budget Tiers

| Tier | Detail Level | Target Size | Trigger |
|------|--------------|-------------|---------|
| 1 | Full | ≤10 KB | Default |
| 2 | Compact | ≤15 KB | Full > 10KB |
| 3 | Minimal | ≤20 KB | Compact > 15KB |
| 4 | Outline | ≤50 KB | Minimal > 20KB |
| 5 | **Truncated** | ≤100 KB | Outline > 50KB |

**Key changes**:
- Raise Outline budget to 50KB (from 20KB implicit)
- Add Truncated level with 100KB hard cap
- Truncated shows first 50 + last 50 symbols (configurable)

## Implementation

### 1. Add New Detail Level

**File**: `src/enums.ts`

```typescript
export enum DetailLevel {
  Full = "full",
  Compact = "compact",
  Minimal = "minimal",
  Outline = "outline",
  Truncated = "truncated",  // NEW
}
```

### 2. Update Constants

**File**: `src/constants.ts`

```typescript
export const THRESHOLDS = {
  MAX_LINES: 2000,
  MAX_BYTES: 50 * 1024,
  MAX_MAP_BYTES: 20 * 1024,           // Existing (for Full/Compact/Minimal)
  MAX_OUTLINE_BYTES: 50 * 1024,       // NEW: Outline budget
  MAX_TRUNCATED_BYTES: 100 * 1024,    // NEW: Truncated hard cap
  TRUNCATED_SYMBOLS_EACH: 50,         // NEW: Show first/last N symbols
};
```

### 3. Implement reduceToTruncated()

**File**: `src/formatter.ts`

```typescript
/**
 * Reduce a file map to truncated form: first N + last N symbols only.
 * Used when even Outline level exceeds budget.
 */
export function reduceToTruncated(
  map: FileMap,
  symbolsEach: number = THRESHOLDS.TRUNCATED_SYMBOLS_EACH
): FileMap {
  const { symbols } = map;
  const total = symbols.length;
  
  if (total <= symbolsEach * 2) {
    // Not enough symbols to truncate, return as-is
    return reduceToLevel(map, DetailLevel.Outline);
  }
  
  const firstSymbols = symbols.slice(0, symbolsEach).map(s => ({
    name: s.name,
    kind: s.kind,
    startLine: s.startLine,
    endLine: s.endLine,
    // No children, no signature, no modifiers
  }));
  
  const lastSymbols = symbols.slice(-symbolsEach).map(s => ({
    name: s.name,
    kind: s.kind,
    startLine: s.startLine,
    endLine: s.endLine,
  }));
  
  return {
    ...map,
    symbols: [...firstSymbols, ...lastSymbols],
    detailLevel: DetailLevel.Truncated,
    truncatedInfo: {
      totalSymbols: total,
      shownSymbols: symbolsEach * 2,
      omittedSymbols: total - (symbolsEach * 2),
    },
  };
}
```

### 4. Update FileMap Type

**File**: `src/types.ts`

```typescript
export interface TruncatedInfo {
  totalSymbols: number;
  shownSymbols: number;
  omittedSymbols: number;
}

export interface FileMap {
  path: string;
  totalLines: number;
  totalBytes: number;
  language: string;
  symbols: FileSymbol[];
  imports?: string[];
  detailLevel?: DetailLevel;
  truncatedInfo?: TruncatedInfo;  // NEW
}
```

### 5. Update formatFileMap()

**File**: `src/formatter.ts`

Add handling for truncated maps:

```typescript
export function formatFileMap(
  map: FileMap,
  level: DetailLevel = DetailLevel.Full
): string {
  const lines: string[] = [];
  
  // Header (unchanged)
  lines.push(BOX_LINE);
  lines.push(`File Map: ${basename(map.path)}`);
  lines.push(`${map.totalLines.toLocaleString()} lines │ ${formatBytes(map.totalBytes)} │ ${map.language}`);
  lines.push(BOX_LINE);
  lines.push("");
  
  // Truncation notice (NEW)
  if (map.truncatedInfo) {
    const { shownSymbols, totalSymbols } = map.truncatedInfo;
    lines.push(`[Truncated: showing ${shownSymbols} of ${totalSymbols.toLocaleString()} symbols]`);
    lines.push("");
  }
  
  // Imports (if present and not truncated)
  if (map.imports?.length && level !== DetailLevel.Truncated) {
    lines.push(`imports: ${map.imports.join(", ")}`);
    lines.push("");
  }
  
  // Symbols
  if (map.truncatedInfo) {
    // Truncated format: first N, separator, last N
    const half = Math.floor(map.symbols.length / 2);
    const firstSymbols = map.symbols.slice(0, half);
    const lastSymbols = map.symbols.slice(half);
    
    for (const symbol of firstSymbols) {
      lines.push(formatSymbolLine(symbol, 0, level));
    }
    
    lines.push("");
    lines.push(`  ─ ─ ─ ${map.truncatedInfo.omittedSymbols.toLocaleString()} more symbols ─ ─ ─`);
    lines.push("");
    
    for (const symbol of lastSymbols) {
      lines.push(formatSymbolLine(symbol, 0, level));
    }
  } else {
    // Normal format
    for (const symbol of map.symbols) {
      lines.push(...formatSymbol(symbol, 0, level));
    }
  }
  
  // Footer
  lines.push("");
  lines.push(BOX_LINE);
  lines.push("Use read(path, offset=LINE, limit=N) for targeted reads.");
  lines.push(BOX_LINE);
  
  return lines.join("\n");
}
```

### 6. Update formatFileMapWithBudget()

**File**: `src/formatter.ts`

```typescript
export function formatFileMapWithBudget(
  map: FileMap,
  maxBytes = THRESHOLDS.MAX_TRUNCATED_BYTES  // Use highest budget as default
): string {
  // Progressive reduction with tiered budgets
  const tiers: Array<{ level: DetailLevel; budget: number }> = [
    { level: DetailLevel.Full, budget: 10 * 1024 },
    { level: DetailLevel.Compact, budget: 15 * 1024 },
    { level: DetailLevel.Minimal, budget: 20 * 1024 },
    { level: DetailLevel.Outline, budget: THRESHOLDS.MAX_OUTLINE_BYTES },
  ];

  for (const { level, budget } of tiers) {
    const reduced = reduceToLevel(map, level);
    const formatted = formatFileMap(reduced, level);
    const size = Buffer.byteLength(formatted, "utf8");

    if (size <= budget && size <= maxBytes) {
      return formatted;
    }
  }

  // Outline exceeded budget - try truncated
  const truncated = reduceToTruncated(map);
  const formatted = formatFileMap(truncated, DetailLevel.Truncated);
  const size = Buffer.byteLength(formatted, "utf8");

  if (size <= maxBytes) {
    return formatted;
  }

  // Even truncated exceeds budget - reduce symbol count further
  // Binary search for the right number of symbols
  let symbolsEach = THRESHOLDS.TRUNCATED_SYMBOLS_EACH;
  while (symbolsEach > 10) {
    symbolsEach = Math.floor(symbolsEach / 2);
    const reduced = reduceToTruncated(map, symbolsEach);
    const fmt = formatFileMap(reduced, DetailLevel.Truncated);
    if (Buffer.byteLength(fmt, "utf8") <= maxBytes) {
      return fmt;
    }
  }

  // Absolute fallback: 10 first + 10 last symbols (guaranteed to fit)
  const minimal = reduceToTruncated(map, 10);
  return formatFileMap(minimal, DetailLevel.Truncated);
}
```

## Testing

### Unit Tests

**File**: `tests/unit/formatter-truncated.test.ts`

```typescript
describe("truncated outline", () => {
  it("reduceToTruncated keeps first N and last N symbols", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);
    
    expect(truncated.symbols).toHaveLength(100);
    expect(truncated.symbols[0].name).toBe("symbol_0");
    expect(truncated.symbols[99].name).toBe("symbol_999");
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

  it("formats with omitted symbols separator", () => {
    const map = createMapWithSymbols(1000);
    const truncated = reduceToTruncated(map, 50);
    const formatted = formatFileMap(truncated, DetailLevel.Truncated);
    
    expect(formatted).toContain("─ ─ ─ 900 more symbols ─ ─ ─");
  });

  it("stays under 100KB for 5000+ symbols", () => {
    const map = createMapWithSymbols(5000);
    const formatted = formatFileMapWithBudget(map);
    const size = Buffer.byteLength(formatted, "utf8");
    
    expect(size).toBeLessThanOrEqual(100 * 1024);
  });

  it("does not truncate small symbol counts", () => {
    const map = createMapWithSymbols(50);
    const truncated = reduceToTruncated(map, 50);
    
    expect(truncated.truncatedInfo).toBeUndefined();
    expect(truncated.symbols).toHaveLength(50);
  });

  it("binary search finds optimal symbol count", () => {
    // Create map with very long symbol names
    const map = createMapWithLongNames(10000, 200); // 200 char names
    const formatted = formatFileMapWithBudget(map, 50 * 1024);
    const size = Buffer.byteLength(formatted, "utf8");
    
    expect(size).toBeLessThanOrEqual(50 * 1024);
  });
});
```

### Integration Test

**File**: `tests/integration/budget-enforcement.test.ts` (addition)

```typescript
it("pathological file stays under 100KB budget", async () => {
  const map = await generateMap("tests/fixtures/pathological/many-symbols.py");
  const formatted = formatFileMapWithBudget(map!);
  const size = Buffer.byteLength(formatted, "utf8");
  
  expect(size).toBeLessThanOrEqual(100 * 1024);
  expect(formatted).toContain("more symbols");
});
```

### E2E Test

**File**: `tests/e2e/read-pathological.test.ts`

```typescript
it("handles 5000+ symbol file within budget", async () => {
  const result = await runPiSession({
    prompt: 'Read tests/fixtures/pathological/many-symbols.py',
    timeout: 120_000,
  });
  
  const output = result.getToolOutput();
  expect(output).toContain("File Map:");
  expect(output).toContain("more symbols");
  
  // Verify total output is reasonable
  expect(output!.length).toBeLessThan(150 * 1024);
});
```

## Migration Notes

### Backward Compatibility

- Existing maps under 50KB are unaffected
- `DetailLevel.Truncated` is additive (new enum value)
- `truncatedInfo` is optional field on FileMap

### Performance Impact

- `reduceToTruncated()` is O(n) but only called for pathological cases
- Binary search adds at most 4-5 iterations for extreme cases
- No impact on typical files

## Success Criteria

- [ ] Files with 5,000+ symbols produce maps ≤100KB
- [ ] Truncated maps show first 50 + last 50 symbols
- [ ] Separator clearly indicates omitted symbol count
- [ ] All existing tests continue to pass
- [ ] New unit tests for truncation logic pass
- [ ] Pathological fixture test passes

## Estimated Effort

| Task | Time |
|------|------|
| Add DetailLevel.Truncated enum | 5 min |
| Update constants | 5 min |
| Implement reduceToTruncated() | 20 min |
| Update formatFileMap() for truncated | 20 min |
| Update formatFileMapWithBudget() | 15 min |
| Add TruncatedInfo type | 5 min |
| Unit tests | 30 min |
| Integration/E2E tests | 15 min |
| **Total** | **~2 hours** |

## Files Changed

```
src/enums.ts           # Add DetailLevel.Truncated
src/constants.ts       # Add budget thresholds
src/types.ts           # Add TruncatedInfo interface
src/formatter.ts       # Main implementation
tests/unit/formatter-truncated.test.ts  # New test file
tests/e2e/read-pathological.test.ts     # New E2E test
```
