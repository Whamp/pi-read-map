# Phase 3 Missing Items & TODOs

This document provides a complete description of all missing items identified during the Phase 3 review. Items are prioritized and include implementation details.

---

## Critical Priority (Block Phase 3 Closure)

### 1. E2E Smoke Test

**Location**: `tests/e2e/smoke.test.ts`

**Description**: No E2E tests exist to validate the read tool override actually works when integrated with pi. The implementation plan specified multiple E2E tests but none were created.

**Required Implementation**:

```typescript
// tests/e2e/smoke.test.ts
import { describe, it, expect } from "vitest";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";

const execAsync = promisify(exec);

describe("pi-read-map E2E", () => {
  const fixtureDir = join(import.meta.dirname, "../fixtures/e2e-temp");
  
  beforeAll(async () => {
    await mkdir(fixtureDir, { recursive: true });
  });
  
  afterAll(async () => {
    await rm(fixtureDir, { recursive: true, force: true });
  });

  it("produces a file map for large files", async () => {
    // Create a large Python file (> 2000 lines)
    const lines = Array.from({ length: 3000 }, (_, i) => 
      `def function_${i}():\n    pass\n`
    ).join("\n");
    const filePath = join(fixtureDir, "large.py");
    await writeFile(filePath, lines);
    
    // Run pi with the extension and capture output
    const { stdout } = await execAsync(
      `pi -e "${process.cwd()}" -p "Read the file ${filePath}" --no-session`,
      { timeout: 60000 }
    );
    
    // Verify map markers appear
    expect(stdout).toContain("───────────────────────────────────────");
    expect(stdout).toContain("File Map:");
    expect(stdout).toContain("Python");
    expect(stdout).toContain("def function_");
  });

  it("passes small files through unchanged", async () => {
    const filePath = join(fixtureDir, "small.py");
    await writeFile(filePath, "x = 1\n");
    
    const { stdout } = await execAsync(
      `pi -e "${process.cwd()}" -p "Read the file ${filePath}" --no-session`,
      { timeout: 60000 }
    );
    
    // Should NOT contain map markers
    expect(stdout).not.toContain("File Map:");
  });

  it("passes offset/limit reads through unchanged", async () => {
    const lines = Array.from({ length: 3000 }, (_, i) => `line ${i}`).join("\n");
    const filePath = join(fixtureDir, "large.txt");
    await writeFile(filePath, lines);
    
    const { stdout } = await execAsync(
      `pi -e "${process.cwd()}" -p "Read ${filePath} with offset=100 and limit=50" --no-session`,
      { timeout: 60000 }
    );
    
    // Targeted reads should NOT get a map
    expect(stdout).not.toContain("File Map:");
  });
});
```

**Acceptance Criteria**:
- [ ] Test spawns pi with the extension loaded
- [ ] Test validates map appears in output for large files
- [ ] Test validates small files pass through unchanged
- [ ] Test validates offset/limit reads pass through unchanged

---

### 2. Pi Runner Helper

**Location**: `tests/helpers/pi-runner.ts`

**Description**: The implementation plan specified a helper module for spawning pi sessions in tests. This was never created.

**Required Implementation**:

```typescript
// tests/helpers/pi-runner.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const execAsync = promisify(exec);

export interface PiSessionOptions {
  extension?: string;
  prompt: string;
  timeout?: number;
  cwd?: string;
}

export interface PiSessionResult {
  stdout: string;
  stderr: string;
  outputFile: string;
  cleanup: () => Promise<void>;
}

export async function runPiSession(options: PiSessionOptions): Promise<PiSessionResult> {
  const sessionId = randomUUID().slice(0, 8);
  const outputFile = `/tmp/pi-e2e-${sessionId}.txt`;
  const { extension, prompt, timeout = 60000, cwd = process.cwd() } = options;
  
  const extFlag = extension ? `-e "${extension}"` : "";
  const escapedPrompt = prompt.replace(/"/g, '\\"');
  const cmd = `pi ${extFlag} -p "${escapedPrompt}" --no-session > "${outputFile}" 2>&1`;
  
  try {
    await execAsync(cmd, { timeout, cwd });
  } catch (error) {
    // Command may "fail" but still produce output
  }
  
  const stdout = await readFile(outputFile, "utf-8").catch(() => "");
  
  return {
    stdout,
    stderr: "",
    outputFile,
    cleanup: async () => {
      await rm(outputFile, { force: true });
    },
  };
}

export async function readOutput(outputFile: string): Promise<string> {
  return readFile(outputFile, "utf-8");
}
```

**Acceptance Criteria**:
- [ ] Helper can spawn pi with extension loaded
- [ ] Helper captures stdout/stderr
- [ ] Helper provides cleanup function
- [ ] Helper handles timeouts gracefully

---

