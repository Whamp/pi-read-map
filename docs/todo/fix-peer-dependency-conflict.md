# Fix Peer Dependency Conflict

## Status

**Partially Solved** — Using npm overrides as workaround

## The Problem

Conflicting peer dependency requirements between tree-sitter grammar packages:

| Package | Peer Dependency | Conflict |
|---------|-----------------|----------|
| `tree-sitter-cpp@0.23.4` | `tree-sitter ^0.21.1` | Wants older version |
| `tree-sitter-c@0.23.6` (dep of cpp) | `tree-sitter ^0.22.1` | Wants newer version |
| `tree-sitter-rust@0.23.3` | `tree-sitter ^0.22.1` | Wants newer version |

These ranges (^0.21.1 and ^0.22.1) don't overlap — no single version satisfies all.

## Root Cause

- `tree-sitter-cpp`'s source code on GitHub already has the fix (`tree-sitter ^0.22.4`)
- But version 0.23.4 on npm still has the old peer dependency
- A new version hasn't been published yet

## Solution Implemented

Using npm `overrides` in `package.json`:

```json
"overrides": {
  "tree-sitter": "$tree-sitter"
}
```

This forces all packages to use the exact `tree-sitter` version specified in our dependencies, ignoring peer dependency constraints.

**Result:** `npm install` works without `--legacy-peer-deps`.

## Permanent Solutions

### Option A: Wait for Upstream Fix (Recommended)

When `tree-sitter-cpp@0.23.5` or `0.24.0` is published, the peer dependency will be updated.

**Check command:**
```bash
npm view tree-sitter-cpp version
```

**When new version is available:**
1. Remove the `overrides` section from `package.json`
2. Update: `npm install tree-sitter-cpp@latest`
3. Verify: `npm install` (should work without --legacy-peer-deps)

### Option B: Align All Versions to ^0.21.x

Downgrade to versions with matching peer dependencies:
- `tree-sitter@0.21.1`
- `tree-sitter-cpp@0.23.4`
- `tree-sitter-rust@0.23.1` (last version with ^0.21.x support)

**Trade-off:** Lose bug fixes in tree-sitter-rust 0.23.2+

## References

- tree-sitter-cpp GitHub source already has fix (peer dependency: ^0.22.4)
- tree-sitter/tree-sitter-javascript#347 — Similar peer dependency update request
- npm overrides documentation: https://docs.npmjs.com/cli/v9/configuring-npm/package-json#overrides

## Created

2026-02-09
