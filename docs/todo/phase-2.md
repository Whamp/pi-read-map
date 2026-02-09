# Phase 2 TODO: Missing Items

This document tracks all incomplete items identified in the Phase 2 review that must be addressed before the phase can be declared complete.

---

## Critical Priority

### 1. E2E Tests

**Location**: `tests/e2e/`

The E2E tests implemented (17 tests passing). These tests verify the extension works correctly when loaded into an actual pi session.

#### 1.1 Pi Runner Helper

**File**: `tests/helpers/pi-runner.ts`

Create the test helper utility for spawning pi sessions:

```typescript
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";

const execAsync = promisify(exec);

interface PiSessionOptions {
  extension: string;
  prompt: string;
  timeout?: number;
}

interface PiSession {
  outputFile: string;
  cleanup: () => Promise<void>;
}

/**
 * Spawn a pi session in non-interactive mode.
 * Uses pi -p (print mode) for output capture.
 */
export async function spawnPiSession(options: PiSessionOptions): Promise<PiSession> {
  const sessionId = randomUUID().slice(0, 8);
  const outputFile = `/tmp/pi-e2e-${sessionId}.txt`;
  const { extension, prompt, timeout = 30000 } = options;
  
  // Use pi -p (print mode) for non-interactive execution
  const cmd = `pi -e "${extension}" -p "${prompt.replace(/"/g, '\\"')}" --no-session > "${outputFile}" 2>&1`;
  
  await execAsync(cmd, { timeout });
  
  return {
    outputFile,
    cleanup: async () => {
      await rm(outputFile, { force: true });
    },
  };
}

/**
 * Read output from a pi session.
 */
export async function readOutput(session: PiSession): Promise<string> {
  return readFile(session.outputFile, "utf-8");
}
```

#### 1.2 Read Large File Test

**File**: `tests/e2e/read-large-file.test.ts`

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { spawnPiSession, readOutput } from "../helpers/pi-runner";

describe("read large file", () => {
  let session: Awaited<ReturnType<typeof spawnPiSession>> | null = null;

  afterEach(async () => {
    if (session) {
      await session.cleanup();
      session = null;
    }
  });

  it("produces a file map for files over threshold", async () => {
    session = await spawnPiSession({
      extension: "./src/index.ts",
      prompt: 'Use the read tool to read "tests/fixtures/large/processor.py"',
    });
    
    const output = await readOutput(session);
    
    // Verify map markers appear
    expect(output).toContain("───────────────────────────────────────");
    expect(output).toContain("File Map:");
    expect(output).toContain("processor.py");
    
    // Verify line numbers are present
    expect(output).toMatch(/class \w+:? \[\d+-\d+\]/);
    expect(output).toMatch(/def \w+.*: \[\d+-\d+\]/);
    
    // Verify guidance footer
    expect(output).toContain("Use read(path, offset=LINE, limit=N) for targeted reads.");
  });

  it("includes truncation notice", async () => {
    session = await spawnPiSession({
      extension: "./src/index.ts",
      prompt: 'Use the read tool to read "tests/fixtures/large/processor.py"',
    });
    
    const output = await readOutput(session);
    expect(output).toContain("[Truncated:");
  });
});
```

#### 1.3 Read Small File Test

**File**: `tests/e2e/read-small-file.test.ts`

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { spawnPiSession, readOutput } from "../helpers/pi-runner";

describe("read small file", () => {
  let session: Awaited<ReturnType<typeof spawnPiSession>> | null = null;

  afterEach(async () => {
    if (session) {
      await session.cleanup();
      session = null;
    }
  });

  it("passes small files through unchanged (no map)", async () => {
    session = await spawnPiSession({
      extension: "./src/index.ts",
      prompt: 'Use the read tool to read "tests/fixtures/small/hello.py"',
    });
    
    const output = await readOutput(session);
    
    // Should NOT contain map markers
    expect(output).not.toContain("File Map:");
    expect(output).not.toContain("───────────────────────────────────────");
  });
});
```

#### 1.4 Read With Offset Test

**File**: `tests/e2e/read-with-offset.test.ts`

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { spawnPiSession, readOutput } from "../helpers/pi-runner";

describe("read with offset", () => {
  let session: Awaited<ReturnType<typeof spawnPiSession>> | null = null;

  afterEach(async () => {
    if (session) {
      await session.cleanup();
      session = null;
    }
  });

  it("passes offset reads through unchanged (no map)", async () => {
    session = await spawnPiSession({
      extension: "./src/index.ts",
      prompt: 'Use the read tool to read "tests/fixtures/large/processor.py" with offset=100 and limit=50',
    });
    
    const output = await readOutput(session);
    
    // Targeted reads should NOT get a map
    expect(output).not.toContain("File Map:");
  });
});
```