### 3. Benchmark Fixture Race Condition Fix

**Location**: `tests/benchmarks/mappers.bench.ts`

**Description**: The benchmark's `beforeAll` hook creates fixtures but they may not persist correctly, causing "ENOENT" errors during benchmark runs.

**Problem**:
```typescript
beforeAll(async () => {
  await mkdir(FIXTURES_DIR, { recursive: true });
  // ... create files ...
  return async () => {
    await rm(FIXTURES_DIR, { recursive: true, force: true });  // This cleanup runs too early
  };
});
```

**Fix Required**:
```typescript
import { describe, bench, beforeAll, afterAll } from "vitest";

// Move cleanup to afterAll
afterAll(async () => {
  await rm(FIXTURES_DIR, { recursive: true, force: true });
});

beforeAll(async () => {
  await mkdir(FIXTURES_DIR, { recursive: true });
  // ... create files ...
  // Don't return cleanup function
});
```

**Acceptance Criteria**:
- [ ] All benchmarks run without ENOENT errors
- [ ] Fixtures persist for duration of benchmark suite
- [ ] Cleanup happens after all benchmarks complete

---

### 4. Regression Test: Internal vs CLI Output

**Location**: `tests/unit/mappers/regression.test.ts`

**Description**: No test verifies that the internal ts-morph mapper produces equivalent output to the codemap CLI fallback.

**Required Implementation**:

```typescript
// tests/unit/mappers/regression.test.ts
import { describe, it, expect } from "vitest";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

import { typescriptMapper } from "../../src/mappers/typescript.js";
import { codemapMapper } from "../../src/mappers/codemap.js";

describe("mapper regression tests", () => {
  const fixtureDir = join(import.meta.dirname, "../fixtures/regression-temp");
  
  beforeAll(async () => {
    await mkdir(fixtureDir, { recursive: true });
  });
  
  afterAll(async () => {
    await rm(fixtureDir, { recursive: true, force: true });
  });

  it("typescriptMapper extracts same symbols as codemapMapper", async () => {
    const content = `
export interface Config {
  name: string;
  value: number;
}

export class Service {
  private config: Config;
  
  constructor(config: Config) {
    this.config = config;
  }
  
  async process(): Promise<void> {
    console.log(this.config.name);
  }
}

export function helper(): string {
  return "help";
}
`;
    const filePath = join(fixtureDir, "test.ts");
    await writeFile(filePath, content);
    
    const internal = await typescriptMapper(filePath);
    const cli = await codemapMapper(filePath);
    
    expect(internal).not.toBeNull();
    expect(cli).not.toBeNull();
    
    // Compare symbol names (order may differ)
    const internalNames = internal!.symbols.map(s => s.name).sort();
    const cliNames = cli!.symbols.map(s => s.name).sort();
    
    expect(internalNames).toEqual(cliNames);
    
    // Compare symbol kinds
    const internalKinds = internal!.symbols.map(s => `${s.name}:${s.kind}`).sort();
    const cliKinds = cli!.symbols.map(s => `${s.name}:${s.kind}`).sort();
    
    expect(internalKinds).toEqual(cliKinds);
  });

  it("typescriptMapper extracts same child symbols as codemapMapper", async () => {
    const content = `
export class MyClass {
  private value: number;
  
  constructor() {
    this.value = 0;
  }
  
  getValue(): number {
    return this.value;
  }
  
  setValue(v: number): void {
    this.value = v;
  }
}
`;
    const filePath = join(fixtureDir, "class.ts");
    await writeFile(filePath, content);
    
    const internal = await typescriptMapper(filePath);
    const cli = await codemapMapper(filePath);
    
    const internalClass = internal!.symbols.find(s => s.name === "MyClass");
    const cliClass = cli!.symbols.find(s => s.name === "MyClass");
    
    expect(internalClass?.children?.length).toBe(cliClass?.children?.length);
    
    const internalChildren = internalClass?.children?.map(c => c.name).sort() ?? [];
    const cliChildren = cliClass?.children?.map(c => c.name).sort() ?? [];
    
    expect(internalChildren).toEqual(cliChildren);
  });
});
```

**Acceptance Criteria**:
- [ ] Test compares symbol names between internal and CLI mapper
- [ ] Test compares symbol kinds
- [ ] Test compares child symbols (methods in classes)
- [ ] Test handles edge cases (empty files, syntax errors)

---

## High Priority (Complete Before Phase 4)

### 5. Integration Test: Cache Behavior

**Location**: `tests/integration/cache.test.ts`

**Description**: No test verifies that the map cache in `index.ts` works correctly—that cache hits avoid regeneration and that mtime changes invalidate the cache.

**Required Implementation**:

