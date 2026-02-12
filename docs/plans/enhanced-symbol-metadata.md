# Plan: Enhanced Symbol Metadata

> Created: 2026-02-12

Three additions to `FileSymbol` and `FileMap` that give the reading agent better context about symbols and file structure.

| Change | Field | Where |
|--------|-------|-------|
| Docstrings / JSDoc | `FileSymbol.docstring?: string` | types, mappers, formatter |
| Exported flag | `FileSymbol.isExported?: boolean` | types, mappers, formatter |
| Required imports | `FileMap.imports: string[]` (no longer optional) | types, all mappers, formatter |

## Principles

- Mappers extract data. Formatter decides what to display based on budget.
- New fields are additive. No existing test should break.
- `imports` becomes required (`string[]`, never `undefined`). Empty array when none detected.
- `docstring` stores the first line only (one-liner summary). Full JSDoc bodies waste budget.
- `isExported` is a simple boolean: `true` if the symbol is part of the module's public API.

---

## Phase 1: Type Changes and Imports Normalization

### 1.1 Add `docstring` and `isExported` to `FileSymbol`

**File:** `src/types.ts`

Add two optional fields to `FileSymbol`:

```ts
/** First line of JSDoc / docstring (if present) */
docstring?: string;
/** Whether this symbol is exported from its module */
isExported?: boolean;
```

These are optional so existing mappers continue to work without changes.

### 1.2 Make `imports` required on `FileMap`

**File:** `src/types.ts`

Change:
```ts
imports?: string[];
```
To:
```ts
/** Module imports / dependencies */
imports: string[];
```

### 1.3 Update all mappers to return `imports: []` when empty

Currently 4 mappers populate imports (TypeScript, Python, Go, Rust). The other 12 mappers either return `undefined` or omit the field. Update every mapper to always set `imports: []` as the default.

**Files to touch:**
- `src/mappers/c.ts` — add `imports: []`
- `src/mappers/cpp.ts` — add `imports: []` (also: extract `#include` directives)
- `src/mappers/csv.ts` — add `imports: []`
- `src/mappers/ctags.ts` — add `imports: []`
- `src/mappers/fallback.ts` — add `imports: []`
- `src/mappers/json.ts` — add `imports: []`
- `src/mappers/jsonl.ts` — add `imports: []`
- `src/mappers/markdown.ts` — add `imports: []`
- `src/mappers/sql.ts` — add `imports: []`
- `src/mappers/toml.ts` — add `imports: []`
- `src/mappers/yaml.ts` — add `imports: []`
- `src/mappers/go.ts` — change conditional `if (result.imports)` to always assign
- `src/mappers/python.ts` — change conditional to always assign

**Files already correct (always populate):**
- `src/mappers/typescript.ts`
- `src/mappers/rust.ts`

### 1.4 Update formatter to handle `imports: []`

**File:** `src/formatter.ts`

The formatter currently checks `map.imports?.length`. After this change, `imports` is always an array. Update the guard:

```ts
// Before:
if (map.imports?.length && map.imports.length > 0)
// After:
if (map.imports.length > 0)
```

Also update `reduceToLevel` for `Outline` detail — currently sets `imports: undefined`, change to `imports: []`.

### 1.5 Update `reduceToLevel` and `reduceToTruncated`

These functions strip fields at lower detail levels. Ensure:
- `Outline` and `Truncated` set `imports: []` (not `undefined`)
- `docstring` and `isExported` are dropped at `Minimal`, `Outline`, and `Truncated` levels
- `docstring` is kept at `Full` and `Compact`
- `isExported` is kept at `Full` and `Compact`

### Validation — Phase 1

