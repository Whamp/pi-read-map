# Agentic Read: Implementation Plan

## Goal

Replace the default `read` tool in pi with an extension that adds structural file mapping for large files. When a file exceeds the truncation threshold (2,000 lines or 50 KB), instead of returning the first chunk and encouraging sequential offset reads, return a **structural map** of the entire file alongside the initial content. The map gives the LLM line numbers for every symbol, section, or definition so it can issue precise, targeted reads instead of scanning linearly.

## Problem Statement

Today when the LLM reads a 20,000-line file:

1. First 2,000 lines / 50 KB enters context
2. Footer says `Use offset=2001 to continue`
3. LLM often reads sequentially: offset=2001, offset=4001, ...
4. Each chunk stays in context permanently until compaction
5. Reading the full file puts ~500 KB of raw text into context
6. Re-reads of the same file double the cost

The LLM has no map of what it hasn't seen, so it reads blindly.

## Solution

When a file is large enough to trigger truncation, the read tool:

1. Returns the first chunk (same as today, for structural understanding)
2. Generates a structural map of the **entire** file using language-appropriate tooling
3. Appends the map to the response with line numbers
4. The footer changes from "use offset=N" to guidance about using the map's line numbers for targeted reads

The map typically compresses to **3-5% of the original file size** — a 400 KB file produces an ~18 KB map. The LLM then knows exactly where to look.

## Architecture

### Extension Structure

```
~/.pi/agent/extensions/pi-read-map/
├── package.json            # Dependencies (if any — goal is zero)
├── index.ts                # Extension entry point, registers the read override
├── src/
│   ├── mapper.ts           # Dispatcher: detect language → call appropriate mapper
│   ├── mappers/
│   │   ├── codemap.ts      # TypeScript, JavaScript, C++, Rust, Markdown
│   │   ├── python.ts       # Python via ast module (subprocess)
│   │   ├── go.ts           # Go via go/ast (subprocess)
│   │   ├── c.ts            # C via regex patterns
│   │   ├── sql.ts          # SQL via regex patterns
│   │   ├── json.ts         # JSON via jq (subprocess)
│   │   └── fallback.ts     # Grep-based heuristics for unknown languages
│   └── types.ts            # Shared types
└── scripts/
    ├── python_outline.py   # Standalone Python AST outline script
    └── go_outline.go       # Standalone Go AST outline (pre-compiled to binary)
```

### Tool Override Approach

The extension registers a tool named `read` which overrides the built-in. It uses `createReadTool` from `@mariozechner/pi-coding-agent` to delegate the actual file reading, then augments the result with a structural map when applicable.

```typescript
import {
  createReadTool,
  truncateHead,
  DEFAULT_MAX_LINES,
  DEFAULT_MAX_BYTES,
  formatSize,
} from "@mariozechner/pi-coding-agent";
```

### Decision Flow

```
read(path, offset?, limit?) called
│
├─ offset or limit provided?
│   └─ yes → delegate to built-in read (targeted read, no map needed)
│
├─ file within threshold? (≤2,000 lines AND ≤50 KB)
│   └─ yes → delegate to built-in read (small file, no map needed)
│
└─ file exceeds threshold
    ├─ 1. Read first chunk via built-in read logic (2,000 lines / 50 KB)
    ├─ 2. Detect language from file extension
    ├─ 3. Generate structural map using appropriate mapper
    ├─ 4. Append map to response content
    └─ 5. Replace truncation footer with map-aware guidance
```

### Map Format

All mappers produce a common text format with clear visual delimiters:

