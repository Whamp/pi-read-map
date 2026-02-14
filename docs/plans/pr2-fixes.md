# PR #2 Fix Plan: Clojure Mapper Review Issues

> Created: 2026-02-14
> Branch: `pr-2`
> Scope: 3 medium + 2 low issues from code review, including 1 codebase-wide weakness

## Setup

```bash
cd /home/will/projects/pi-read-map
git checkout pr-2
npm install
```

Verify baseline before starting:
```bash
npm run validate   # expect: clean (typecheck + lint + format + dead-code)
npm run test       # expect: 237 tests pass, 0 failures
```

## Issues

| # | Severity | Summary | Files |
|---|----------|---------|-------|
| 1 | Medium | Dead `hasChildren` flags on `defrecord`/`deftype` | `src/mappers/clojure.ts` |
| 2 | Medium | No language-detect test for Clojure extensions | `tests/unit/language-detect.test.ts` |
| 3 | Medium | Unpinned GitHub dependency | `package.json` |
| 4 | Low (codebase-wide) | Tree-sitter tests silently pass when parser unavailable | `tests/unit/mappers/{clojure,rust,cpp,ctags}.test.ts` |
| 5 | Low | `platform::clj` double-colon modifier breaks naming convention | `src/mappers/clojure.ts`, `tests/unit/mappers/clojure.test.ts` |

~~Finding 6 (protocol method docstring)~~ — **invalidated during verification**. In Clojure protocols, the string after `[params]` IS the docstring; protocol methods have no body. The code is correct.

---

## Task 1: Remove dead `hasChildren` from `defrecord`/`deftype`

**Problem:** `DEF_FORMS` declares `hasChildren: true` for `defrecord` and `deftype`, but the only consumer (line 368) gates on `formName === "defprotocol"`. The flags are misleading dead code.

**Why not implement child extraction instead?** `defrecord`/`deftype` inline protocol implementations have a different structure than `defprotocol` method signatures. The methods are full implementations (with bodies), interleaved with interface names. Extracting them correctly requires walking a more complex tree shape. The simpler fix is to remove the dead flags and add a TODO comment for future work.

**Changes in `src/mappers/clojure.ts`:**

Find (line 32-33):
```typescript
  defrecord: { kind: SymbolKind.Class, hasChildren: true },
  deftype: { kind: SymbolKind.Class, hasChildren: true },
```

Replace with:
```typescript
  defrecord: { kind: SymbolKind.Class },
  deftype: { kind: SymbolKind.Class },
```

Find (around line 368):
```typescript
  let children: FileSymbol[] | undefined;
  if (defInfo.hasChildren && formName === "defprotocol") {
```

Replace with:
```typescript
  // Only defprotocol has extractable method children.
  // TODO: defrecord/deftype inline protocol methods are not yet extracted.
  let children: FileSymbol[] | undefined;
  if (defInfo.hasChildren && formName === "defprotocol") {
```

After this change, `grep -c 'hasChildren' src/mappers/clojure.ts` should return `2` (the type definition on line 22 and the defprotocol check).

**Validation:**
```bash
showboat exec docs/plans/pr2-validation.md bash "grep -c 'hasChildren' src/mappers/clojure.ts"
# expect: 2
showboat exec docs/plans/pr2-validation.md bash "npx vitest run tests/unit/mappers/clojure.test.ts --reporter=dot 2>&1 | tail -3"
```

---

## Task 2: Add language-detect test for Clojure

**Problem:** Every other language in `EXTENSION_MAP` has a corresponding test case in `tests/unit/language-detect.test.ts`. Clojure's four extensions (`.clj`, `.cljs`, `.cljc`, `.edn`) have none.

**Changes in `tests/unit/language-detect.test.ts`:**

Find the test block for C++ (this is the alphabetically adjacent block):
```typescript
  it("detects C++ files", () => {
    expect(detectLanguage("file.cpp")).toEqual({ id: "cpp", name: "C++" });
    expect(detectLanguage("file.cc")).toEqual({ id: "cpp", name: "C++" });
    expect(detectLanguage("file.cxx")).toEqual({ id: "cpp", name: "C++" });
    expect(detectLanguage("file.hpp")).toEqual({ id: "cpp", name: "C++" });
  });
```

Insert AFTER it:
```typescript

  it("detects Clojure files", () => {
    expect(detectLanguage("file.clj")).toEqual({
      id: "clojure",
      name: "Clojure",
    });
    expect(detectLanguage("file.cljs")).toEqual({
      id: "clojure",
      name: "ClojureScript",
    });
    expect(detectLanguage("file.cljc")).toEqual({
      id: "clojure",
      name: "Clojure",
    });
    expect(detectLanguage("file.edn")).toEqual({
      id: "clojure",
      name: "EDN",
    });
  });
```

Note: The display names match `src/language-detect.ts` exactly:
- `.clj` → `{ id: "clojure", name: "Clojure" }`
- `.cljs` → `{ id: "clojure", name: "ClojureScript" }`
- `.cljc` → `{ id: "clojure", name: "Clojure" }`
- `.edn` → `{ id: "clojure", name: "EDN" }`

