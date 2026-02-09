# Handoff: Implement Integration Tests

## Task

Implement integration tests for the pi-read-map extension following the plan in `docs/plans/integration-tests.md`.

## Project Location

```
/home/will/projects/pi-read-map
```

## Context

pi-read-map is a pi extension that adds structural file mapping for large files. When reading files >2000 lines or >50KB, it generates a map showing symbols with line numbers instead of just truncating.

**Current test coverage**:
- Unit tests: 118 passing (individual mappers, formatter, language detection)
- E2E tests: 17 passing (full pi sessions via `--mode json`)
- Integration tests: **0** ← YOU ARE IMPLEMENTING THIS

## What to Implement

Create 4 test files in `tests/integration/` with ~23 tests total:

### 1. `extension-load.test.ts` (15 min, 4 tests)

Verify the extension module exports correctly and registers the read tool.

```typescript
// Test cases:
// - exports a default function
// - registers the read tool when called with mock pi API
// - registered tool has correct schema (name, label, parameters)
// - registered tool execute is callable
```

### 2. `mapper-dispatch.test.ts` (20 min, 8 tests)

Verify files route to correct mappers based on extension.

```typescript
// Test cases:
// - routes .py files to Python mapper
// - routes .ts files to TypeScript mapper
// - routes .go files to Go mapper
// - routes .sql files to SQL mapper
// - routes .json files to JSON mapper
// - routes .yaml files to YAML mapper
// - routes unknown extensions to fallback chain
// - fallback produces result for unrecognized files
```

### 3. `cache-behavior.test.ts` (25 min, 4 tests)

Verify map caching works correctly.

**Note**: The cache is internal to `index.ts`. Test via timing or add `resetMapCache()` export.

```typescript
// Test cases:
// - second generateMap call is faster than first (cache hit)
// - cache invalidates when file mtime changes
// - different files have separate cache entries
// - cache uses absolute path as key
```

### 4. `budget-enforcement.test.ts` (20 min, 7 tests)

Verify progressive detail reduction when maps exceed budget.

```typescript
// Test cases:
// - small maps stay at Full detail level
// - medium maps reduce to Compact level
// - large maps reduce to Minimal level
// - huge maps reduce to Outline level
// - reduceToLevel correctly removes children at Outline
// - reduceToLevel correctly removes signatures at Compact
// - formatted output respects budget constraints
```

## Key Files to Reference

```
src/index.ts           # Extension entry point, tool registration, caching
src/mapper.ts          # generateMap(), dispatcher logic
src/formatter.ts       # formatFileMapWithBudget(), reduceToLevel()
src/enums.ts           # DetailLevel enum
src/types.ts           # FileMap, FileSymbol types
```

## Imports You'll Need

```typescript
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { mkdir, writeFile, rm, utimes } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

// From source
import { generateMap } from "../../src/mapper.js";
import { formatFileMapWithBudget, reduceToLevel } from "../../src/formatter.js";
import { DetailLevel } from "../../src/enums.js";
import type { FileMap } from "../../src/types.js";
```

## Helper Module to Create

**File**: `tests/integration/helpers.ts`

```typescript
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const TEMP_BASE = join(tmpdir(), "pi-read-map-integration");

export async function createTempFile(
  filename: string,
  content: string
): Promise<string> {
  const dir = join(TEMP_BASE, randomUUID().slice(0, 8));
  await mkdir(dir, { recursive: true });
  const filepath = join(dir, filename);
  await writeFile(filepath, content);
  return filepath;
}

export async function cleanupAllTempFiles(): Promise<void> {
  await rm(TEMP_BASE, { recursive: true, force: true });
}

export function generatePythonCode(functionCount: number): string {
  const lines = ["# Generated Python"];
  for (let i = 0; i < functionCount; i++) {
    lines.push(`def func_${i}(): pass`);
  }
  return lines.join("\n");
}

export function generateTypeScriptCode(classCount: number): string {
  const lines = ["// Generated TypeScript"];
  for (let i = 0; i < classCount; i++) {
    lines.push(`export class C${i} { m(): void {} }`);
  }
  return lines.join("\n");
}
```

## Package.json Script to Add

```json
{
  "scripts": {
    "test:integration": "vitest run tests/integration/"
  }
}
```

## Validation Commands

```bash
# Run just integration tests
npm run test:integration

# Run all tests (unit + integration + e2e)
npm test && npm run test:integration && npm run test:e2e

# Validate (typecheck + lint + format)
npm run validate
```

## Success Criteria

- [ ] `tests/integration/helpers.ts` created
- [ ] `tests/integration/extension-load.test.ts` - 4 tests passing
- [ ] `tests/integration/mapper-dispatch.test.ts` - 8 tests passing
- [ ] `tests/integration/cache-behavior.test.ts` - 4 tests passing
- [ ] `tests/integration/budget-enforcement.test.ts` - 7 tests passing
- [ ] `npm run validate` passes
- [ ] `npm run test:integration` passes
- [ ] All existing tests still pass (`npm test` and `npm run test:e2e`)

## Commit Message

```
Add integration tests for component interactions

- extension-load.test.ts: Extension exports and tool registration
- mapper-dispatch.test.ts: Language routing and fallback chains
- cache-behavior.test.ts: Map caching and mtime invalidation
- budget-enforcement.test.ts: Progressive detail reduction

23 new tests covering the integration layer between unit and E2E tests.
```

## Known Considerations

1. **Cache testing**: The `mapCache` in `index.ts` is not exported. Either:
   - Export a `resetMapCache()` function for testing
   - Test indirectly via timing measurements
   - Skip cache tests if too invasive

2. **Mapper availability**: Go mapper requires `go` installed. Use `vi.mock` or skip if unavailable.

3. **Temp file cleanup**: Always clean up in `afterAll` to avoid disk pollution.

4. **Lint rules**: Follow project conventions:
   - No `console.error` with template literals
   - Use `60_000` not `60000` for large numbers
   - Types in `types.ts`, constants in `constants.ts`

## Reference: Full Plan

See `docs/plans/integration-tests.md` for complete test specifications and implementation details.