```
───────────────────────────────────────
File Map: path/to/file.py
10,247 lines │ 412 KB │ Python
───────────────────────────────────────

imports: os, sys, asyncio, typing, dataclasses, .config, .db

MAX_WORKERS = ... [15]
DEFAULT_TIMEOUT = ... [16]

class ProcessorConfig: [18-32]

class BatchProcessor: [34-890]
  def __init__(self, config: ProcessorConfig): [40-65]
  async def run(self, items: List[Item]) -> BatchResult: [67-180]
  async def _process_chunk(self, chunk: List[Item]) -> List[Result]: [182-245]
  def _validate(self, item: Item) -> bool: [247-290]
  ...12 more methods

class RetryHandler: [892-1050]
  def __init__(self, max_retries: int): [898-910]
  async def execute(self, fn: Callable) -> Any: [912-1050]

def create_processor(config_path: str) -> BatchProcessor: [9800-9850]
async def main(): [9852-10247]

───────────────────────────────────────
Use read(path, offset=LINE, limit=N) for targeted reads.
───────────────────────────────────────
```

Key properties:
- Every entry has `[start_line-end_line]` for direct offset/limit targeting
- Signatures included where available (not just names)
- Nesting shown via indentation (methods inside classes)
- Import list included (dependency context)
- Compact — no source code, just the structural skeleton

## Language Coverage

### Phase 1: Core Languages (MVP)

| Language | Extensions | Map tool | Approach |
|----------|-----------|----------|----------|
| TypeScript | .ts, .tsx, .mts, .cts | codemap | `codemap "file" -o json` → parse JSON → format |
| JavaScript | .js, .jsx, .mjs, .cjs | codemap | Same as TypeScript |
| Python | .py, .pyw | python3 + ast | Subprocess: `python3 scripts/python_outline.py file` |
| Go | .go | go/ast | Pre-compiled binary: `scripts/go_outline file` |
| Markdown | .md, .mdx | codemap | Heading hierarchy + code block ranges |
| JSON | .json | jq | Subprocess: `jq 'def schema: ...; schema' file` |
| SQL | .sql | regex | In-process regex extraction |
| C | .c, .h | codemap (via cpp) + regex | codemap for .h, regex patterns for .c |

### Phase 2: Extended Coverage

| Language | Extensions | Map tool | Approach |
|----------|-----------|----------|----------|
| C++ | .cpp, .cc, .cxx, .hpp | codemap | Already supported |
| Rust | .rs | codemap | Already supported |
| YAML | .yml, .yaml | regex | Top-level key extraction |
| TOML | .toml | regex | Section + key extraction |
| CSV | .csv | head + awk | Header row + row count + column count |

### Phase 3: Universal Fallback

| Language | Map tool | Approach |
|----------|----------|----------|
| Any with ctags support | universal-ctags | `ctags --output-format=json -f - file` |
| Everything else | grep | `grep -n` for common structural patterns |

## Mapper Specifications

### Python Mapper (`scripts/python_outline.py`)

Uses Python's built-in `ast` module (zero dependencies).

**Input:** File path as CLI argument
**Output:** Structured outline to stdout

Extracts:
- Module-level imports (grouped)
- Module-level assignments (constants, config)
- Class definitions with decorators, bases, line ranges
- Method definitions with full signatures (args, type annotations, return type), line ranges
- Function definitions with full signatures, line ranges
- Nested classes
- `async` prefix where applicable

Does NOT extract:
- Function/method bodies
- Comments or docstrings (too verbose)
- Local variables
- Control flow

**Example invocation:**
```bash
python3 scripts/python_outline.py /path/to/file.py
```

### Go Mapper (`scripts/go_outline.go`)

Uses Go's built-in `go/ast` and `go/parser` (zero dependencies).

**Binary management:** Compile on first use, with graceful fallback:
```typescript
async function getGoMapper(): Promise<Mapper | null> {
  const binaryPath = join(extensionDir, "scripts", "go_outline");
  
  // Check for pre-compiled binary
  if (existsSync(binaryPath)) {
    return goMapper(binaryPath);
  }
  
  // Try to compile
  const sourcePath = join(extensionDir, "scripts", "go_outline.go");
  const result = await pi.exec("go", ["build", "-o", binaryPath, sourcePath], { timeout: 30000 });
  
  if (result.code === 0) {
    return goMapper(binaryPath);
  }
  
  // Go not available — fall through to fallback mapper
  return null;
}
```

