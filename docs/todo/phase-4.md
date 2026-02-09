# Phase 4 TODO Items

**Created:** 2026-02-08  
**Source:** Phase 4 Review (`docs/reviews/phase-4.md`)  
**Priority:** Optional improvements - Phase 4 validation gates are met

---

## 1. YAML Mapper: Quoted Key Support

**File:** `src/mappers/yaml.ts`  
**Severity:** Low  
**Effort:** ~15 minutes

### Problem

The current regex pattern only matches unquoted keys starting with letters or underscores:

```typescript
const keyMatch = line.match(/^(\s*)([a-zA-Z_][\w.-]*)\s*:/);
```

This fails to extract keys like:
- `"key:with:colons": value`
- `"key with spaces": value`
- `'single-quoted-key': value`

### Solution

Extend the regex to handle quoted keys:

```typescript
// Match unquoted keys OR quoted keys (single or double quotes)
const keyMatch = line.match(/^(\s*)(["']([^"']+)["']|[a-zA-Z_][\w.-]*)\s*:/);
if (keyMatch && keyMatch[1] !== undefined) {
  const keyName = keyMatch[3] || keyMatch[2]; // Use captured group from quotes, or unquoted match
  keys.push({
    name: keyName,
    indent: keyMatch[1].length,
    line: lineNum,
    isArrayItem: false,
  });
}
```

### Test Case

```typescript
it("extracts quoted keys with special characters", async () => {
  // Create fixture with quoted keys
  const content = `
"key:with:colons": value1
'key with spaces': value2
normal_key: value3
`;
  // Write to temp file, run mapper, verify all 3 keys extracted
});
```

---

## 2. YAML Mapper: Numeric Key Support

**File:** `src/mappers/yaml.ts`  
**Severity:** Low  
**Effort:** ~10 minutes

### Problem

Numeric keys like `1:`, `2:`, `3:` are valid YAML but not captured because the regex requires keys to start with `[a-zA-Z_]`.

### Solution

Extend the key pattern to allow numeric keys:

```typescript
// Match numeric keys, unquoted keys, or quoted keys
const keyMatch = line.match(/^(\s*)(["']([^"']+)["']|\d+|[a-zA-Z_][\w.-]*)\s*:/);
```

### Test Case

```typescript
it("extracts numeric keys", async () => {
  const content = `
1: first
2: second
name: valid
`;
  const result = await yamlMapper(tempFile);
  expect(result?.symbols.map(s => s.name)).toContain("1");
  expect(result?.symbols.map(s => s.name)).toContain("2");
});
```

---

## 3. YAML Mapper: Document Nesting Limit Documentation

**File:** `src/mappers/yaml.ts`  
**Severity:** Very Low  
**Effort:** ~5 minutes

### Problem

The YAML mapper intentionally limits child extraction to indent ≤4 (2 levels deep). This is by design for map budget control but not documented.

### Solution

Add a comment explaining the design decision:

```typescript
/**
 * Convert flat keys to hierarchical symbols.
 * Groups keys by their indentation level.
 * 
 * NOTE: Only extracts children with indent ≤4 (top-level + 2 levels deep).
 * This is intentional to keep map output within budget for large YAML files.
 * Deeper nesting is omitted but the parent keys still show correct line ranges.
 */
function convertKeysToSymbols(
  keys: YamlKey[],
  totalLines: number
): FileSymbol[] {
```

---

## 4. Missing Edge Case Tests

**Files:** `tests/unit/mappers/*.test.ts`  
**Severity:** Low  
**Effort:** ~30 minutes

### Problem

The following edge cases work correctly but lack test coverage:

### YAML Edge Case Tests

```typescript
// tests/unit/mappers/yaml.test.ts

it("returns null for empty files", async () => {
  // Write empty file to temp, verify returns null
  writeFileSync("/tmp/empty.yaml", "");
  const result = await yamlMapper("/tmp/empty.yaml");
  expect(result).toBeNull();
});

it("returns null for comment-only files", async () => {
  writeFileSync("/tmp/comments.yaml", "# Just comments\n# Nothing else\n");
  const result = await yamlMapper("/tmp/comments.yaml");
  expect(result).toBeNull();
});

it("handles multi-document YAML", async () => {
  writeFileSync("/tmp/multi.yaml", "---\nname: doc1\n---\nname: doc2\n");
  const result = await yamlMapper("/tmp/multi.yaml");
  expect(result?.symbols.length).toBe(2); // Both 'name' keys extracted
});

it("handles YAML anchors and aliases", async () => {
  writeFileSync("/tmp/anchors.yaml", `