1. `npm run typecheck` — catches any mapper returning `imports: undefined`
2. `npm run test` — all existing tests pass
3. `npm run lint` — zero warnings
4. `npm run format:check` — clean
5. `npm run dead-code` — no new dead exports
6. Manual check: `grep -rn 'imports?' src/` should show no optional access of `FileMap.imports` (only `FileSymbol` fields remain optional)
7. Run `uvx showboat init docs/plans/phase1-demo.md "Phase 1: Types and Imports Normalization"` then use showboat to create a demo document proving the changes compile and tests pass

---

## Phase 2: Docstrings in TypeScript Mapper

### 2.1 Extract JSDoc first line in TypeScript mapper

**File:** `src/mappers/typescript.ts`

ts-morph provides `getJsDocs()` on function/class/interface/enum/type-alias/variable declarations. Extract the first `@description` tag or the first line of the doc comment body.

Add a helper:

```ts
function getDocstring(node: JSDocableNode): string | undefined {
  const docs = node.getJsDocs();
  if (docs.length === 0) return undefined;
  const firstDoc = docs[0];
  // Get description text, take first line only
  const text = firstDoc.getDescription().trim();
  if (!text) return undefined;
  const firstLine = text.split('\n')[0].trim();
  return firstLine || undefined;
}
```

Add `docstring` field to the `InternalSymbol` interface and populate it for every symbol kind that supports JSDoc (functions, classes, interfaces, type aliases, enums, variables).

Wire it through to the `FileSymbol` output in the conversion step.

### 2.2 Add fixture with JSDoc comments

**File:** `tests/fixtures/js/jsdoc.ts`

Create a fixture containing:
- Function with `/** ... */` doc comment
- Class with JSDoc on the class and on methods
- Interface with JSDoc
- Variable with JSDoc
- Function without JSDoc (should have `docstring: undefined`)
- Multi-line JSDoc (only first line should appear)

### 2.3 Add unit tests for docstring extraction

**File:** `tests/unit/mappers/typescript.test.ts`

Add test cases:
- `it("extracts JSDoc docstrings from functions")`
- `it("extracts JSDoc docstrings from classes and methods")`
- `it("returns only the first line of multi-line JSDoc")`
- `it("returns undefined docstring when no JSDoc present")`
- `it("handles @description tag")`

### Validation — Phase 2

1. `npm run typecheck`
2. `npm run test` — new tests pass, old tests unaffected
3. `npm run lint`
4. `npm run format:check`
5. `npm run dead-code`
6. Boundary check: verify `docstring` field is not used in `formatter.ts` yet (deferred to Phase 5)
7. Run `uvx showboat init docs/plans/phase2-demo.md "Phase 2: TypeScript Docstrings"` then use showboat to demo the new fixture extraction

---

## Phase 3: Docstrings in Python, Rust, Go, C++ Mappers

### 3.1 Python docstrings

**File:** `scripts/python_outline.py`

Python AST already tracks docstrings via `ast.get_docstring(node)`. Add a `docstring` field to the JSON output — first line only.

**File:** `src/mappers/python.ts`

Parse the new `docstring` field from the JSON output and set it on `FileSymbol`.

### 3.2 Rust doc comments

**File:** `src/mappers/rust.ts`

Rust uses `/// doc comment` and `//! inner doc comment`. In tree-sitter-rust, doc comments appear as `line_comment` nodes with text starting with `///` immediately before a symbol node. Add extraction logic:

1. Before processing each symbol node, check previous siblings for `line_comment` nodes starting with `///`
2. Collect them, strip the `/// ` prefix, take the first line

### 3.3 Go doc comments

**File:** `scripts/go_outline.go`

Go AST provides `Doc` field on `FuncDecl`, `GenDecl`, `TypeSpec`. Add `Docstring` to the JSON output struct. Extract `Doc.Text()`, take first line.

**File:** `src/mappers/go.ts`

Parse the new `docstring` field from JSON output.

### 3.4 C++ doc comments (Doxygen-style)

**File:** `src/mappers/cpp.ts`

