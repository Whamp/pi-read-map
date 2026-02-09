# Integration Tests Implementation Plan

## Overview

Add integration tests to verify component interactions without spawning full pi sessions. These tests fill the gap between unit tests (isolated components) and E2E tests (full pi sessions).

## Current Test Coverage

```
┌─────────────────────────────────────────────────────────────────┐
│  E2E Tests (17 tests) ✅                                        │
│  - Spawns pi with extension loaded                              │
│  - Verifies actual tool output via --mode json                  │
└─────────────────────────────────────────────────────────────────┘
          ▲
┌─────────────────────────────────────────────────────────────────┐
│  Integration Tests (0 tests) ❌ ← THIS PLAN                     │
│  - Extension loading and tool registration                      │
│  - Mapper dispatch routing                                      │
│  - Cache behavior (hits, invalidation)                          │
│  - Budget enforcement (progressive reduction)                   │
└─────────────────────────────────────────────────────────────────┘
          ▲
┌─────────────────────────────────────────────────────────────────┐
│  Unit Tests (118 tests) ✅                                      │
│  - Individual mappers                                           │
│  - Formatter output                                             │
│  - Language detection                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Test Files to Create

```
tests/integration/
├── extension-load.test.ts      # Extension exports and registration
├── mapper-dispatch.test.ts     # Language routing and fallback chains
├── cache-behavior.test.ts      # Map caching by path + mtime
└── budget-enforcement.test.ts  # Progressive detail reduction
```

## Estimated Effort

| Test File | Estimated Time | Priority |
|-----------|---------------|----------|
| extension-load.test.ts | 15 min | High |
| mapper-dispatch.test.ts | 20 min | High |
| cache-behavior.test.ts | 25 min | Medium |
| budget-enforcement.test.ts | 20 min | Medium |
| **Total** | **~80 min** | |

---

## Test Specifications

### 1. Extension Load Tests

**File**: `tests/integration/extension-load.test.ts`

**Purpose**: Verify the extension module exports correctly and registers the read tool when called with the pi API.

**Test Cases**:

```typescript
describe("extension loading", () => {
  it("exports a default function", async () => {
    // Import the extension module
    // Verify default export is a function
  });

  it("registers the read tool when called", async () => {
    // Create mock pi API with registerTool spy
    // Call the extension default function
    // Verify registerTool was called with { name: "read", ... }
  });

  it("registered tool has correct schema", async () => {
    // Capture the tool passed to registerTool
    // Verify: name, label, description exist
    // Verify: parameters includes path, offset, limit
  });

  it("registered tool execute is callable", async () => {
    // Capture the tool
    // Verify execute is an async function
  });
});
```

**Mock Required**:
```typescript
const mockPi = {
  registerTool: vi.fn(),
};
```

---

### 2. Mapper Dispatch Tests

**File**: `tests/integration/mapper-dispatch.test.ts`

**Purpose**: Verify the mapper dispatcher routes files to correct mappers and fallback chains work.

**Test Cases**:

```typescript
describe("mapper dispatch", () => {
  // Setup: create temp files for each language
  
  it("routes .py files to Python mapper", async () => {
    // Create temp .py file with a function
    // Call generateMap()
    // Verify result.language === "Python"
    // Verify symbols include the function
  });

  it("routes .ts files to TypeScript mapper", async () => {
    // Create temp .ts file with class
    // Call generateMap()
    // Verify result.language === "TypeScript"
  });

  it("routes .go files to Go mapper", async () => {
    // Create temp .go file with struct
    // Call generateMap()
    // Verify result.language === "Go"
  });

  it("routes .sql files to SQL mapper", async () => {
    // Create temp .sql file with CREATE TABLE
    // Call generateMap()
    // Verify result.language === "SQL"
  });

  it("routes .json files to JSON mapper", async () => {
    // Create temp .json file
    // Call generateMap()
    // Verify result.language === "JSON"
  });

  it("routes .yaml files to YAML mapper", async () => {
    // Create temp .yaml file
    // Call generateMap()
    // Verify result.language === "YAML"
  });

  it("routes unknown extensions to fallback chain", async () => {
    // Create temp .xyz file with some content
    // Call generateMap()
    // Verify result is not null (fallback worked)
  });

  it("fallback chain tries ctags then grep", async () => {
    // Create temp file with unknown extension
    // Mock or verify ctags is attempted
    // If ctags unavailable, grep fallback used
  });
});
```

**Helper Needed**:
```typescript
async function createTempFile(name: string, content: string): Promise<string> {
  const dir = join(tmpdir(), "pi-read-map-integration");
  await mkdir(dir, { recursive: true });
  const path = join(dir, name);
  await writeFile(path, content);
  return path;
}
```

---

### 3. Cache Behavior Tests

**File**: `tests/integration/cache-behavior.test.ts`

**Purpose**: Verify the map cache works correctly - cache hits, misses, and mtime-based invalidation.

**Challenge**: The cache is internal to `index.ts` and not directly exported. Options:
1. Export the cache for testing (not ideal for production)
2. Test via timing measurements (slower but non-invasive)
3. Add a test hook that can be conditionally enabled

**Recommended Approach**: Use timing measurements to infer cache behavior.

**Test Cases**:

```typescript
describe("cache behavior", () => {
  it("second read is faster than first (cache hit)", async () => {
    // Create large temp file
    // Time first generateMap() call
    // Time second generateMap() call on same file
    // Verify second call is significantly faster (>10x)
  });

  it("cache invalidates when file mtime changes", async () => {
    // Create temp file, generate map
    // Modify file content
    // Touch file to update mtime
    // Generate map again
    // Verify new content is reflected (not stale cache)
  });

  it("different files have separate cache entries", async () => {
    // Create two different temp files
    // Generate map for file A
    // Generate map for file B
    // Verify both have correct content (no cross-pollution)
  });

  it("cache uses absolute path as key", async () => {
    // Create temp file
    // Generate map using relative path
    // Generate map using absolute path
    // Verify both resolve to same cache entry
  });
});
```

**Note**: These tests require access to the actual caching logic in index.ts. May need to:
- Export a `clearMapCache()` function for testing
- Or test indirectly via the tool execute function

---

### 4. Budget Enforcement Tests

**File**: `tests/integration/budget-enforcement.test.ts`

**Purpose**: Verify progressive detail reduction works when maps exceed budget thresholds.

**Test Cases**:

```typescript
describe("budget enforcement", () => {
  it("small maps stay at Full detail level", async () => {
    // Create file with ~10 symbols
    // Generate map and format with budget
    // Verify signatures are present (Full detail)
    // Verify size < 10KB
  });

  it("medium maps reduce to Compact level", async () => {
    // Create file with ~100 symbols with long signatures
    // Generate map and format
    // Check if signatures are removed but nesting preserved
  });

  it("large maps reduce to Minimal level", async () => {
    // Create file with ~500 symbols
    // Generate map and format
    // Verify no signatures, no nesting, just names + line numbers
  });

  it("huge maps reduce to Outline level", async () => {
    // Create file with 1000+ symbols
    // Generate map and format
    // Verify only top-level symbols, no children
  });

  it("formatted output never exceeds 20KB budget", async () => {
    // Use pathological fixture (many-symbols.py)
    // Generate and format map
    // Verify Buffer.byteLength <= 20 * 1024
    // (Note: Currently this FAILS - known issue)
  });

  it("reduceToLevel correctly removes children at Outline", () => {
    // Create FileMap with nested symbols
    // Call reduceToLevel(map, DetailLevel.Outline)
    // Verify all children arrays are empty/undefined
  });

  it("reduceToLevel correctly removes signatures at Compact", () => {
    // Create FileMap with signatures
    // Call reduceToLevel(map, DetailLevel.Compact)
    // Verify signatures are removed but children preserved
  });
});
```

**Direct Function Testing**:
```typescript
import { formatFileMapWithBudget, reduceToLevel } from "../../src/formatter.js";
import { DetailLevel } from "../../src/enums.js";
```

---

## Implementation Steps

### Step 1: Create Test Directory Structure

```bash
mkdir -p tests/integration
```

### Step 2: Create Shared Test Utilities

**File**: `tests/integration/helpers.ts`

```typescript
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const TEMP_DIR = join(tmpdir(), "pi-read-map-integration");

