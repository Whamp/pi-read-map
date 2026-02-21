# Plan: Inline File Maps in Tool Results

## Analysis

The extension has cycled through three delivery strategies for file maps, none fully satisfactory. The default `steer` mode delivers maps immediately but skips parallel reads, requiring a `read-recovery` mechanism that adds extra LLM turns and token cost. The `followUp` mode avoids skipping but produces consecutive user-role messages that cause 400 API errors on Claude and Gemini. A previous attempt to inline maps directly in the tool result (`dddb193`) was reverted (`f1b5cd0`) under the belief that it caused API errors, but the revert commit itself documents that those errors were caused by images in tool results — a pi-core bug unrelated to the extension. Inlining the map as an additional text content block in the read tool's return value avoids `sendMessage` entirely: no steering, no skipped reads, no consecutive user turns, no recovery mechanism. Every parallel read completes normally and every large file gets its map in the same tool result the LLM already processes. The tradeoff is the loss of the dedicated collapsible TUI widget for file maps, but the map text still appears in the read output and remains visible to both the user and the LLM.

## Steps

### 1. Remove `sendMessage`-based map delivery

In `src/index.ts`:

- Remove the `pendingMaps` map, `getPendingMaps()`, and `resetPendingMaps()` exports.
- Remove the `file-map` `sendMessage` call and the `pendingMaps` lookup from the `tool_result` handler (keep the directory-listing logic).
- Remove the `file-map` custom message renderer (`registerMessageRenderer`).
- Remove the `read-recovery` `turn_end` handler and its `read-recovery` message renderer.
- Remove the `pi-tui` import (`Text`, `Theme`) if no longer needed.

### 2. Inline the map in the tool result

In the `execute` function, after generating or retrieving the cached map text, append it to the tool result content array instead of storing it in `pendingMaps`:

```ts
return {
  ...result,
  content: [...result.content, { type: "text" as const, text: mapText }],
};
```

Remove the `details: undefined` override on the result — the built-in truncation details can pass through since the map supplements rather than replaces them.

### 3. Simplify the cache hit path

The current cache hit path regenerates the full `FileMap` just to extract metadata (`language`, `symbolCount`) for the `file-map` message details. Since we no longer send a separate message with metadata, the cache hit path only needs the formatted text:

```ts
if (cached && cached.mtime === stats.mtimeMs) {
  mapText = cached.map;
} else {
  const fileMap = await generateMap(absPath, { signal });
  if (!fileMap) return result;
  mapText = formatFileMapWithBudget(fileMap);
  mapCache.set(absPath, { mtime: stats.mtimeMs, map: mapText });
}
```

### 4. Ensure binary and media files always delegate to the built-in read tool

The built-in read tool detects images via magic-byte sniffing (`file-type` library) and supports jpeg, png, gif, and webp. Our extension must never attempt map generation on these or any other non-text file. The existing `BINARY_EXTENSIONS` guard covers this, but verify it includes all image formats the built-in read tool supports (jpg, jpeg, png, gif, webp) and common video formats. No changes expected here — just verification.

### 5. Update tests

- Delete `tests/integration/separate-map-message.test.ts` (tests the old `sendMessage` flow).
- Delete `tests/integration/skipped-read-recovery.test.ts` (tests the old recovery mechanism).
- Update `tests/integration/extension-load.test.ts` to remove references to `resetPendingMaps` / `getPendingMaps`.
- Add a new integration test verifying that the map text appears in the tool result content for large files.
- Update `tests/e2e/read-large-file.test.ts` if it asserts on separate `file-map` messages.

### 6. Clean up untracked files

- Delete `debug-map.ts` (throwaway debug script).
- Delete `docs/plans/revert-to-steer.md` (superseded by this plan).

### 7. Validate

- `npm run validate` (typecheck + lint + format + dead-code)
- `npm run test` (unit + integration)
- `npm run test:e2e` with parallel reads to confirm no API errors and maps appear in results