**Extracts:**
- Package declaration
- Import list
- Type definitions (struct fields, interface methods) with line ranges
- Function declarations with receiver type, line ranges
- Method declarations with receiver type, line ranges
- Const/var declarations with line numbers

### SQL Mapper (in-process regex)

No subprocess needed. Runs in the extension's Node.js process.

**Extracts:**
- `CREATE TABLE` with column names, line ranges
- `CREATE VIEW` with line ranges
- `CREATE FUNCTION/PROCEDURE` with parameter signature, return type, line ranges
- `CREATE INDEX` with target table, line number
- `CREATE TYPE/ENUM` with line ranges
- `CREATE TRIGGER` with target table, line ranges
- `ALTER TABLE` with action summary, line number
- `CREATE SCHEMA` with line number

### JSON Mapper (via jq)

**Extracts:**
- Schema: object keys, types, array lengths
- Nested structure with indentation
- For arrays, shows element schema from first element + total count

**Example output for a 500 KB JSON file:**
```
[File map: config.json — 12,450 lines, 487 KB]

{
  "users": [](2450) {
    "id": number,
    "name": string,
    "email": string,
    "roles": [](varies) {
      "id": number,
      "name": string,
      "permissions": [](varies) string
    }
  },
  "config": {
    "database": { "host": string, "port": number, "pool_size": number },
    "cache": { "ttl": number, "max_entries": number }
  }
}
```

### Codemap Integration

Codemap is already installed at `/home/will/projects/codemap`. 

**Phase 1: CLI approach** (simpler, avoids import issues):
```bash
npx codemap "file.ts" -o json --no-stats --no-imports
```

Parse the JSON output, extract symbols with line ranges, format into the common map format.

**Phase 3: Internalize codemap functionality** into the extension for full control:
```typescript
// Bring tree-sitter symbol extraction directly into the extension
import Parser from "tree-sitter";
import TypeScript from "tree-sitter-typescript";
// ... extract symbols using codemap's query patterns
```

Benefits of internalization:
- No subprocess overhead
- Full control over output format and budget enforcement
- Can extend to new languages (Python, Go) using tree-sitter grammars
- No coupling to external codemap project

**Considerations:**
- codemap operates relative to a repo root. Need to handle arbitrary file paths.
- codemap doesn't currently map `.c` files (only `.h` via cpp parser). The C regex mapper handles `.c` files until tree-sitter-c is integrated.
- Internalization requires adding tree-sitter as an npm dependency.

### Fallback Mapper (grep-based)

For any file type not covered by a specific mapper.

```bash
grep -n "^class \|^def \|^func \|^function \|^export \|^import \|^struct \|^enum \|^interface \|^type \|^#define \|^CREATE \|^ALTER " file
```

Combined with:
- `wc -l` for total line count
- `head -1` for shebang/magic detection
- `file --mime-type` for format identification

Produces a minimal but useful outline with line numbers.

## Response Format

### For files within threshold (no change)

Same as current read tool output.

### For large files (new behavior)

The response supplements the truncation info with the map (does not replace it):

```
[content of first 2,000 lines / 50 KB, same as current]

[Truncated: showing lines 1-2000 of 10,247 (50 KB of 412 KB)]

───────────────────────────────────────
File Map: services/processor.py
10,247 lines │ 412 KB │ Python
───────────────────────────────────────

imports: os, sys, asyncio, typing, .config, .db

class ProcessorConfig: [18-32]
class BatchProcessor: [34-890]
  def __init__(self, config): [40-65]
  async def run(self, items): [67-180]
  ...
class RetryHandler: [892-1050]
  ...
def create_processor(config_path): [9800-9850]
async def main(): [9852-10247]

───────────────────────────────────────
Use read(path, offset=LINE, limit=N) for targeted reads.
───────────────────────────────────────
```

The map goes into `content` (enters LLM context). The raw truncation metadata goes into `details` (does not enter LLM context), same as current behavior.

### Map Budget

The map itself must be bounded. **20 KB hard cap** with progressive detail reduction:

1. **Full** (target: ≤10 KB): signatures, line ranges, nesting, imports
2. **Compact** (target: ≤15 KB): names, line ranges, nesting, no signatures
3. **Minimal** (target: ≤20 KB): names, line ranges only, no nesting
4. **Outline** (fallback): top-level symbols only with line ranges (guaranteed to fit)

Algorithm:
1. Generate full map
2. If >20 KB, regenerate at compact level
3. If still >20 KB, regenerate at minimal level
4. If still >20 KB, regenerate at outline level

Most files fit at full or compact level. Only pathological files (thousands of symbols) hit outline.

## Implementation Phases

### Phase 1: Foundation

**Implementation:**
- [ ] Create extension project structure
- [ ] Implement read tool override that delegates to built-in `createReadTool`
- [ ] Implement language detection from file extension
- [ ] Implement mapper dispatcher
- [x] Implement Python mapper (ast-based script)
- [x] Implement fallback mapper (grep-based)
- [x] Implement map formatting and budget enforcement

**Validation:**
- [x] `npm run validate` passes (typecheck + lint + format)
- [x] Unit test: language detection for all extensions
- [x] Unit test: Python mapper produces correct symbols
- [x] Unit test: fallback mapper produces minimal outline
- [x] Unit test: map formatter produces correct delimiters
- [x] E2E test: large Python file produces map + initial chunk
- [x] E2E test: small file passes through unchanged
- [x] E2E test: offset/limit reads pass through unchanged

**Gate:** `npm run validate && npm test && npm run e2e` all pass.

### Phase 2: Core Language Coverage

**Implementation:**
- [x] Implement Go mapper (go/ast binary)
- [x] Implement SQL mapper (regex, in-process)
- [x] Implement JSON mapper (jq subprocess)
- [x] Integrate codemap for TypeScript/JavaScript/Markdown
- [x] Implement C mapper (regex for .c, codemap for .h)

**Validation:**
- [x] Unit test: Go mapper produces correct symbols (or graceful fallback)
- [x] Unit test: SQL mapper extracts DDL statements
- [x] Unit test: JSON mapper extracts schema
- [x] Unit test: codemap integration works for TS/JS/MD
- [x] Unit test: C mapper regex patterns work
- [ ] E2E test: each mapper against real-world files of varying sizes
- [ ] E2E test: full cross-language test matrix

**Gate:** All Phase 1 + Phase 2 tests pass.

### Phase 3: Refinement & Codemap Internalization ✅ COMPLETE

**Implementation:**
- [x] **Internalize codemap functionality**: bring tree-sitter/ts-morph symbol extraction into the extension
  - [x] Add tree-sitter, tree-sitter-cpp, tree-sitter-rust, ts-morph as npm dependencies
  - [x] Port codemap's patterns for TS/JS (via ts-morph), C++/Rust (via tree-sitter), Markdown (via regex)
  - [x] Keep CLI subprocess as fallback (codemap CLI available if internal parser fails)
  - [ ] Evaluate adding tree-sitter-python and tree-sitter-go to replace subprocess mappers (deferred)
- [x] Performance measurement: internal mappers comparable or faster than CLI
  - rustMapper:       9,313 ops/sec (fastest)
  - cppMapper:        8,302 ops/sec
  - codemapMapper:    8,045 ops/sec (CLI baseline)
  - markdownMapper:   7,947 ops/sec
  - typescriptMapper: 6,523 ops/sec (full type info)
- [x] Error handling: mapper failure gracefully falls through via withFallback() wrapper
- [ ] Map budget enforcement and progressive detail reduction (existing, needs review)
- [ ] Caching: cache maps by file path + mtime (existing in index.ts)
- [ ] Configuration: allow users to disable mapping per-language or globally (deferred)