C++ uses `/** ... */` and `/// ...` (Doxygen). tree-sitter-cpp captures these as `comment` nodes. Add extraction logic similar to Rust: check previous siblings for comment nodes, extract first line.

### 3.5 Add fixtures and tests

**Files:**
- `tests/fixtures/python/docstrings.py` — functions and classes with docstrings
- `tests/fixtures/rust/docstrings.rs` — functions and structs with `///` comments
- `tests/fixtures/go/docstrings.go` — functions and types with doc comments
- `tests/fixtures/cpp/docstrings.cpp` — functions and classes with Doxygen comments

**Test files:**
- Add docstring test cases in each mapper's existing test file

### Validation — Phase 3

1. `npm run typecheck`
2. `npm run test` — all pass
3. `npm run lint`
4. `npm run format:check`
5. `npm run dead-code`
6. Verify Go outline binary recompiles: `rm scripts/go_outline && npm run test`
7. Boundary check: confirm no mapper filters or modifies docstrings based on budget (that's the formatter's job)
8. Run `uvx showboat init docs/plans/phase3-demo.md "Phase 3: Multi-Language Docstrings"` then use showboat to demo docstring extraction across all 4 languages

---

## Phase 4: `isExported` Flag

### 4.1 TypeScript mapper

**File:** `src/mappers/typescript.ts`

The `InternalSymbol` interface already has an `exported` boolean. Wire it to `FileSymbol.isExported` in the conversion step. This is a one-liner in the mapping function.

### 4.2 Python mapper

**File:** `scripts/python_outline.py`

Python convention: symbols starting with `_` are private. Add `is_exported` to JSON output:
```python
"is_exported": not name.startswith("_")
```

**File:** `src/mappers/python.ts` — parse and set `isExported`.

### 4.3 Rust mapper

**File:** `src/mappers/rust.ts`

In tree-sitter-rust, visibility is indicated by `visibility_modifier` child nodes (e.g. `pub`, `pub(crate)`). Check for the presence of a `visibility_modifier` whose text is `pub` (not `pub(crate)`, `pub(super)`, `pub(self)`). Set `isExported` accordingly.

### 4.4 Go mapper

**File:** `scripts/go_outline.go`

Go convention: exported symbols start with an uppercase letter. Add `IsExported` to JSON output:
```go
IsExported: unicode.IsUpper(rune(name[0]))
```

**File:** `src/mappers/go.ts` — parse and set `isExported`.

### 4.5 C++ mapper

**File:** `src/mappers/cpp.ts`

C++ doesn't have a clean module export concept. Use a heuristic: symbols not in an anonymous namespace and not marked `static` are considered exported. Set `isExported` based on this.

### 4.6 C mapper (regex)

**File:** `src/mappers/c.ts`

Similar to C++: symbols not marked `static` are considered exported.

### 4.7 Other mappers

For mappers where export semantics don't apply (markdown, json, yaml, toml, csv, jsonl, sql, ctags, fallback), leave `isExported` as `undefined`.

### 4.8 Add tests

Add test cases to each affected mapper's test file:
- `it("marks exported symbols with isExported=true")`
- `it("marks private symbols with isExported=false")`

Update fixtures as needed to include both exported and non-exported symbols.

### Validation — Phase 4