**Validation:**
```bash
showboat exec docs/plans/pr2-validation.md bash "npx vitest run tests/unit/language-detect.test.ts --reporter=dot 2>&1 | tail -3"
```

---

## Task 3: Pin GitHub dependency to commit hash

**Problem:** `package.json` specifies `"github:ghoseb/tree-sitter-clojure"` without a commit hash. The lockfile pins to commit `78928e6e59734bf6c182283b26b93b78d0e6c840` but `npm install` without a lockfile could pull a different commit.

**Changes in `package.json`:**

Find:
```json
    "tree-sitter-clojure": "github:ghoseb/tree-sitter-clojure",
```

Replace with:
```json
    "tree-sitter-clojure": "github:ghoseb/tree-sitter-clojure#78928e6",
```

Then run `npm install` — should be a no-op since lockfile already resolves to this commit.

**Validation:**
```bash
showboat exec docs/plans/pr2-validation.md bash "grep 'tree-sitter-clojure' package.json"
# expect: contains #78928e6
showboat exec docs/plans/pr2-validation.md bash "npm install 2>&1 | tail -1"
# expect: found 0 vulnerabilities
```

---

## Task 4: Eliminate vacuous test passes for tree-sitter mappers (codebase-wide)

**Problem:** 4 test files silently pass all assertions when tree-sitter is unavailable:

| File | Guarded tests | Always-run tests |
|------|--------------|------------------|
| `clojure.test.ts` | 15 (use `if (!result) { return; }`) | 3: non-existent, empty, comments-only |
| `rust.test.ts` | 5 (use `if (result) { ... }`) | 1: non-existent |
| `cpp.test.ts` | 4 (use `if (result) { ... }`) | 1: non-existent |
| `ctags.test.ts` | 1 (uses `if (!available) { return; }` and `if (result) { ... }`) | 4: availability check, caching, null-when-unavailable, non-existent |

A broken native module install produces a green test suite with zero actual coverage.

### Step 4a: Create shared helper

**New file: `tests/helpers/tree-sitter.ts`**

```typescript
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

function checkTreeSitter(grammarName: string): boolean {
  const isBun = typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";
  if (isBun) {
    return false;
  }
  try {
    const require = createRequire(import.meta.url);
    require("tree-sitter");
    require(grammarName);
    return true;
  } catch {
    return false;
  }
}

function checkCtags(): boolean {
  try {
    execSync("ctags --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export const hasTreeSitterRust = checkTreeSitter("tree-sitter-rust");
export const hasTreeSitterCpp = checkTreeSitter("tree-sitter-cpp");
export const hasTreeSitterClojure = checkTreeSitter("tree-sitter-clojure");
export const hasCtags = checkCtags();
```

### Step 4b: Refactor `clojure.test.ts`

**Pattern:** Wrap all 15 guarded tests inside `describe.runIf(hasTreeSitterClojure)("with tree-sitter", ...)`. Remove every `if (!result) { return; }` guard. Add `expect(result).not.toBeNull()` as a hard assertion instead. Use non-null assertion (`result!`) after the check.

The 3 always-run tests stay in the outer `describe("clojureMapper", ...)`:
- `returns null for non-existent files`
- `returns null for empty files`
- `returns null for files with only comments`

Note: `returns null for empty files`, `returns null for files with only comments`, and `extracts deftype` all write temp files and use `try/finally` for cleanup. The first two are always-run (they test that the mapper returns null gracefully). `extracts deftype` goes inside the `describe.runIf` block because it validates tree-sitter extraction.

Add import:
```typescript
import { hasTreeSitterClojure } from "../../helpers/tree-sitter.js";
```

### Step 4c: Refactor `rust.test.ts`

**Pattern:** Wrap all 5 guarded tests in `describe.runIf(hasTreeSitterRust)("with tree-sitter", ...)`. Remove `if (result) { ... }` wrapping — replace with `expect(result).not.toBeNull()` + `result!`.

The 1 always-run test stays outside:
- `returns null for non-existent files`

Note: 3 guarded tests (`extracts structs`, `extracts enums`, `extracts traits`) write temp files with `try/finally`. Keep the `try/finally` for cleanup, just remove the `if (result)` guard inside.

Add import:
```typescript
import { hasTreeSitterRust } from "../../helpers/tree-sitter.js";
```

### Step 4d: Refactor `cpp.test.ts`

**Pattern:** Wrap all 4 guarded tests in `describe.runIf(hasTreeSitterCpp)("with tree-sitter", ...)`. Same guard removal pattern as rust.

The 1 always-run test stays outside:
- `returns null for non-existent files`

Note: 2 guarded tests (`extracts classes`, `extracts namespaces`) write temp files with `try/finally`.

Add import:
```typescript
import { hasTreeSitterCpp } from "../../helpers/tree-sitter.js";
```

### Step 4e: Refactor `ctags.test.ts`

**Structure is different.** Ctags already exports `isCtagsAvailable()` (async) from `src/mappers/ctags.ts`. The test file already imports it.