**Validation:**
- [x] Unit test: tree-sitter/ts-morph output produces correct symbols
- [x] Benchmark: map generation <200ms average for typical files (achieved ~0.1-0.15ms!)
- [x] Unit test: mapper failure falls through gracefully (codemap fallback tested)
- [ ] Unit test: budget enforcement produces correct detail levels (existing tests)
- [ ] Integration test: per-language disable works (deferred)

**Gate:** All tests pass (96 tests), validation passes, performance targets exceeded.

**Validation:**
- [ ] Unit test: tree-sitter output matches CLI output (regression)
- [ ] Unit test: budget enforcement produces correct detail levels
- [ ] Integration test: cache hit avoids regeneration (timing)
- [ ] Benchmark: map generation <200ms average for typical files
- [ ] Unit test: mapper failure falls through gracefully (error injection)
- [ ] Integration test: per-language disable works

**Gate:** All tests pass, performance targets met.

### Phase 4: Extended Coverage ✅ COMPLETE

**Implementation:**
- [x] YAML/TOML mappers (regex-based, in-process)
- [x] CSV mapper (in-process, handles both CSV and TSV)
- [x] universal-ctags integration as a broad fallback (graceful skip when not installed)
- [ ] Evaluate adding codemap support for Python/Go natively (tree-sitter grammars exist) (deferred)

**Validation:**
- [x] Unit test: YAML mapper extracts top-level keys with line numbers (5 tests)
- [x] Unit test: TOML mapper extracts sections and keys (6 tests)
- [x] Unit test: CSV mapper extracts headers and row count (6 tests)
- [x] Integration test: ctags works when installed, skips when not (5 tests)

**Gate:** All tests pass (118 tests).

## Technical Details

### Subprocess Execution

Mappers that shell out (Python, Go, jq, codemap) use `pi.exec()` from the extension API:

```typescript
const result = await pi.exec("python3", [scriptPath, filePath], {
  signal,
  timeout: 10000, // 10s timeout for map generation
});
```

If the subprocess fails or times out, the extension falls through to the fallback mapper or returns the file without a map (graceful degradation).

### Map Caching

Maps are cached in a `Map<string, { mtime: number; map: string }>` keyed by absolute file path. On each read:

1. Check if cached map exists for this path
2. Compare file mtime to cached mtime
3. If match, reuse cached map (zero overhead)
4. If mismatch or miss, regenerate

Cache is in-memory only (cleared on session restart). No disk persistence needed since map generation is fast (typically <500ms).

### Compatibility

The extension must preserve exact compatibility with the built-in read tool for:

- **Small files**: pass through unchanged
- **Offset/limit reads**: pass through unchanged
- **Image files**: pass through unchanged (handled by built-in createReadTool)
- **Error handling**: same error messages for missing files, permission errors, etc.
- **details field**: maintain truncation metadata for TUI rendering
- **Abort signal**: respect cancellation

### Dependencies

**Zero required npm dependencies.** All mappers use:
- Node.js built-ins (`child_process`, `fs`, `path`)
- System tools already present (`python3`, `go`, `jq`)
- codemap CLI (already installed at `/home/will/projects/codemap`)

**Optional:**
- `universal-ctags` for Phase 4 broad language coverage
- `@sinclair/typebox` for tool parameter schema (available via pi-coding-agent)

## Decisions

These questions were evaluated and resolved:

### 1. Map replaces or supplements truncation footer?

**Decision: Supplement.** Keep truncation info, add map, change guidance.

The truncation footer serves two purposes: (1) tells the LLM the file was truncated (important), (2) suggests linear continuation with offset=N (problematic). The map provides better navigation, but we preserve awareness that the file was truncated. The specific "offset=2001" suggestion is removed since the map provides better guidance.

### 2. Re-reads of the same file reuse map from context?

**Decision: Always return the map.** The LLM is responsible for not re-reading files it already has maps for.

The tool always returns the map for large files. Detecting existing maps in context requires scanning conversation history, which is complex and fragile. The map cache (by path + mtime) ensures regenerating is cheap. Context waste from duplicate maps is an LLM behavior issue, not a tool issue.

### 3. Map budget size?

**Decision: 20 KB hard cap with progressive reduction.**

