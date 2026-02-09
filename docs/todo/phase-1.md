# Phase 1 TODO: Missing Items

**Status**: Phase 1 cannot be closed until all MUST DO items are complete.  
**Last Updated**: February 8, 2026

---

## MUST DO (Blocking Phase 1 Close)

### 1. E2E Test Infrastructure

**File**: `tests/helpers/pi-runner.ts`

Create a helper module for spawning pi sessions in tests. This enables E2E testing of the extension in a real pi environment.

**Required Implementation**:

```typescript
// tests/helpers/pi-runner.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";

const execAsync = promisify(exec);

interface PiSessionOptions {
  extension: string;      // Path to extension entry point
  prompt: string;         // Task prompt to send to pi
  timeout?: number;       // Execution timeout (default: 30000ms)
}

interface PiSession {
  outputFile: string;     // Path to captured output
  cleanup: () => Promise<void>;
}

/**
 * Spawn a pi session with the extension loaded.
 * Uses pi's print mode (-p) for non-interactive execution.
 */
export async function spawnPiSession(options: PiSessionOptions): Promise<PiSession>;

/**
 * Read the output from a completed pi session.
 */
export async function readOutput(session: PiSession): Promise<string>;
```

**Acceptance Criteria**:
- [ ] Can spawn pi with a custom extension loaded
- [ ] Captures stdout/stderr to a temp file
- [ ] Supports timeout for hanging sessions
- [ ] Cleanup removes temp files
- [ ] Works in CI environment (no TTY required)

---

### 2. Core E2E Tests

#### 2.1 Large File Map Test

**File**: `tests/e2e/read-large-file.test.ts`

Verify that reading a file exceeding thresholds (>2000 lines OR >50KB) produces a structural map.

**Test Cases**:
- [ ] Map box delimiters appear in output (`───────────────────────────────────────`)
- [ ] "File Map:" header is present
- [ ] File name appears in map header
- [ ] Line ranges are present (`[start-end]` format)
- [ ] Guidance footer appears ("Use read(path, offset=LINE, limit=N)")
- [ ] Original file content (first 2000 lines) is still present
- [ ] Truncation notice is present

**Fixture**: `tests/fixtures/large/processor.py` (already exists, 137KB)

---

#### 2.2 Small File Passthrough Test

**File**: `tests/e2e/read-small-file.test.ts`

Verify that reading a file within thresholds passes through unchanged (no map).

**Test Cases**:
- [ ] "File Map:" header is NOT present
- [ ] Box delimiters are NOT present
- [ ] Full file content is returned
- [ ] No truncation notice
- [ ] No guidance footer about targeted reads

**Fixture**: `tests/fixtures/small/hello.py` (already exists, 407 bytes)

---

#### 2.3 Offset/Limit Passthrough Test

**File**: `tests/e2e/read-with-offset.test.ts`

Verify that targeted reads (with offset or limit parameters) pass through unchanged, even for large files.

**Test Cases**:
- [ ] `read(path, offset=100)` does NOT produce a map
- [ ] `read(path, limit=50)` does NOT produce a map
- [ ] `read(path, offset=100, limit=50)` does NOT produce a map
- [ ] Content matches expected range from file
- [ ] Works correctly for large files that would normally get mapped

**Fixture**: `tests/fixtures/large/processor.py`

---

### 3. Missing Small Fixtures

Create minimal test fixtures for languages explicitly listed in the implementation plan.

#### 3.1 TypeScript Fixture

**File**: `tests/fixtures/small/hello.ts`

```typescript
// Small TypeScript file for passthrough testing

export interface Greeting {
  message: string;
  recipient: string;
}

export function greet(name: string): Greeting {
  return {
    message: `Hello, ${name}!`,
    recipient: name,
  };
}

export class Greeter {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(): string {
    return `Hello, ${this.name}!`;
  }
}
```

**Acceptance Criteria**:
- [ ] File is under 50 lines
- [ ] File is under 50KB
- [ ] Contains at least one class, function, and interface

---

#### 3.2 Go Fixture

**File**: `tests/fixtures/small/hello.go`