```typescript
// tests/integration/cache.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { writeFile, mkdir, rm, utimes } from "node:fs/promises";
import { join } from "node:path";

// Note: This requires exporting the cache or adding test hooks to index.ts

describe("map cache behavior", () => {
  const fixtureDir = join(import.meta.dirname, "../fixtures/cache-temp");
  
  beforeAll(async () => {
    await mkdir(fixtureDir, { recursive: true });
  });
  
  afterAll(async () => {
    await rm(fixtureDir, { recursive: true, force: true });
  });

  it("cache hit is faster than initial generation", async () => {
    // This test requires timing measurements
    // Implementation depends on how index.ts exposes cache
  });

  it("cache invalidates when file mtime changes", async () => {
    // Write file, generate map, modify file, verify regeneration
  });
});
```

**Acceptance Criteria**:
- [ ] Test measures timing difference between cache hit and miss
- [ ] Test verifies mtime-based invalidation works
- [ ] Test may require refactoring index.ts to expose cache for testing

---

### 6. Integration Test: Extension Loading

**Location**: `tests/integration/extension-load.test.ts`

**Description**: No test verifies that the extension loads without errors and registers the read tool correctly.

**Required Implementation**:

```typescript
// tests/integration/extension-load.test.ts
import { describe, it, expect } from "vitest";

describe("extension loading", () => {
  it("exports a default function", async () => {
    const module = await import("../../src/index.js");
    expect(typeof module.default).toBe("function");
  });

  it("registers read tool when called with API", async () => {
    const module = await import("../../src/index.js");
    
    const registeredTools: string[] = [];
    const mockApi = {
      registerTool: (tool: { name: string }) => {
        registeredTools.push(tool.name);
      },
    };
    
    module.default(mockApi as any);
    
    expect(registeredTools).toContain("read");
  });
});
```

**Acceptance Criteria**:
- [ ] Test verifies default export is a function
- [ ] Test verifies read tool is registered
- [ ] Test verifies tool has correct parameters schema

---

### 7. Pathological Fixture Tests

**Location**: `tests/fixtures/pathological/` and associated tests

**Description**: The fixtures directory for edge cases is empty. No tests exist for:
- Files with thousands of symbols (budget stress test)
- Deeply nested structures
- Files with no recognizable symbols
- Binary files

**Required Files**:

```
tests/fixtures/pathological/
├── many-symbols.py      # 5000+ function definitions
├── deep-nesting.ts      # 20 levels of nested classes/functions
├── no-symbols.txt       # Large file with no structure
└── binary.bin           # Binary file (should be skipped)
```

**Required Test**:

```typescript
// tests/unit/mappers/pathological.test.ts
import { describe, it, expect } from "vitest";
import { generateMap } from "../../src/mapper.js";
import { formatFileMapWithBudget } from "../../src/formatter.js";

describe("pathological cases", () => {
  it("handles files with 5000+ symbols within budget", async () => {
    const map = await generateMap("tests/fixtures/pathological/many-symbols.py");
    expect(map).not.toBeNull();
    
    const formatted = formatFileMapWithBudget(map!);
    const bytes = Buffer.byteLength(formatted, "utf8");
    
    expect(bytes).toBeLessThanOrEqual(20 * 1024); // 20KB budget
  });

  it("handles deeply nested structures", async () => {
    const map = await generateMap("tests/fixtures/pathological/deep-nesting.ts");
    expect(map).not.toBeNull();
  });

  it("returns fallback for files with no symbols", async () => {
    const map = await generateMap("tests/fixtures/pathological/no-symbols.txt");
    // Should still return something via fallback mapper
    expect(map).not.toBeNull();
  });

  it("returns null for binary files", async () => {
    const map = await generateMap("tests/fixtures/pathological/binary.bin");
    expect(map).toBeNull();
  });
});
```

**Acceptance Criteria**:
- [ ] Fixture files created
- [ ] Budget enforcement verified for large symbol counts
- [ ] Deep nesting doesn't cause stack overflow
- [ ] Binary files handled gracefully

---

### 8. Golden File Testing

**Location**: `tests/fixtures/expected/` and associated tests

**Description**: The expected outputs directory is empty. No snapshot/golden file tests verify output consistency.

**Required Implementation**:

```typescript
// tests/unit/mappers/golden.test.ts
import { describe, it, expect } from "vitest";
import { pythonMapper } from "../../src/mappers/python.js";
import { formatFileMap } from "../../src/formatter.js";

describe("golden file tests", () => {
  it("produces consistent output for processor.py", async () => {
    const map = await pythonMapper("tests/fixtures/large/processor.py");
    expect(map).not.toBeNull();
    
    const formatted = formatFileMap(map!);
    
    // Use vitest snapshot
    expect(formatted).toMatchSnapshot();
  });
});
```