- Full (≤10 KB): signatures, line ranges, nesting, imports
- Compact (≤15 KB): names, line ranges, nesting, no signatures  
- Minimal (≤20 KB): names, line ranges only, no nesting
- Outline (fallback): top-level symbols only (guaranteed to fit)

Most files fit at full or compact level. Only pathological files hit outline.

### 4. Map in collapsible section?

**Decision: Plain text with box delimiters.** No XML tags or special markup.

Box drawing characters (─────) make the map visually distinct without requiring special parsing. Works with all models, easy to read in TUI and logs. We can revisit XML wrapping if models struggle to distinguish map from content.

### 5. Codemap integration approach?

**Decision: CLI for Phase 1, internalize in Phase 3.**

CLI is simpler and more robust for initial implementation. The ~200-500ms subprocess overhead is acceptable since map generation is cached. 

In Phase 3, internalize codemap's tree-sitter symbol extraction directly into the extension for:
- No subprocess overhead
- Full control over output format
- Ability to extend to Python/Go via tree-sitter grammars
- No coupling to external project

### 6. Go binary distribution?

**Decision: Compile on first use with graceful fallback.**

```typescript
// Check for binary, compile if missing, fall back to grep if Go unavailable
if (!existsSync(binaryPath)) {
  const result = await pi.exec("go", ["build", "-o", binaryPath, sourcePath]);
  if (result.code !== 0) return null; // Fall through to fallback mapper
}
```

This works seamlessly for Go developers (most users of .go files), degrades gracefully to grep/ctags for users without Go, compiles once then uses cached binary, and avoids shipping platform-specific binaries.

## Validation Strategy

### Validation Command

`npm run validate` runs all static checks:

```bash
npm run validate
# Runs: typecheck → lint → format:check
```

**package.json scripts:**
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "oxlint -c .oxlintrc.json",
    "lint:fix": "oxlint -c .oxlintrc.json --fix",
    "format": "oxfmt --config .oxfmtrc.jsonc",
    "format:check": "oxfmt --config .oxfmtrc.jsonc --check",
    "test": "vitest run",
    "test:watch": "vitest",
    "validate": "npm run typecheck && npm run lint && npm run format:check",
    "e2e": "npm run test:e2e",
    "test:e2e": "vitest run --config vitest.e2e.config.ts"
  }
}
```

### Test Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  E2E Tests (pi spawned via tmux)                                │
│  - Validates actual read tool output in real pi session         │
│  - Confirms map appears in context for large files              │
│  - Confirms small files/offset reads pass through unchanged     │
└─────────────────────────────────────────────────────────────────┘
          ▲
┌─────────────────────────────────────────────────────────────────┐
│  Integration Tests (vitest)                                     │
│  - Extension loads without errors                               │
│  - Tool registration succeeds                                   │
│  - Mapper dispatcher routes correctly by extension              │
│  - Budget enforcement produces correct detail levels            │
└─────────────────────────────────────────────────────────────────┘
          ▲
┌─────────────────────────────────────────────────────────────────┐
│  Unit Tests (vitest)                                            │
│  - Each mapper produces correct output for sample input         │
│  - Map formatter produces expected format                       │
│  - Language detection works for all extensions                  │
│  - Cache hit/miss logic works correctly                         │
└─────────────────────────────────────────────────────────────────┘
          ▲
┌─────────────────────────────────────────────────────────────────┐
│  Static Validation (npm run validate)                           │
│  - TypeScript compiles without errors                           │
│  - No lint violations                                           │
│  - Code is formatted                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Test Fixtures

```
tests/
├── fixtures/
│   ├── small/           # Files under threshold (passthrough)
│   │   ├── hello.py     # 50 lines
│   │   ├── hello.ts     # 50 lines
│   │   └── hello.go     # 50 lines
│   ├── large/           # Files over threshold (triggers map)
│   │   ├── processor.py       # 5,000 lines, realistic Python
│   │   ├── handler.ts         # 3,000 lines, realistic TypeScript
│   │   ├── server.go          # 4,000 lines, realistic Go
│   │   ├── schema.sql         # 2,500 lines, DDL statements
│   │   ├── data.json          # 100 KB, nested structure
│   │   └── readme.md          # 3,000 lines, deep heading hierarchy
│   ├── pathological/    # Edge cases
│   │   ├── many-symbols.py    # 5,000+ functions (budget stress test)
│   │   ├── deep-nesting.ts    # 20 levels of nesting
│   │   ├── no-symbols.txt     # Large file with no structure
│   │   └── binary.bin         # Binary file (should skip)
│   └── expected/        # Golden output files for comparison
│       ├── processor.py.map   # Expected map output
│       ├── handler.ts.map     # Expected map output
│       └── ...
├── unit/
│   ├── mappers/
│   │   ├── python.test.ts
│   │   ├── go.test.ts
│   │   ├── codemap.test.ts
│   │   ├── sql.test.ts
│   │   ├── json.test.ts
│   │   └── fallback.test.ts
│   ├── formatter.test.ts
│   ├── language-detect.test.ts
│   └── cache.test.ts
├── integration/
│   ├── extension-load.test.ts
│   ├── tool-registration.test.ts
│   ├── mapper-dispatch.test.ts
│   └── budget-enforcement.test.ts
└── e2e/
    ├── read-small-file.test.ts
    ├── read-large-file.test.ts
    ├── read-with-offset.test.ts
    └── read-image.test.ts
