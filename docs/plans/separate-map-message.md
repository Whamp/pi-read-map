# Plan: Separate Map as Custom Message

## Problem

The current implementation appends the file map directly to the read tool's content output. This causes:

1. **Truncation confusion**: The combined output (truncated content + map) inherits the original truncation metadata, causing the TUI to display redundant/confusing notices
2. **No independent collapse/expand**: The map and content are one blob - can't expand just the map
3. **Limit conflicts**: Tool results have 50KB limit, but our maps can be up to 100KB with progressive compression

## Solution

Send the file map as a separate custom message after the read tool completes. This gives:

1. **Independent TUI behavior**: Map has its own collapse/expand (Ctrl+O)
2. **No truncation limits**: Custom messages bypass the 50KB tool result limit
3. **Transparency**: Human can see exactly what's being fed to the LLM
4. **Clean separation**: File content and structural map are distinct entries

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ LLM calls read tool                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Read tool executes                                          │
│ - Delegates to built-in read (truncated at 50KB/2000 lines) │
│ - Generates map if file exceeds threshold                   │
│ - Stores map in pendingMaps keyed by toolCallId             │
│ - Returns truncated content only                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ tool_result event fires                                     │
│ - Check if toolName === "read" and pendingMaps has entry    │
│ - Call pi.sendMessage() with map as custom message          │
│ - Clean up pendingMaps entry                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Custom message renderer                                     │
│ - Collapsed: "[File Map: N symbols, M lines - Ctrl+O]"      │
│ - Expanded: Full formatted map                              │
└─────────────────────────────────────────────────────────────┘
```

## LLM Context Flow

After this change, the LLM sees:

1. **Tool result** (role: tool): Truncated file content with notice like `[Showing lines 1-10 of 200...]`
2. **User message** (role: user): Full structural file map

The map appearing as a "user" message is semantically fine - it's supplementary info the user (via extension) is providing.

## Implementation Tasks

### Task 1: Refactor Extension Structure

**File**: `src/index.ts`

1. Add `pendingMaps: Map<string, { path: string, map: string }>` to track maps by toolCallId
2. Modify read tool execute:
   - Remove map appending logic
   - Store generated map in `pendingMaps` instead
   - Return built-in result unmodified (or with `details: undefined` if truncated)
3. Register `tool_result` event handler:
   - Check for pending map by toolCallId
   - Call `pi.sendMessage()` with custom type `"file-map"`
   - Delete from pendingMaps
4. Register custom message renderer for `"file-map"` type

### Task 2: Custom Message Renderer

**File**: `src/index.ts` (or new `src/renderer.ts`)

Create a renderer that:
- Receives `(message, options, theme)` where `options.expanded` indicates Ctrl+O state
- **Collapsed view**: 
  - Show summary: file name, line count, symbol count
  - Hint: "Ctrl+O to expand"
  - Use theme colors appropriately
- **Expanded view**:
  - Show full formatted map
  - Use monospace/code styling

The renderer returns a TUI `Component`. We'll need to import from `@mariozechner/pi-tui`.

### Task 3: Update Map Format for Message Details

**File**: `src/formatter.ts` and `src/types.ts`

Store metadata in the custom message's `details` field:
```typescript
interface FileMapMessageDetails {
  filePath: string;
  totalLines: number;
  totalBytes: number;
  symbolCount: number;
  language: string;
}
```

This allows the renderer to show a useful collapsed summary without parsing the map text.

### Task 4: Fix JSONL Mapper Line Count (DONE)

**File**: `src/mappers/jsonl.ts`

Already fixed - removed early exit so `totalLines` reflects actual file line count.

### Task 5: Update Tests

**Files**: `tests/integration/`, `tests/e2e/`

1. Update extension integration tests to verify:
   - Read tool returns content without map
   - Custom message is sent after tool_result
   - pendingMaps is cleaned up properly
2. Add tests for custom message renderer (collapsed/expanded states)
3. Verify map generation still works correctly

### Task 6: Manual E2E Testing

Test in a real pi session:
1. Read a large JSONL session file
2. Verify truncated content appears as tool result
3. Verify map appears as separate custom message below
4. Verify Ctrl+O expands/collapses the map independently
5. Verify LLM can use the map to navigate (ask it to explain something from middle of file)

## API Surface

### Dependencies Needed

```typescript
import { 
  ExtensionAPI, 
  createReadTool,
  DEFAULT_MAX_LINES,
  DEFAULT_MAX_BYTES,
  isReadToolResult  // Type guard for tool_result event
} from "@mariozechner/pi-coding-agent";
import { Container, Text, Box, Markdown } from "@mariozechner/pi-tui";
import type { Theme } from "@mariozechner/pi-coding-agent";
```

### sendMessage Usage

```typescript
pi.sendMessage({
  customType: "file-map",
  content: mapText,
  display: true,
  details: {
    filePath: absPath,
    totalLines,
    totalBytes: stats.size,
    symbolCount: fileMap.symbols.length,
    language: fileMap.language,
  }
});
```

### registerMessageRenderer Usage

```typescript
pi.registerMessageRenderer<FileMapMessageDetails>("file-map", (message, options, theme) => {
  if (options.expanded) {
    // Return component showing full map
  } else {
    // Return component showing collapsed summary
  }
});
```

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Timing: map sent before tool result displayed | `tool_result` event fires after tool completes, should be fine |
| Memory: pendingMaps grows unbounded | Clean up in tool_result handler; maps are transient |
| Large maps impact token budget | Already handled by progressive compression (100KB cap) |
| Custom message styling looks wrong | Use theme colors, test visually |

## Success Criteria

1. ✅ Read tool output shows truncated content only
2. ✅ File map appears as separate, collapsible message
3. ✅ Ctrl+O independently expands/collapses the map
4. ✅ Human can see transparency of what LLM receives
5. ✅ LLM can use map to navigate large files effectively
6. ✅ No duplicate truncation notices
7. ✅ Works for all supported file types (JSONL, TS, Python, etc.)

## Future Considerations

- Could add a `/map` command to regenerate map for current file
- Could persist map in session for quick re-access
- Could add map diffing for files that change during session
