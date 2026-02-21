# Inline Map Delivery (v1.3.0)

*2026-02-20*

`pi-read-map` now embeds structural maps directly in the `read` tool result text for large files.

## Why This Changed

Earlier versions sent maps as custom messages after the tool result. In parallel tool batches, those messages could interrupt execution and cause skipped reads.

Inlining the map in the same `read` result fixes that failure mode:

- no separate map message channel
- no read-recovery loop
- stable parallel read behavior

## Current Behavior

1. `read` is delegated unchanged for:
   - small files
   - targeted reads (`offset` / `limit`)
   - binary/image files
2. For large text files, `read` returns:
   - normal truncated file content
   - appended structural map text
3. For directory paths, extension behavior is:
   - run built-in `ls`
   - throw `EISDIR` with inline fallback listing text

## Verification

```bash
npm run test
npm run validate
npm pack --dry-run
```

Expected indicators:

- integration coverage includes `tests/integration/inline-map.test.ts`
- directory behavior covered by `tests/integration/directory-read.test.ts`
- no `read-recovery` test suite remains
- tarball excludes local scratch artifacts (`*.patch`, `*.orig`, `fix-*.js`, etc.)

## Notes

The demo comparison set in `demo/README.md` is still valid. The key difference is delivery mode: maps are now inline text in the `read` result, which improves concurrency behavior without changing the core map content.