```

### E2E Test Pattern (tmux + pi)

E2E tests spawn pi in non-interactive mode and verify output:

```typescript
// tests/e2e/read-large-file.test.ts
import { describe, it, expect } from "vitest";
import { spawnPiSession, readOutput } from "../helpers/pi-runner";

describe("read large file", () => {
  it("produces a file map for files over threshold", async () => {
    const session = await spawnPiSession({
      extension: "./index.ts",
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
    
    await session.cleanup();
  });
  
  it("passes small files through unchanged", async () => {
    const session = await spawnPiSession({
      extension: "./index.ts",
      prompt: 'Use the read tool to read "tests/fixtures/small/hello.py"',
    });
    
    const output = await readOutput(session);
    
    // Should NOT contain map markers
    expect(output).not.toContain("File Map:");
    expect(output).not.toContain("───────────────────────────────────────");
    
    await session.cleanup();
  });
  
  it("passes offset reads through unchanged", async () => {
    const session = await spawnPiSession({
      extension: "./index.ts",
      prompt: 'Use the read tool to read "tests/fixtures/large/processor.py" with offset=100 and limit=50',
    });
    
    const output = await readOutput(session);
    
    // Targeted reads should NOT get a map
    expect(output).not.toContain("File Map:");
    
    await session.cleanup();
  });
});
```

### Pi Runner Helper (tmux-based)

```typescript
// tests/helpers/pi-runner.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

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

export async function readOutput(session: PiSession): Promise<string> {
  return readFile(session.outputFile, "utf-8");
}
```

### Phase-Specific Validation

Each phase has specific validation gates that must pass before moving to the next:

#### Phase 1 Validation Gates

| Task | Validation | Command |
|------|------------|---------|
| Extension structure | Extension loads without errors | `npm run validate` |
| Read tool override | Tool appears in `pi --help` tools list | E2E: verify `read` is registered |
| Language detection | All extensions map correctly | Unit: `language-detect.test.ts` |
| Python mapper | Correct symbols extracted | Unit: `mappers/python.test.ts` |
| Fallback mapper | Produces minimal outline | Unit: `mappers/fallback.test.ts` |
| Map formatting | Correct delimiters and structure | Unit: `formatter.test.ts` |
| Small file passthrough | No map, unchanged output | E2E: `read-small-file.test.ts` |
| Large file mapping | Map appended, guidance shown | E2E: `read-large-file.test.ts` |
| Offset passthrough | No map on targeted reads | E2E: `read-with-offset.test.ts` |

**Phase 1 complete when:** `npm run validate && npm test && npm run e2e` all pass.

#### Phase 2 Validation Gates

| Task | Validation | Command |
|------|------------|---------|
| Go mapper | Correct symbols, graceful fallback if no Go | Unit + E2E |
| SQL mapper | DDL statements extracted | Unit: `mappers/sql.test.ts` |
| JSON mapper | Schema extracted via jq | Unit: `mappers/json.test.ts` |
| Codemap integration | TS/JS/Markdown work | Unit: `mappers/codemap.test.ts` |
| C mapper | Regex patterns work | Unit: `mappers/c.test.ts` |
| Cross-language E2E | All core languages produce maps | E2E: full test matrix |

**Phase 2 complete when:** All Phase 1 + Phase 2 tests pass.

#### Phase 3 Validation Gates

| Task | Validation | Command |
|------|------------|---------|
| Codemap internalization | Tree-sitter symbols match CLI output | Unit: regression tests |
| Budget enforcement | Progressive reduction works | Unit + Integration |
| Caching | Cache hit avoids regeneration | Integration: timing tests |
| Performance | Map generation <200ms average | Integration: benchmark |
| Error handling | Mapper failure falls through gracefully | Unit: error injection |
| Configuration | Disable per-language works | Integration: config tests |

**Phase 3 complete when:** All tests pass, performance targets met.

#### Phase 4 Validation Gates

| Task | Validation | Command |
|------|------------|---------|
| YAML/TOML mappers | Top-level keys extracted | Unit tests |
| CSV mapper | Headers and row count | Unit tests |
| ctags integration | Works when installed, skips when not | Integration tests |

### Continuous Validation

During development, run:

```bash
# Watch mode for fast iteration
npm run test:watch

# Full validation before commits
npm run validate && npm test

# Full validation including E2E before PR
npm run validate && npm test && npm run e2e
```

### Performance Benchmarks

```typescript
// tests/benchmarks/map-generation.bench.ts
import { bench, describe } from "vitest";
import { generateMap } from "../../src/mapper";

describe("map generation performance", () => {
  bench("python: 5000 line file", async () => {
    await generateMap("tests/fixtures/large/processor.py");
  });
  
  bench("typescript: 3000 line file", async () => {
    await generateMap("tests/fixtures/large/handler.ts");
  });
  
  bench("go: 4000 line file", async () => {
    await generateMap("tests/fixtures/large/server.go");
  });
});

// Run with: npx vitest bench
```

### Golden File Testing

For map output consistency, use snapshot/golden file comparison:

```typescript
// tests/unit/mappers/python.test.ts
import { describe, it, expect } from "vitest";
import { pythonMapper } from "../../../src/mappers/python";
import { readFile } from "node:fs/promises";

describe("python mapper", () => {
  it("produces expected map for processor.py", async () => {
    const map = await pythonMapper("tests/fixtures/large/processor.py");
    const expected = await readFile("tests/fixtures/expected/processor.py.map", "utf-8");
    
    expect(map).toBe(expected);
  });
  
  // Or use vitest snapshots:
  it("produces consistent map output", async () => {
    const map = await pythonMapper("tests/fixtures/large/processor.py");
    expect(map).toMatchSnapshot();
  });
});
```

## Remaining Considerations

These are not blocking questions but areas to validate during implementation:

1. **Caching invalidation edge cases**: What happens if a file is modified while the map is being generated? The mtime check should handle this, but worth testing with rapid file changes.

2. **Very large symbol counts**: A file with 5,000+ symbols might exceed even the outline budget. May need a "truncated outline" fallback that shows first N and last N symbols with `...N more...` in between.

3. **Binary file detection**: The read tool already handles images specially. Ensure we don't try to map binary files (executables, archives, etc.).

4. **Symlink handling**: Should we cache by resolved path or symlink path? Resolved path is safer (same content = same map).

5. **Performance baseline**: Need to measure actual map generation times before/after internalization to validate the Phase 3 investment is worthwhile.