```go
// Small Go file for passthrough testing
package main

import "fmt"

// Greeting represents a greeting message
type Greeting struct {
	Message   string
	Recipient string
}

// Greet creates a greeting for the given name
func Greet(name string) Greeting {
	return Greeting{
		Message:   fmt.Sprintf("Hello, %s!", name),
		Recipient: name,
	}
}

// Greeter provides greeting functionality
type Greeter struct {
	name string
}

// NewGreeter creates a new Greeter
func NewGreeter(name string) *Greeter {
	return &Greeter{name: name}
}

// Greet returns a greeting string
func (g *Greeter) Greet() string {
	return fmt.Sprintf("Hello, %s!", g.name)
}

func main() {
	greeter := NewGreeter("World")
	fmt.Println(greeter.Greet())
}
```

**Acceptance Criteria**:
- [ ] File is under 50 lines
- [ ] File is under 50KB
- [ ] Contains struct, function, and method definitions

---

## SHOULD DO (Before Phase 2 Close)

### 4. Large Test Fixtures

Create realistic large files for cross-language E2E validation.

#### 4.1 TypeScript Large Fixture

**File**: `tests/fixtures/large/handler.ts`

**Requirements**:
- 3,000+ lines
- Multiple classes with methods
- Interfaces and type aliases
- Export statements
- Async functions
- Realistic structure (e.g., HTTP handler patterns)

**Generation approach**: Script or manual creation of a realistic codebase fragment.

---

#### 4.2 Go Large Fixture

**File**: `tests/fixtures/large/server.go`

**Requirements**:
- 4,000+ lines
- Multiple structs with methods
- Interface definitions
- Package-level functions
- Realistic structure (e.g., HTTP server patterns)

---

#### 4.3 SQL Large Fixture

**File**: `tests/fixtures/large/schema.sql`

**Requirements**:
- 2,500+ lines
- Multiple CREATE TABLE statements
- CREATE VIEW statements
- CREATE FUNCTION/PROCEDURE statements
- CREATE INDEX statements
- ALTER TABLE statements
- Comments and realistic naming

---

#### 4.4 JSON Large Fixture

**File**: `tests/fixtures/large/data.json`

**Requirements**:
- 100KB+ file size
- Deeply nested structure (3+ levels)
- Arrays with multiple objects
- Various data types (strings, numbers, booleans, nulls)
- Realistic structure (e.g., API response, config file)

---

#### 4.5 Markdown Large Fixture

**File**: `tests/fixtures/large/readme.md`

**Requirements**:
- 3,000+ lines
- Deep heading hierarchy (h1 → h6)
- Code blocks in multiple languages
- Lists, tables, links
- Realistic documentation structure

---

### 5. Fix Benchmark Test Setup

**File**: `tests/benchmarks/mappers.bench.ts`

**Problem**: The `beforeAll` hook creates fixtures, but vitest bench appears to run iterations before the hook completes.

**Solution Options**:

1. **Persistent fixtures**: Move benchmark fixtures to `tests/fixtures/bench/` and commit them
2. **Setup script**: Create `scripts/setup-bench-fixtures.ts` run before benchmarks
3. **Fixture check**: Add synchronous existence check before each bench iteration

**Recommended approach**: Option 1 (persistent fixtures) — simpler and more reliable.

**Implementation**:
```bash
# Create persistent benchmark fixtures
mkdir -p tests/fixtures/bench
# Generate large.ts, large.md, large.cpp, large.rs
# Commit to repository
```

Update `mappers.bench.ts` to use persistent fixtures instead of generating in `beforeAll`.

---

### 6. Integration Tests

#### 6.1 Extension Load Test

**File**: `tests/integration/extension-load.test.ts`

**Test Cases**:
- [ ] Extension module exports a default function
- [ ] Default function accepts ExtensionAPI parameter
- [ ] No errors thrown during registration
- [ ] Tool is registered with correct name ("read")

---

#### 6.2 Tool Registration Test

**File**: `tests/integration/tool-registration.test.ts`

**Test Cases**:
- [ ] Tool has correct name, label, description
- [ ] Parameters schema matches expected structure
- [ ] Execute function is callable
- [ ] Tool appears in registered tools list

---

#### 6.3 Mapper Dispatch Test

**File**: `tests/integration/mapper-dispatch.test.ts`

