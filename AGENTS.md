# AGENTS.md

> Last updated: 2026-02-10

Pi extension that augments the built-in `read` tool with structural file maps for large files (>2,000 lines or >50 KB). Intercepts `read` calls, generates symbol maps via language-specific parsers, and sends them as separate `file-map` messages after the tool result.

## Commands (verified 2026-02-10)

| Command | Purpose | ~Time |
|---------|---------|-------|
| `npm run test` | Unit + integration tests (vitest) | ~2s |
| `npm run test:integration` | Integration tests only | ~1s |
| `npm run test:e2e` | E2E tests (requires pi + tmux) | ~60s |
| `npm run bench` | Benchmarks | ~5s |
| `npm run typecheck` | `tsc --noEmit` | ~2s |
| `npm run lint` | oxlint (via npx) | ~1s |
| `npm run lint:fix` | Auto-fix lint issues | ~1s |
| `npm run format` | Format with oxfmt | ~1s |
| `npm run format:check` | Check formatting | ~1s |
| `npm run validate` | typecheck + lint + format:check | ~4s |

## File Map

```
src/
├── index.ts              → Extension entry: tool registration, caching, message rendering
├── mapper.ts             → Dispatcher: routes files to language mappers, fallback chain
├── formatter.ts          → Budget-aware formatting with progressive detail reduction
├── language-detect.ts    → File extension → language mapping
├── types.ts              → FileMap, FileSymbol, MapOptions, FileMapMessageDetails
├── enums.ts              → SymbolKind (21 kinds), DetailLevel (5 levels)
├── constants.ts          → THRESHOLDS: lines, bytes, budget tiers
└── mappers/              → One mapper per language (16 total)
    ├── typescript.ts     → ts-morph (handles TS + JS)
    ├── rust.ts           → tree-sitter-rust
    ├── cpp.ts            → tree-sitter-cpp (C++ and .h files)
    ├── python.ts         → subprocess: scripts/python_outline.py
    ├── go.ts             → subprocess: scripts/go_outline.go
    ├── json.ts           → subprocess: jq
    ├── c.ts              → Regex patterns
    ├── sql.ts            → Regex
    ├── markdown.ts       → Regex
    ├── yaml.ts           → Regex
    ├── toml.ts           → Regex
    ├── csv.ts            → In-process streaming
    ├── jsonl.ts          → In-process streaming
    ├── ctags.ts          → universal-ctags fallback
    └── fallback.ts       → Grep-based final fallback

scripts/
├── python_outline.py     → Python AST extraction (called by python mapper)
├── go_outline.go         → Go AST extraction (compiled on first use)
└── go_outline             → Compiled Go binary

tests/
├── unit/                 → Mapper tests, formatter tests, language detection
├── integration/          → Dispatch, caching, budget enforcement, map messages
├── e2e/                  → Real pi sessions via tmux (vitest.e2e.config.ts)
├── fixtures/             → Sample files per language
├── benchmarks/           → Mapper performance benchmarks
└── helpers/              → Test utilities (pi-runner, constants, models)

docs/
├── plans/                → Implementation plans (phased)
├── handoffs/             → Session handoff notes
├── reviews/              → Phase review documents
└── todo/                 → Outstanding work items
```

## Architecture

Dispatch chain: `index.ts` → `mapper.ts` → language mapper → ctags → fallback.

Budget enforcement in `formatter.ts` uses progressive detail reduction:
- 10 KB: full detail (signatures, modifiers)
- 15 KB: compact (drop signatures)
- 20 KB: minimal (names + line ranges only)
- 50 KB: outline (top-level symbols only)
- 100 KB: truncated (first/last 50 symbols, hard cap)

Maps are cached in-memory by `(filePath, mtime)`. Delivered as custom `file-map` messages via `pi.sendMessage()` after the `tool_result` event.

## Golden Samples

| For | Reference | Key patterns |
|-----|-----------|--------------|
| New mapper | `src/mappers/csv.ts` | Simple, clean, regex-free in-process parsing |
| Complex mapper | `src/mappers/typescript.ts` | ts-morph AST walk, nested symbols, modifiers |
| Subprocess mapper | `src/mappers/python.ts` | Calls external script, parses JSON output |
| Unit test | `tests/unit/mappers/csv.test.ts` | Fixture-based, edge cases, null returns |
| Integration test | `tests/integration/budget-enforcement.test.ts` | Tests progressive detail reduction |

## Heuristics

| When | Do |
|------|-----|
| Adding a new language | Create `src/mappers/<lang>.ts`, add to `MAPPERS` in `mapper.ts`, add extension in `language-detect.ts`, add unit test |
| Mapper returns too many symbols | Rely on `formatter.ts` budget system, don't filter in mappers |
| Mapper can't parse a file | Return `null` — the dispatch chain falls through to ctags then fallback |
| Adding a new SymbolKind | Add to `enums.ts`, update formatter if display differs |
| Testing mappers | Use fixture files in `tests/fixtures/`, never mock file reads |
| E2E tests | Require pi installed + tmux; use `tests/helpers/pi-runner.ts` |

## Boundaries

**Always:**
- Return `FileMap` or `null` from mappers (never throw)
- Include `startLine` and `endLine` for every symbol (1-indexed)
- Run `npm run validate` before committing
- Use existing `FileSymbol` interface for all symbol data

**Ask first:**
- Changing budget thresholds in `constants.ts`
- Adding new `DetailLevel` variants
- Modifying the tool description in `index.ts`
- Changes to the `tool_result` event handler

**Never:**
- Filter symbols in mappers based on budget (formatter handles this)
- Add runtime dependencies without discussing (binary size matters for pi extensions)
- Use `any` types
- Disable lint rules

## Codebase State

- `oxlint` installed as devDependency; `npm run lint` exits cleanly (0 errors, 0 warnings)
- `tree-sitter` pinned to 0.22.4 due to peer dependency conflicts (see `docs/todo/upgrade-tree-sitter-0.26.md`)
- Go outline script auto-compiles on first use; compiled binary checked in at `scripts/go_outline`
- Phase 1-4 of implementation plan complete; remaining TODOs in `docs/todo/`

| Docstrings / JSDoc | `FileSymbol.docstring?: string` | First-line summary of doc comments |
| Exported flag | `FileSymbol.isExported?: boolean` | Whether symbol is part of public API |
| Required imports | `FileMap.imports: string[]` | Always an array, never undefined |

## Terminology

| Docstring | First line of a JSDoc / doc comment on a symbol |
| isExported | Boolean flag: true if symbol is part of the module's public API |
| Term | Means |
|------|-------|
| Map | Structural outline of a file's symbols with line ranges |
| Mapper | Language-specific parser that produces a `FileMap` |
| Budget | Maximum byte size for formatted map output |
| Detail level | How much information each symbol carries (full → truncated) |
| Fallback chain | mapper → ctags → grep when parsers fail |
| Pending map | Map waiting to be sent after `tool_result` event fires |

## Tech Stack

- **Runtime:** Node.js (ES2022 modules)
- **Language:** TypeScript (strict, `noUncheckedIndexedAccess`)
- **Testing:** Vitest (unit/integration: 10s timeout, e2e: 60s timeout)
- **Linting:** oxlint + oxfmt
- **Parsing:** ts-morph, tree-sitter, regex, subprocess (Python/Go/jq)
- **Framework:** pi extension API (`@mariozechner/pi-coding-agent`)