#### 1.5 Read Image Test

**File**: `tests/e2e/read-image.test.ts`

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { spawnPiSession, readOutput } from "../helpers/pi-runner";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

describe("read image", () => {
  let session: Awaited<ReturnType<typeof spawnPiSession>> | null = null;
  const fixtureDir = "tests/fixtures/images";
  const testImage = join(fixtureDir, "test.png");

  beforeAll(async () => {
    await mkdir(fixtureDir, { recursive: true });
    // Create a minimal valid PNG (1x1 pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0x3f,
      0x00, 0x05, 0xfe, 0x02, 0xfe, 0xdc, 0xcc, 0x59,
      0xe7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
      0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    await writeFile(testImage, pngData);
  });

  afterAll(async () => {
    await rm(fixtureDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    if (session) {
      await session.cleanup();
      session = null;
    }
  });

  it("passes image files through unchanged", async () => {
    session = await spawnPiSession({
      extension: "./src/index.ts",
      prompt: `Use the read tool to read "${testImage}"`,
    });
    
    const output = await readOutput(session);
    
    // Should NOT contain map markers for images
    expect(output).not.toContain("File Map:");
    // Should be handled as an image attachment
    expect(output).toMatch(/image|attachment|png/i);
  });
});
```

---

### 2. Integration Tests

**Location**: `tests/integration/`

These tests verify internal component integration without spawning full pi sessions.

#### 2.1 Extension Load Test

**File**: `tests/integration/extension-load.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";

describe("extension loading", () => {
  it("exports a default function", async () => {
    const extension = await import("../../src/index.js");
    expect(typeof extension.default).toBe("function");
  });

  it("registers the read tool when called", async () => {
    const extension = await import("../../src/index.js");
    
    const mockPi = {
      registerTool: vi.fn(),
    };
    
    extension.default(mockPi as any);
    
    expect(mockPi.registerTool).toHaveBeenCalledTimes(1);
    expect(mockPi.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "read",
        label: "Read",
        execute: expect.any(Function),
      })
    );
  });
});
```

#### 2.2 Mapper Dispatch Test

**File**: `tests/integration/mapper-dispatch.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { generateMap } from "../../src/mapper.js";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