**Test Cases**:
- [ ] Python files dispatch to pythonMapper
- [ ] TypeScript files dispatch to typescriptMapper (with codemap fallback)
- [ ] Unknown extensions dispatch to ctagsMapper then fallbackMapper
- [ ] Mapper failures fall through to next in chain

---

#### 6.4 Budget Enforcement Test

**File**: `tests/integration/budget-enforcement.test.ts`

**Test Cases**:
- [ ] Maps under 10KB stay at Full detail
- [ ] Maps 10-15KB reduce to Compact detail
- [ ] Maps 15-20KB reduce to Minimal detail
- [ ] Maps over 20KB reduce to Outline detail
- [ ] Outline level always fits within budget

---

## COULD DO (Future Improvement)

### 7. Pathological Test Cases

#### 7.1 Many Symbols Stress Test

**File**: `tests/fixtures/pathological/many-symbols.py`

**Requirements**:
- 5,000+ function definitions
- Tests budget enforcement at scale
- Verifies outline level truncation works

---

#### 7.2 Deep Nesting Test

**File**: `tests/fixtures/pathological/deep-nesting.ts`

**Requirements**:
- 20+ levels of nesting (classes within namespaces within modules)
- Tests indentation and child symbol handling
- Verifies formatter doesn't break on deep structures

---

#### 7.3 No Symbols Test

**File**: `tests/fixtures/pathological/no-symbols.txt`

**Requirements**:
- Large file (>50KB) with no recognizable symbols
- Plain text, prose, or random content
- Tests fallback mapper with empty results
- Verifies extension handles zero-symbol case gracefully

---

#### 7.4 Binary File Test

**File**: `tests/fixtures/pathological/binary.bin`

**Requirements**:
- Binary content (e.g., compiled executable, image)
- Tests that mapper is skipped for non-text files
- Verifies no errors thrown

---

### 8. Golden Files for Regression Testing

**Directory**: `tests/fixtures/expected/`

Create expected output files for snapshot comparison:

| Source File | Golden File |
|-------------|-------------|
| `large/processor.py` | `expected/processor.py.map` |
| `large/handler.ts` | `expected/handler.ts.map` |
| `large/server.go` | `expected/server.go.map` |
| `large/schema.sql` | `expected/schema.sql.map` |
| `large/data.json` | `expected/data.json.map` |
| `large/readme.md` | `expected/readme.md.map` |

**Usage**:
```typescript
it("produces expected map for processor.py", async () => {
  const map = await pythonMapper("tests/fixtures/large/processor.py");
  const formatted = formatFileMap(map);
  const expected = await readFile("tests/fixtures/expected/processor.py.map", "utf-8");
  expect(formatted).toBe(expected);
});
```

---

### 9. Shell Escaping Utility

**File**: `src/utils/shell-escape.ts`

**Problem**: Current code uses string interpolation for shell commands:
```typescript
await execAsync(`wc -l < "${absPath}"`, { signal });
```

**Risk**: File paths with special characters (`$`, backticks, etc.) could cause issues.

**Solution**: Create or use an escaping utility:

```typescript
export function shellEscape(arg: string): string {
  // Escape single quotes and wrap in single quotes
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

// Usage:
await execAsync(`wc -l < ${shellEscape(absPath)}`, { signal });
```

**Affected files**:
- `src/index.ts`
- `src/mappers/python.ts`
- `src/mappers/go.ts`
- `src/mappers/fallback.ts`
- `src/mappers/json.ts`
- `src/mappers/codemap.ts`
- `src/mappers/ctags.ts`

---

## Checklist Summary

### Phase 1 Gate (MUST DO)
- [ ] `tests/helpers/pi-runner.ts` implemented
- [ ] `tests/e2e/read-large-file.test.ts` passing
- [ ] `tests/e2e/read-small-file.test.ts` passing
- [ ] `tests/e2e/read-with-offset.test.ts` passing
- [ ] `tests/fixtures/small/hello.ts` created
- [ ] `tests/fixtures/small/hello.go` created
- [ ] `npm run e2e` passes

### Phase 2 Gate (SHOULD DO)
- [ ] All large fixtures created
- [ ] Benchmarks fixed and passing
- [ ] Integration tests implemented
- [ ] Cross-language E2E test matrix complete

### Future (COULD DO)
- [ ] Pathological test cases
- [ ] Golden files for regression
- [ ] Shell escaping utility