export async function createTempFile(
  filename: string,
  content: string
): Promise<string> {
  const dir = join(TEMP_DIR, randomUUID().slice(0, 8));
  await mkdir(dir, { recursive: true });
  const path = join(dir, filename);
  await writeFile(path, content);
  return path;
}

export async function cleanupTempFiles(): Promise<void> {
  await rm(TEMP_DIR, { recursive: true, force: true });
}

export function generatePythonFile(functionCount: number): string {
  const lines = ["# Generated Python file"];
  for (let i = 0; i < functionCount; i++) {
    lines.push(`def func_${i}(x: int) -> bool:`);
    lines.push(`    return True`);
    lines.push("");
  }
  return lines.join("\n");
}

export function generateTypeScriptFile(classCount: number): string {
  const lines = ["// Generated TypeScript file"];
  for (let i = 0; i < classCount; i++) {
    lines.push(`export class Class${i} {`);
    lines.push(`  method${i}(): void {}`);
    lines.push(`}`);
    lines.push("");
  }
  return lines.join("\n");
}
```

### Step 3: Implement Tests (Priority Order)

1. **extension-load.test.ts** - Quick win, verifies basic setup
2. **mapper-dispatch.test.ts** - Core routing logic
3. **budget-enforcement.test.ts** - Uses existing formatter exports
4. **cache-behavior.test.ts** - May need refactoring for testability

### Step 4: Add npm Script

```json
{
  "scripts": {
    "test:integration": "vitest run tests/integration/",
    "test:all": "npm test && npm run test:integration && npm run test:e2e"
  }
}
```

### Step 5: Update Vitest Config (if needed)

Integration tests can use the default vitest config since they don't need special timeout handling like E2E tests.

---

## Success Criteria

- [ ] `tests/integration/extension-load.test.ts` - 4 tests passing
- [ ] `tests/integration/mapper-dispatch.test.ts` - 8 tests passing  
- [ ] `tests/integration/cache-behavior.test.ts` - 4 tests passing
- [ ] `tests/integration/budget-enforcement.test.ts` - 7 tests passing
- [ ] `npm run test:integration` passes
- [ ] `npm run test:all` passes (unit + integration + e2e)
- [ ] No regressions in existing tests

---

## Known Issues to Address

### Cache Testability

The map cache in `index.ts` is not exported:
```typescript
const mapCache = new Map<string, { mtime: number; map: string }>();
```

**Options**:
1. Export `clearMapCache()` for testing only
2. Add `process.env.NODE_ENV === 'test'` conditional export
3. Test cache indirectly via timing (less precise)

**Recommendation**: Add a `resetMapCache()` export guarded by environment check.

### Budget Overflow

The pathological test case (5,000 functions) exceeds 20KB even at Outline level. Options:
1. Accept this as known limitation (document it)
2. Implement truncated outline: "first 100 + ... + last 100 symbols"
3. Increase budget for Outline level only

**Recommendation**: Document as known limitation, defer fix.

---

## Execution Order

```bash
# 1. Create directory
mkdir -p tests/integration

# 2. Create helpers
# Write tests/integration/helpers.ts

# 3. Create tests in priority order
# Write tests/integration/extension-load.test.ts
# Write tests/integration/mapper-dispatch.test.ts
# Write tests/integration/budget-enforcement.test.ts
# Write tests/integration/cache-behavior.test.ts

# 4. Add npm script
# Update package.json

# 5. Run and verify
npm run test:integration

# 6. Run full suite
npm run test:all
```

---

## Appendix: Test Count Summary

After implementation:

| Category | Current | After |
|----------|---------|-------|
| Unit Tests | 118 | 118 |
| Integration Tests | 0 | ~23 |
| E2E Tests | 17 | 17 |
| **Total** | **135** | **~158** |