describe("mapper dispatch", () => {
  const tempDir = "tests/fixtures/tmp/dispatch";

  beforeAll(async () => {
    await mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("routes .py files to Python mapper", async () => {
    const file = join(tempDir, "test.py");
    await writeFile(file, "def hello():\n    pass\n");
    
    const result = await generateMap(file);
    
    expect(result).not.toBeNull();
    expect(result?.language).toBe("Python");
  });

  it("routes .ts files to TypeScript mapper", async () => {
    const file = join(tempDir, "test.ts");
    await writeFile(file, "export function hello(): void {}\n");
    
    const result = await generateMap(file);
    
    expect(result).not.toBeNull();
    expect(result?.language).toBe("TypeScript");
  });

  it("routes .go files to Go mapper (or fallback)", async () => {
    const file = join(tempDir, "test.go");
    await writeFile(file, "package main\n\nfunc main() {}\n");
    
    const result = await generateMap(file);
    
    // May use Go mapper or fallback depending on Go installation
    expect(result).not.toBeNull();
  });

  it("routes .sql files to SQL mapper", async () => {
    const file = join(tempDir, "test.sql");
    await writeFile(file, "CREATE TABLE users (id INT);\n");
    
    const result = await generateMap(file);
    
    expect(result).not.toBeNull();
    expect(result?.language).toBe("SQL");
  });

  it("routes unknown extensions to fallback", async () => {
    const file = join(tempDir, "test.xyz");
    await writeFile(file, "some content\nmore content\n");
    
    const result = await generateMap(file);
    
    // Should get a result from fallback mapper
    expect(result).not.toBeNull();
  });
});
```

#### 2.3 Budget Enforcement Test

**File**: `tests/integration/budget-enforcement.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { formatFileMapWithBudget, reduceToLevel } from "../../src/formatter.js";
import { DetailLevel, SymbolKind } from "../../src/enums.js";
import type { FileMap, FileSymbol } from "../../src/types.js";

describe("budget enforcement", () => {
  function createLargeMap(symbolCount: number): FileMap {
    const symbols: FileSymbol[] = [];
    for (let i = 0; i < symbolCount; i++) {
      symbols.push({
        name: `function_with_a_very_long_name_${i}`,
        kind: SymbolKind.Function,
        startLine: i * 10 + 1,
        endLine: i * 10 + 9,
        signature: `(arg1: string, arg2: number, arg3: boolean): Promise<SomeVeryLongReturnType>`,
        children: [
          {
            name: `nested_helper_${i}`,
            kind: SymbolKind.Function,
            startLine: i * 10 + 3,
            endLine: i * 10 + 7,
          },
        ],
      });
    }
    
    return {
      path: "/test/large-file.ts",
      totalLines: symbolCount * 10,
      totalBytes: symbolCount * 500,
      language: "TypeScript",
      symbols,
      imports: Array.from({ length: 20 }, (_, i) => `module-${i}`),
      detailLevel: DetailLevel.Full,
    };
  }

  it("reduces detail level when map exceeds budget", () => {
    const largeMap = createLargeMap(500); // Very large
    const formatted = formatFileMapWithBudget(largeMap, 20 * 1024);
    
    const size = Buffer.byteLength(formatted, "utf8");
    expect(size).toBeLessThanOrEqual(20 * 1024);
  });

  it("preserves full detail for small maps", () => {
    const smallMap = createLargeMap(5);
    const formatted = formatFileMapWithBudget(smallMap, 20 * 1024);
    
    // Should contain signatures (full detail)
    expect(formatted).toContain("Promise<SomeVeryLongReturnType>");
  });

  it("reduces to outline for pathologically large maps", () => {
    const hugeMap = createLargeMap(2000);
    const reduced = reduceToLevel(hugeMap, DetailLevel.Outline);
    
    // Outline should have no children
    for (const symbol of reduced.symbols) {
      expect(symbol.children).toBeUndefined();
      expect(symbol.signature).toBeUndefined();
    }
  });
});
```

---

## Medium Priority

### 3. Test Fixtures

#### 3.1 Large Fixtures

**Location**: `tests/fixtures/large/`

Currently only has `processor.py`. Need to add:

##### handler.ts (3,000 lines TypeScript)

**File**: `tests/fixtures/large/handler.ts`

Generate a realistic Express-style handler file:
```bash
# Generation script concept
node -e "
const lines = ['// Large TypeScript handler file for testing'];
for (let i = 0; i < 100; i++) {
  lines.push(\`export interface Request\${i} { id: string; data: unknown; }\`);
  lines.push(\`export interface Response\${i} { success: boolean; result: unknown; }\`);
  lines.push('');
  lines.push(\`export class Handler\${i} {\`);
  lines.push(\`  private config: Record<string, unknown>;\`);
  lines.push(\`  constructor(config: Record<string, unknown>) { this.config = config; }\`);
  for (let j = 0; j < 5; j++) {
    lines.push(\`  async handle\${j}(req: Request\${i}): Promise<Response\${i}> {\`);
    lines.push(\`    console.log('Processing request', req.id);\`);
    lines.push(\`    return { success: true, result: req.data };\`);
    lines.push(\`  }\`);
  }
  lines.push(\`}\`);
  lines.push('');
}
console.log(lines.join('\\n'));
" > tests/fixtures/large/handler.ts
```

##### server.go (4,000 lines Go)

**File**: `tests/fixtures/large/server.go`

Generate a realistic HTTP server:
```bash
# Generation script concept
node -e "
const lines = ['package main', '', 'import (', '  \"fmt\"', '  \"net/http\"', ')', ''];
for (let i = 0; i < 150; i++) {
  lines.push(\`type Service\${i} struct {\`);
  lines.push(\`  Name string\`);
  lines.push(\`  Port int\`);
  lines.push(\`}\`);
  lines.push('');
  lines.push(\`func (s *Service\${i}) Start() error {\`);
  lines.push(\`  fmt.Printf(\"Starting %s on port %d\\\\n\", s.Name, s.Port)\`);
  lines.push(\`  return nil\`);
  lines.push(\`}\`);
  lines.push('');
  lines.push(\`func (s *Service\${i}) Handle(w http.ResponseWriter, r *http.Request) {\`);
  lines.push(\`  w.WriteHeader(http.StatusOK)\`);
  lines.push(\`  w.Write([]byte(\"OK\"))\`);
  lines.push(\`}\`);
  lines.push('');
}
lines.push('func main() {');
lines.push('  fmt.Println(\"Server starting...\")');
lines.push('}');
console.log(lines.join('\\n'));
" > tests/fixtures/large/server.go
```

##### schema.sql (2,500 lines SQL)

**File**: `tests/fixtures/large/schema.sql`

##### data.json (100 KB nested JSON)

**File**: `tests/fixtures/large/data.json`

##### readme.md (3,000 lines Markdown)

**File**: `tests/fixtures/large/readme.md`

#### 3.2 Pathological Fixtures

**Location**: `tests/fixtures/pathological/`

##### many-symbols.py

**File**: `tests/fixtures/pathological/many-symbols.py`

A Python file with 5,000+ function definitions to stress test budget enforcement:
```python
# Generate with:
# for i in range(5000):
#     print(f"def function_{i}(x: int, y: str) -> bool:\n    return True\n")
```

##### deep-nesting.ts

**File**: `tests/fixtures/pathological/deep-nesting.ts`

A TypeScript file with 20 levels of nested classes:
```typescript
export class Level0 {
  class Level1 {
    class Level2 {
      // ... 20 levels deep
    }
  }
}
```

##### no-symbols.txt

**File**: `tests/fixtures/pathological/no-symbols.txt`

A large text file (100KB+) with no recognizable code structure. Tests fallback mapper behavior.

##### binary.bin

**File**: `tests/fixtures/pathological/binary.bin`

A binary file to ensure mappers gracefully skip non-text files.

#### 3.3 Golden Files

**Location**: `tests/fixtures/expected/`

After running mappers on fixture files, save their output as golden files:

- `tests/fixtures/expected/processor.py.map`
- `tests/fixtures/expected/main.go.map`
- `tests/fixtures/expected/schema.sql.map`
- `tests/fixtures/expected/config.json.map`
- `tests/fixtures/expected/nested.json.map`

Generate with:
```bash
# Example for Python
node -e "
import('./src/mappers/python.js').then(m => 
  m.pythonMapper('tests/fixtures/large/processor.py').then(r => 
    import('./src/formatter.js').then(f => 
      console.log(f.formatFileMap(r))
    )
  )
)
" > tests/fixtures/expected/processor.py.map
```

---

## Low Priority

### 4. Test Infrastructure

#### 4.1 Vitest E2E Config

**File**: `vitest.e2e.config.ts`

Update to include proper test patterns:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.test.ts"],
    testTimeout: 60000, // E2E tests need longer timeout
    hookTimeout: 30000,
    pool: "forks", // Isolate each test
    poolOptions: {
      forks: {
        singleFork: true, // Run sequentially to avoid pi session conflicts
      },
    },
  },
});
```

#### 4.2 Package.json Scripts

Ensure these scripts exist:
```json
{
  "scripts": {
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "test:integration": "vitest run tests/integration/",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e"
  }
}
```

---

### 5. Technical Debt Cleanup

#### 5.1 Replace console.error with Logger

Files to update:
- `src/mappers/go.ts` (lines 65, 82, 89, 175, 181)
- `src/mappers/sql.ts` (line 170)
- `src/mappers/json.ts` (lines 107, 124, 137, 147)
- `src/mappers/codemap.ts` (lines 159, 168, 174, 186)
- `src/mappers/c.ts` (line 194)
- `src/mappers/python.ts` (line 91)
- `src/mappers/fallback.ts` (line 95)
- `src/mappers/typescript.ts` (line 589)
- `src/mappers/cpp.ts` (line 877)
- `src/mappers/rust.ts` (line 883)
- `src/mappers/markdown.ts` (line 147)
- `src/mappers/yaml.ts` (line 135)
- `src/mappers/toml.ts` (line 142)
- `src/mappers/csv.ts` (line 103)
- `src/mappers/ctags.ts` (line 183)

#### 5.2 Fix Benchmark Fixture Timing

In `tests/benchmarks/mappers.bench.ts`, the Rust benchmark fails because the file isn't created in time. Options:
1. Make fixtures persistent (create in a setup script)
2. Add explicit wait/check in beforeAll
3. Use synchronous file creation

---

## Checklist

### Critical (Must complete before Phase 2 close)
- [ ] Create `tests/helpers/pi-runner.ts`
- [ ] Create `tests/e2e/read-large-file.test.ts`
- [ ] Create `tests/e2e/read-small-file.test.ts`
- [ ] Create `tests/e2e/read-with-offset.test.ts`
- [ ] Create `tests/e2e/read-image.test.ts`
- [ ] Verify E2E tests pass: `npm run test:e2e`

### Medium (Should complete before Phase 3)
- [ ] Create `tests/integration/extension-load.test.ts`
- [ ] Create `tests/integration/mapper-dispatch.test.ts`
- [ ] Create `tests/integration/budget-enforcement.test.ts`
- [ ] Generate `tests/fixtures/large/handler.ts`
- [ ] Generate `tests/fixtures/large/server.go`

### Low (Can defer)
- [ ] Create pathological test fixtures
- [ ] Create golden files for snapshot testing
- [ ] Replace console.error with logger
- [ ] Fix benchmark fixture timing

---

*Created: February 8, 2026*
*Source: Phase 2 Review*
