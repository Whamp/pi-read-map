# AGENTS.md

> Last updated: 2026-02-09

A pi extension that generates structural file maps for large files, enabling targeted reads instead of sequential scanning.

## Commands

| Command | Purpose | ~Time |
|---------|---------|-------|
| `npm run validate` | Typecheck + lint + format + dead-code | 15s |
| `npm test` | Unit + integration tests | 10s |
| `npm run test:e2e` | E2E tests (spawns pi processes) | 60s |
| `npm run typecheck` | TypeScript type checking | 5s |
| `npm run lint` | oxlint | 2s |
| `npm run format` | oxfmt | 2s |

## File Map

```
src/           → Extension core: entry, dispatcher, formatter, types
src/mappers/   → 16 language-specific parsers (typescript, rust, python, etc.)
scripts/       → External AST tools (python_outline.py, go_outline.go)
tests/unit/    → Mapper and utility tests
tests/integration/ → Dispatch, caching, budget tests
tests/e2e/     → Real pi session tests via process spawn
tests/fixtures/ → Sample files per language
docs/          → Plans, handoffs, reviews, todos
```

## Entry Point

`src/index.ts` — Registers `read` tool override, manages caching, renders file-map messages

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Extension entry: tool registration, caching, message rendering |
| `src/mapper.ts` | Dispatcher: routes to language mappers with fallback chain |
| `src/formatter.ts` | Budget-aware formatting with progressive detail reduction |
| `src/constants.ts` | Thresholds: 2K lines, 50 KB trigger; 10-100 KB budget tiers |
| `src/types.ts` | FileMap, FileSymbol, MapOptions interfaces |
| `src/enums.ts` | SymbolKind (22 kinds), DetailLevel (5 levels) |
| `src/mappers/typescript.ts` | ts-morph parser for TS/JS |
| `src/mappers/rust.ts` | tree-sitter parser for Rust |
| `src/mappers/ctags.ts` | Universal ctags fallback |
| `src/mappers/fallback.ts` | Grep-based heuristics as final fallback |

## Architecture

**Pipeline with fallback chain:**

1. `read(path)` called by agent
2. If offset/limit provided OR file ≤2K lines AND ≤50 KB → delegate to built-in read
3. Otherwise: detect language → try mapper → ctags → grep fallback
4. Format map with budget enforcement, cache by path+mtime
5. Return content + file-map message

**Budget tiers:** Full (≤10 KB) → Compact (≤15 KB) → Minimal (≤20 KB) → Outline (≤50 KB) → Truncated (≤100 KB)

## Patterns

- **Error handling:** Mappers return `null` on failure; dispatcher falls through
- **Lazy loading:** ts-morph, tree-sitter load on first use
- **Caching:** In-memory Map keyed by path; mtime invalidation
- **Subprocess mappers:** Python/Go use external scripts; Go compiles on first use
- **Naming:** camelCase functions, PascalCase types, SCREAMING_SNAKE constants

## Testing

- **Unit:** Verify individual mappers produce correct symbols
- **Integration:** Verify dispatch routing and budget enforcement
- **E2E:** Spawn actual pi processes in JSON mode, parse output

## Heuristics

| When | Do |
|------|-----|
| Adding a mapper | Create `src/mappers/<lang>.ts`, add to `src/mapper.ts` dispatch, add fixture |
| Changing thresholds | Update `src/constants.ts` THRESHOLDS object |
| Testing new language | Add fixture to `tests/fixtures/`, write unit test |
| Debugging map output | Run `npm test -- --grep "<mapper>"` to isolate |

## Boundaries

**Always:**
- Run `npm run validate` before committing
- Add tests for new mappers
- Return `null` from mappers on parse failure (never throw)

**Never:**
- Disable linter rules
- Remove or weaken tests
- Use `any` types

## Tech Stack

TypeScript, ts-morph, tree-sitter, Vitest, oxlint/oxfmt