Current guard pattern (line 48-64): Uses `if (!available) { return; }` and `if (result) { ... }`.

Only 1 test is guarded: `returns correct detail level when ctags works`.

Wrap it in `describe.runIf(hasCtags)("with ctags", ...)`. The other 4 tests are already unconditional and stay outside.

Add import:
```typescript
import { hasCtags } from "../../helpers/tree-sitter.js";
```

### Validation:
```bash
showboat exec docs/plans/pr2-validation.md bash "grep -cE 'if \(!result\) \{|if \(result\) \{' tests/unit/mappers/clojure.test.ts || true"
# expect: 0
showboat exec docs/plans/pr2-validation.md bash "grep -cE 'if \(!result\) \{|if \(result\) \{' tests/unit/mappers/rust.test.ts || true"
# expect: 0
showboat exec docs/plans/pr2-validation.md bash "grep -cE 'if \(!result\) \{|if \(result\) \{' tests/unit/mappers/cpp.test.ts || true"
# expect: 0
showboat exec docs/plans/pr2-validation.md bash "grep -cE 'if \(result\) \{|if \(!available\)' tests/unit/mappers/ctags.test.ts || true"
# expect: 0
showboat exec docs/plans/pr2-validation.md bash "grep -c 'describe.runIf' tests/unit/mappers/clojure.test.ts tests/unit/mappers/rust.test.ts tests/unit/mappers/cpp.test.ts tests/unit/mappers/ctags.test.ts"
# expect: 1 in each file
showboat exec docs/plans/pr2-validation.md bash "npm run test 2>&1 | tail -5"
```

---

## Task 5: Fix `platform::clj` double-colon modifier

**Problem:** `extractReaderConditionalDefs` (line 507) builds modifiers as:
```typescript
const platformMod = `platform:${currentPlatform}`;
```

Where `currentPlatform` comes from `getNodeText(child, source)` on a `kwd_lit` node. Tree-sitter-clojure returns `:clj` for keyword text (colon included). So the result is `platform::clj` — accidental double colon.

All other modifiers in the codebase are simple single words: `async`, `static`, `pub`, `export`, `private`, `macro`.

**Changes in `src/mappers/clojure.ts`:**

Find (line 507):
```typescript
        const platformMod = `platform:${currentPlatform}`;
```

Replace with:
```typescript
        const platformName = currentPlatform.replace(/^:/, "");
        const platformMod = `platform-${platformName}`;
```

Leave imports unchanged — `:clj` is idiomatic Clojure keyword form in display strings.

**Changes in `tests/unit/mappers/clojure.test.ts`:**

5 assertions to update. Find and replace each:

| Find | Replace |
|------|---------|
| `"platform::clj"` | `"platform-clj"` |
| `"platform::cljs"` | `"platform-cljs"` |

Affected test names:
- `extracts defs from reader conditionals` (2 assertions: lines 245, 251)
- `extracts private defs inside reader conditionals` (1 assertion: line 268)
- `extracts different names from different branches` (2 assertions: lines 280, 284)

**Validation:**
```bash
showboat exec docs/plans/pr2-validation.md bash "grep 'platform-' src/mappers/clojure.ts"
# expect: line with platform-${platformName}
showboat exec docs/plans/pr2-validation.md bash "grep -c 'platform::' src/mappers/clojure.ts tests/unit/mappers/clojure.test.ts || true"
# expect: 0 for both
showboat exec docs/plans/pr2-validation.md bash "npx vitest run tests/unit/mappers/clojure.test.ts --reporter=dot 2>&1 | tail -3"
```

---

## Execution Order

Tasks are independent except Task 4 touches the same test files as Tasks 5 and indirectly Task 1. Execute in this order to minimize merge friction:

1. **Task 3** (package.json pin) — isolated, quick
2. **Task 1** (dead hasChildren) — src only
3. **Task 5** (platform modifier) — src + test
4. **Task 2** (language-detect test) — isolated test file
5. **Task 4** (vacuous test refactor) — biggest, touches 4 test files + new helper; goes last so all prior test changes are in place

## Validation Strategy

Use `showboat` to build an executable validation document. Initialize it before starting:

```bash
showboat init docs/plans/pr2-validation.md "PR #2 Fixes Validation"
```

After each task, append a note and exec the validation commands:

```bash
showboat note docs/plans/pr2-validation.md "Task N: <description>"
showboat exec docs/plans/pr2-validation.md bash "<command>"
```

After all tasks, run full-suite validation:

```bash
showboat note docs/plans/pr2-validation.md "Final: full suite validation"
showboat exec docs/plans/pr2-validation.md bash "npm run validate 2>&1 | tail -5"
showboat exec docs/plans/pr2-validation.md bash "npm run test 2>&1 | tail -5"
showboat exec docs/plans/pr2-validation.md bash "npm run duplicates 2>&1"
```

### Re-verification

Anyone can confirm all fixes hold:

```bash
showboat verify docs/plans/pr2-validation.md
```

Exit 0 = all outputs match. Exit 1 = regression, with diffs.
