# Handoff: Implement Pathological Budget (Truncated Outline)

## Task

Implement truncated outline support for extreme files (5,000+ symbols) following the plan in `docs/plans/pathological-budget.md`.

## Project Location

```
/home/will/projects/pi-read-map
```

## Problem

Files with 5,000+ symbols exceed the 20KB map budget even at the Outline detail level. Currently, the extension returns an oversized map (135KB for the test fixture).

**Evidence**:
```bash
# tests/fixtures/pathological/many-symbols.py has 5,000 functions
# Current output: 135KB map (should be ≤100KB)
```

## Solution Summary

Add a **Truncated** detail level that shows first 50 + last 50 symbols with a separator indicating omitted count.

**Expected output**:
```
───────────────────────────────────────
File Map: many-symbols.py
20,001 lines │ 481 KB │ Python
───────────────────────────────────────

[Truncated: showing 100 of 5,000 symbols]

def function_0: [2-4]
def function_1: [5-7]
... (48 more)
def function_49: [149-151]

  ─ ─ ─ 4,900 more symbols ─ ─ ─

def function_4950: [14852-14854]
... (48 more)
def function_4999: [14999-15001]

───────────────────────────────────────
Use read(path, offset=LINE, limit=N) for targeted reads.
───────────────────────────────────────
```

## Files to Modify

### 1. `src/enums.ts`

Add new detail level:

```typescript
export enum DetailLevel {
  Full = "full",
  Compact = "compact",
  Minimal = "minimal",
  Outline = "outline",
  Truncated = "truncated",  // ADD THIS
}
```

### 2. `src/constants.ts`

Add new thresholds:

```typescript
export const THRESHOLDS = {
  MAX_LINES: 2000,
  MAX_BYTES: 50 * 1024,
  MAX_MAP_BYTES: 20 * 1024,
  MAX_OUTLINE_BYTES: 50 * 1024,       // ADD: Outline budget
  MAX_TRUNCATED_BYTES: 100 * 1024,    // ADD: Truncated hard cap
  TRUNCATED_SYMBOLS_EACH: 50,         // ADD: Show first/last N
};
```

### 3. `src/types.ts`

Add truncated info interface:

```typescript
export interface TruncatedInfo {
  totalSymbols: number;
  shownSymbols: number;
  omittedSymbols: number;
}

export interface FileMap {
  // ... existing fields ...
  truncatedInfo?: TruncatedInfo;  // ADD THIS
}
```

### 4. `src/formatter.ts`

Main implementation - add these functions/changes:

```typescript
/**
 * Reduce a file map to truncated form: first N + last N symbols only.
 */
export function reduceToTruncated(
  map: FileMap,
  symbolsEach: number = THRESHOLDS.TRUNCATED_SYMBOLS_EACH
): FileMap {
  // Implementation in plan
}
```

Update `formatFileMap()`:
- Add truncation notice header when `map.truncatedInfo` exists
- Format symbols with separator between first and last groups

Update `formatFileMapWithBudget()`:
- Add tiered budgets (Outline at 50KB, Truncated at 100KB)
- Add binary search fallback for extreme cases
- Guaranteed minimum: 10 first + 10 last symbols

## New Test File

**File**: `tests/unit/formatter-truncated.test.ts`

```typescript
describe("truncated outline", () => {
  it("reduceToTruncated keeps first N and last N symbols");
  it("includes truncatedInfo metadata");
  it("formats with omitted symbols separator");
  it("stays under 100KB for 5000+ symbols");
  it("does not truncate small symbol counts");
  it("binary search finds optimal symbol count");
});
```

## Validation Commands

```bash
# Run unit tests
npm test

# Run specific test file
npm test -- formatter-truncated

# Verify pathological fixture works
npm test -- --grep "pathological"

# Full validation
npm run validate && npm test && npm run test:e2e
```

## Test Fixture

Already exists: `tests/fixtures/pathological/many-symbols.py` (5,000 functions, 20,001 lines)

## Success Criteria

- [ ] `DetailLevel.Truncated` added to enums
- [ ] New thresholds added to constants
- [ ] `TruncatedInfo` interface added to types
- [ ] `reduceToTruncated()` function implemented
- [ ] `formatFileMap()` handles truncated maps
- [ ] `formatFileMapWithBudget()` uses tiered budgets
- [ ] Pathological fixture produces map ≤100KB
- [ ] All existing tests still pass
- [ ] New unit tests pass
- [ ] `npm run validate` passes

## Commit Message

```
Add truncated outline for pathological files (5000+ symbols)

- Add DetailLevel.Truncated showing first 50 + last 50 symbols
- Tiered budgets: Outline at 50KB, Truncated at 100KB
- Binary search fallback for extreme cases
- Separator shows "─ ─ ─ N more symbols ─ ─ ─"

Files with 5,000+ symbols now produce maps ≤100KB instead of 135KB+.
```

## Key Implementation Details

### Budget Tiers

| Tier | Level | Budget |
|------|-------|--------|
| 1 | Full | ≤10 KB |
| 2 | Compact | ≤15 KB |
| 3 | Minimal | ≤20 KB |
| 4 | Outline | ≤50 KB |
| 5 | Truncated | ≤100 KB |

### Binary Search Fallback

If truncated with 50+50 symbols still exceeds budget:
1. Try 25+25 symbols
2. Try 12+12 symbols
3. Fallback to 10+10 symbols (guaranteed to fit)

### Separator Format

```
  ─ ─ ─ 4,900 more symbols ─ ─ ─
```

Use `toLocaleString()` for number formatting.

## Estimated Time

~2 hours total

## Reference

Full implementation details in `docs/plans/pathological-budget.md`
