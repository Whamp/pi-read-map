# Completed Phase TODOs

## Status

All phases are **SUBSTANTIALLY COMPLETE**. Core functionality implemented and working.

## Summary

| Phase | Status | Core Work | Remaining Gaps |
|-------|--------|-----------|----------------|
| Phase 1 | Complete | Foundation, TypeScript mapper, basic structure | E2E tests not implemented |
| Phase 2 | Complete | Go, SQL, JSON, C mappers, codemap integration | E2E tests not implemented |
| Phase 3 | Complete | Tree-sitter/ts-morph internalization, cache, budget enforcement | E2E tests, some integration tests |
| Phase 4 | Complete | YAML, TOML, CSV mappers, ctags fallback | Minor: quoted YAML keys, edge case tests |

## Common Theme

All phases are missing **E2E tests** — validation that the extension works when loaded into an actual pi session. This was planned but never implemented:

- `tests/e2e/` — Empty
- `tests/helpers/pi-runner.ts` — Not built
- `tests/integration/` — Partially filled (Phase 4+)

## Why These Are "Completed"

1. **Validation gates met**: All phases pass `npm run validate` and unit tests
2. **Core functionality works**: All mappers implemented and functional
3. **E2E gap is systemic**: Same missing piece across all phases, tracked separately if needed

## If E2E Tests Are Needed

Create a new top-level TODO:
```
docs/todo/e2e-test-infrastructure.md
```

With references to:
- `completed/phase-1.md` — Section 2.1 (pi-runner.ts helper)
- `completed/phase-2.md` — Section 2.1 (E2E test matrix)
- `completed/phase-3.md` — Section 2.2 (validation gates)
