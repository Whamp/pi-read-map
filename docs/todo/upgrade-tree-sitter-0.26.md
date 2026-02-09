# Upgrade tree-sitter to 0.26.3+

## Status

**Blocked** — waiting for upstream release

## Current Situation

We are using:
- `tree-sitter@0.22.4` (working)
- `tree-sitter-cpp@0.23.4` (latest)
- `tree-sitter-rust@0.23.3` (latest)

## Problem

`tree-sitter@0.25.0` (current latest on npm) **fails to build** with Node.js 24 due to:

1. **Missing C++20 compiler flags** in `binding.gyp`
2. **No prebuilt binaries** for Node 24 ABI (module version 127+)

The build fails with:
```
error: #error "C++20 or later required."
```

## Solution

Wait for `tree-sitter@0.26.3+` which explicitly adds Node 24 support.

## Check Command

```bash
npm view tree-sitter version
```

When this shows `0.26.3` or higher, proceed with upgrade.

## Upgrade Steps (When Unblocked)

1. Check latest version:
   ```bash
   npm view tree-sitter versions --json | tail -5
   ```

2. Test if 0.26.3+ builds successfully:
   ```bash
   npm install tree-sitter@0.26.3 --save
   ```

3. If build succeeds, update `package.json`:
   ```json
   "tree-sitter": "0.26.3"
   ```

4. Run full test suite:
   ```bash
   npm run validate
   npm run test
   ```

5. Check grammar package compatibility:
   - Verify `tree-sitter-cpp` and `tree-sitter-rust` peer dependencies
   - May need `--legacy-peer-deps` if version constraints conflict

## References

- tree-sitter/node-tree-sitter#256 — Missing prebuild binaries for 0.25.0
- tree-sitter/tree-sitter#4234 — CLI v0.25.2 Node binding issues
- Search results confirm 0.26.3 adds Node 24 support (not yet on npm)

## Created

2026-02-09