**Acceptance Criteria**:
- [ ] Snapshot tests created for each mapper
- [ ] Golden files stored in `tests/fixtures/expected/`
- [ ] CI validates snapshots don't drift unexpectedly

---

## Medium Priority (Post-Phase 3)

### 9. Symbol Name Collision Fix

**Location**: `src/mappers/typescript.ts`, `src/mappers/rust.ts`, `src/mappers/cpp.ts`

**Description**: The `convertSymbols` function uses `symbolMap.set(is.name, symbol)` which will overwrite entries when multiple symbols have the same name (e.g., two methods named `get` in different classes).

**Problem**:
```typescript
// Current (broken)
symbolMap.set(is.name, symbol);

// If we have:
// - ClassA.get()
// - ClassB.get()
// Only ClassB.get() will be in the map
```

**Fix Required**:
```typescript
// Use unique key combining parent and name
const key = is.parentName ? `${is.parentName}::${is.name}` : is.name;
symbolMap.set(key, symbol);

// When looking up parent:
if (is.parentName) {
  const parentKey = is.parentName; // Parent is stored by its own name
  const parent = symbolMap.get(parentKey);
  // ...
}
```

**Acceptance Criteria**:
- [ ] Unique keys prevent symbol overwrites
- [ ] Parent-child relationships still work correctly
- [ ] Test added to verify multiple same-named methods handled

---

### 10. Suppress Console.error in Production

**Location**: All mapper files

**Description**: All mappers use `console.error()` for error logging, which pollutes output in production.

**Fix Options**:

1. **Environment check**:
```typescript
if (process.env.DEBUG) {
  console.error(`Mapper failed: ${error}`);
}
```

2. **Logging abstraction**:
```typescript
// src/logger.ts
export const log = {
  error: (...args: unknown[]) => {
    if (process.env.DEBUG || process.env.PI_READ_MAP_DEBUG) {
      console.error("[pi-read-map]", ...args);
    }
  },
};
```

**Acceptance Criteria**:
- [ ] Errors logged only when DEBUG enabled
- [ ] User doesn't see error spam during normal operation
- [ ] Errors still visible during development/debugging

---

## Low Priority (Future Enhancement)

### 11. Per-Language Disable Configuration

**Location**: New file `src/config.ts`

**Description**: Users cannot disable mapping for specific languages. The implementation plan mentioned this as deferred.

**Proposed Implementation**:

```typescript
// src/config.ts
interface PiReadMapConfig {
  disabled?: boolean;
  disabledLanguages?: string[];
  maxMapBytes?: number;
}

export function loadConfig(): PiReadMapConfig {
  // Load from .pi/config.json or environment
  const envDisabled = process.env.PI_READ_MAP_DISABLED;
  const envDisabledLangs = process.env.PI_READ_MAP_DISABLED_LANGS;
  
  return {
    disabled: envDisabled === "true",
    disabledLanguages: envDisabledLangs?.split(",") ?? [],
  };
}
```

---

### 12. Tree-sitter Python/Go Mappers

**Location**: `src/mappers/python-treesitter.ts`, `src/mappers/go-treesitter.ts`

**Description**: Python and Go mappers still use subprocess calls. The implementation plan noted evaluating tree-sitter replacements.

**Dependencies**:
- `tree-sitter-python`
- `tree-sitter-go`

**Benefit**: Eliminates subprocess overhead, consistent with other language mappers.

---

### 13. Virtual Counter Memory Leak

**Location**: `src/mappers/typescript.ts:17`

**Description**: The `virtualCounter` increments forever, never resets. In very long sessions, this could become an issue.

**Current**:
```typescript
let virtualCounter = 0;
// ...
const vpath = `virtual_${virtualCounter++}_${filePath}`;
```

**Fix**:
```typescript
// Use modulo to keep counter bounded
let virtualCounter = 0;
const MAX_VIRTUAL = 1_000_000;
// ...
virtualCounter = (virtualCounter + 1) % MAX_VIRTUAL;
const vpath = `virtual_${virtualCounter}_${filePath}`;
```

---

## Summary Checklist

### Critical (Must Complete)
- [ ] E2E smoke test (`tests/e2e/smoke.test.ts`)
- [ ] Pi runner helper (`tests/helpers/pi-runner.ts`)
- [ ] Fix benchmark fixture race condition
- [ ] Regression test: internal vs CLI output

### High Priority (Should Complete)
- [ ] Integration test: cache behavior
- [ ] Integration test: extension loading
- [ ] Pathological fixture tests
- [ ] Golden file testing

### Medium Priority (Nice to Have)
- [ ] Symbol name collision fix
- [ ] Suppress console.error in production

### Low Priority (Future)
- [ ] Per-language disable configuration
- [ ] Tree-sitter Python/Go mappers
- [ ] Virtual counter memory leak fix

---

*Generated: February 8, 2026*