defaults: &defaults
  timeout: 5000
production:
  <<: *defaults
`);
  const result = await yamlMapper("/tmp/anchors.yaml");
  expect(result?.symbols.map(s => s.name)).toContain("defaults");
  expect(result?.symbols.map(s => s.name)).toContain("production");
});
```

### TOML Edge Case Tests

```typescript
// tests/unit/mappers/toml.test.ts

it("returns null for empty files", async () => {
  writeFileSync("/tmp/empty.toml", "");
  const result = await tomlMapper("/tmp/empty.toml");
  expect(result).toBeNull();
});

it("handles dotted keys", async () => {
  writeFileSync("/tmp/dotted.toml", `
[server]
host.name = "example.com"
host.port = 8080
`);
  const result = await tomlMapper("/tmp/dotted.toml");
  const serverSection = result?.symbols.find(s => s.name === "[server]");
  expect(serverSection?.children?.some(c => c.name === "host.name")).toBe(true);
});

it("extracts inline table key names", async () => {
  writeFileSync("/tmp/inline.toml", `
name = "test"
point = { x = 1, y = 2 }
`);
  const result = await tomlMapper("/tmp/inline.toml");
  expect(result?.symbols.map(s => s.name)).toContain("point");
});
```

### CSV Edge Case Tests

```typescript
// tests/unit/mappers/csv.test.ts

it("handles header-only files (no data rows)", async () => {
  writeFileSync("/tmp/headeronly.csv", "id,name,email\n");
  const result = await csvMapper("/tmp/headeronly.csv");
  expect(result).not.toBeNull();
  const summary = result?.symbols.find(s => s.kind === SymbolKind.Table);
  expect(summary?.name).toContain("0 rows");
});

it("handles quoted fields with embedded delimiters", async () => {
  writeFileSync("/tmp/quoted.csv", 
    'id,name,description\n1,"Smith, John","Has comma, inside"\n'
  );
  const result = await csvMapper("/tmp/quoted.csv");
  expect(result?.language).toBe("CSV");
  expect(result?.symbols.find(s => s.kind === SymbolKind.Table)?.name).toContain("1 rows");
});

it("handles empty field values", async () => {
  writeFileSync("/tmp/empty-vals.csv", "id,name,email\n1,,alice@test.com\n");
  const result = await csvMapper("/tmp/empty-vals.csv");
  expect(result).not.toBeNull();
});
```

---

## 5. ctags Shell Injection Safety

**File:** `src/mappers/ctags.ts`  
**Severity:** Low  
**Effort:** ~20 minutes

### Problem

The ctags commands use shell interpolation which could be unsafe with special characters in file paths:

```typescript
const cmd = `ctags --output-format=json -f - "${filePath}" 2>/dev/null`;
```

### Solution

Use `execFile` with array arguments instead of shell interpolation:

```typescript
import { execFile } from "node:child_process";

const { stdout } = await execFileAsync("ctags", [
  "--output-format=json",
  "-f", "-",
  filePath
], {
  signal,
  timeout: 10_000,
  maxBuffer: 1024 * 1024,
});
```

Note: This requires handling stderr separately since `2>/dev/null` won't work.

---

## 6. Create Standard Documentation Files (Optional)

**Effort:** ~20 minutes

The project references these files which don't exist:
- `docs/plans/PLAN.md`
- `docs/specs/SPECS.md`
- `docs/tasks/TASKS.md`
- `.codemap/README.md`

### Options

1. **Remove references**: If the project doesn't need these, remove any references to them.

2. **Create stub files**: Create minimal versions pointing to `docs/plans/IMPLEMENTATION-PLAN.md` as the source of truth.

3. **Full documentation**: Extract sections from IMPLEMENTATION-PLAN.md into separate files for better organization.

---

## Summary

| Item | Priority | Effort | Status |
|------|----------|--------|--------|
| YAML quoted key support | Low | 15 min | TODO |
| YAML numeric key support | Low | 10 min | TODO |
| YAML nesting limit docs | Very Low | 5 min | TODO |
| Edge case tests | Low | 30 min | TODO |
| ctags shell safety | Low | 20 min | TODO |
| Standard doc files | Optional | 20 min | TODO |

**Total effort if all items addressed:** ~100 minutes

**Note:** None of these items are blockers. Phase 4 validation gates are fully met.