1. `npm run typecheck`
2. `npm run test`
3. `npm run lint`
4. `npm run format:check`
5. `npm run dead-code`
6. Boundary check: confirm no mapper filters symbols based on `isExported` (that's not their job)
7. Duplication check: ensure `isExported` logic doesn't duplicate `modifiers` detection — both may coexist, but `isExported` is semantic, `modifiers` is syntactic
8. Run `uvx showboat init docs/plans/phase4-demo.md "Phase 4: isExported Flag"` then use showboat to demo exported vs private symbol detection across languages

---

## Phase 5: Formatter Integration

### 5.1 Display docstrings at Full detail level

**File:** `src/formatter.ts`

In `formatSymbol()`, when `level === DetailLevel.Full` and `symbol.docstring` is set, append it after the line range:

```
functionName(args): [10-25] — Processes incoming requests
```

The ` — ` separator plus first-line summary keeps it compact.

### 5.2 Display export markers at Full and Compact levels

In `formatSymbol()`, when `symbol.isExported === true` and level is `Full` or `Compact`, nothing changes (the `export` modifier already appears in `modifiers`). But when `isExported === false` and the language uses explicit exports (TS/JS), we can optionally prefix with `(private)` or similar. **Decision**: don't add noise. The `export` keyword already appears in modifiers at Full level. The `isExported` flag is primarily for downstream consumers (LLM context prioritization), not for display formatting.

### 5.3 Drop docstrings at reduced detail levels

In `reduceToLevel()`:
- `Full`: keep `docstring` and `isExported`
- `Compact`: keep `docstring` and `isExported`
- `Minimal`: drop `docstring`, keep `isExported`
- `Outline`: drop both
- `Truncated`: drop both

### 5.4 Update budget enforcement tests

**File:** `tests/integration/budget-enforcement.test.ts`

Add test that verifies:
- Docstrings appear at Full detail level
- Docstrings are dropped at Minimal level
- `isExported` is preserved through Compact level
- Map still fits within budget tiers after adding docstrings

### 5.5 Update formatter unit tests

**File:** `tests/unit/formatter.test.ts` (create if needed)

Test `formatSymbol()` with docstring and isExported fields at each detail level.

### Validation — Phase 5

1. `npm run typecheck`
2. `npm run test`
3. `npm run lint`
4. `npm run format:check`
5. `npm run dead-code`
6. Budget check: run the existing budget enforcement integration tests — verify no regressions from the additional docstring bytes at full detail
7. Duplication check: ensure docstring display logic is only in `formatSymbol`, not scattered
8. Run `uvx showboat init docs/plans/phase5-demo.md "Phase 5: Formatter Integration"` then use showboat to demo formatted output at each detail level showing docstrings appearing/disappearing

---

## Phase 6: Integration Testing and Cleanup

### 6.1 End-to-end validation

Run the full pi-read-map on a real large TypeScript file and verify:
- `imports` is always an array (never `undefined`)
- Docstrings appear in the file map output for documented symbols
- `isExported` is set for exported symbols
- Budget tiers still produce correctly-sized output

### 6.2 Integration test updates

**File:** `tests/integration/dispatch.test.ts`

Add assertions that `imports` is always an array in map results.

### 6.3 Update AGENTS.md

Update the `FileSymbol` description and the terminology table to mention `docstring` and `isExported`.

### 6.4 Final validation

1. `npm run typecheck`
2. `npm run test`
3. `npm run test:integration`
4. `npm run lint`
5. `npm run format:check`
6. `npm run dead-code`
7. `npm run validate` (full suite)
8. `npm run bench` — verify no performance regression from docstring extraction
9. Run `uvx showboat init docs/plans/phase6-demo.md "Phase 6: Integration and Cleanup"` then use showboat to demo a complete file map with all three new features visible

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Docstring extraction slows down mappers | First-line-only extraction is O(1) per symbol; benchmark in Phase 6 |
| Budget blowout from docstrings | Formatter drops them at Minimal+ levels; same progressive reduction |
| `imports: string[]` breaks consumers | pi extension is the only consumer; update is trivial |
| Go binary needs recompilation | Existing auto-compile mechanism handles this; delete binary to force |
| ts-morph `getJsDocs()` returns empty for `/** */` variants | Test with multiple JSDoc styles in fixture |

## Boundaries

- Do **not** filter symbols by `isExported` in mappers or formatter
- Do **not** include full multi-line docstrings (first line only)
- Do **not** add new `SymbolKind` variants
- Do **not** change budget thresholds in `constants.ts`
- Do **not** add new runtime dependencies
