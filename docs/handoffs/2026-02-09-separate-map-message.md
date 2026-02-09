# Handoff: Implement Separate Map as Custom Message

## Project

`pi-read-map` - A pi extension that overrides the default `read` tool to add structural file maps when reading large files (>50KB or >2000 lines).

**Location**: `/home/will/projects/pi-read-map`

## Context

The extension currently appends the file map directly to the read tool's content output. This causes:

1. TUI shows confusing duplicate truncation notices (from built-in metadata + our appended text)
2. Map and content are one blob - no independent collapse/expand
3. Tool results have 50KB limit, but our maps can be up to 100KB

## Solution

Send the file map as a **separate custom message** after the read tool completes. This uses pi's extension APIs:

- `pi.on("tool_result", ...)` - detect when read completes, send map via `pi.sendMessage()`
- `pi.registerMessageRenderer("file-map", ...)` - custom collapsed/expanded rendering

The map appears as an independent message with its own Ctrl+O expand behavior.

## Plan Document

**Read this first**: `docs/plans/separate-map-message.md`

Contains:
- Architecture diagram
- 6 implementation tasks with details
- API usage examples
- Risks and mitigations
- Success criteria

## Already Done

- **JSONL mapper fix** (`src/mappers/jsonl.ts`): Removed early exit so `totalLines` reflects actual file line count instead of stopping at 100

## Key Tasks to Implement

1. **Refactor `src/index.ts`**: 
   - Add `pendingMaps` Map to track maps by toolCallId
   - Remove map-appending logic from read tool
   - Store map in pendingMaps, return built-in result unmodified
   - Add `tool_result` event handler to send map via `pi.sendMessage()`

2. **Custom message renderer**:
   - Collapsed: Show summary (file name, lines, symbols) + "Ctrl+O to expand"
   - Expanded: Show full formatted map
   - Import TUI components from `@mariozechner/pi-tui`

3. **Add `FileMapMessageDetails` type** for the message's `details` field

4. **Update tests** for new behavior

5. **Manual E2E test**: Read a large session file, verify separate collapse/expand works

## Test File for Verification

```bash
# 200 lines, 461KB - good test case
/home/will/.pi/agent/sessions/--home-will-projects-pi-read-map--/2026-02-09T00-52-00-623Z_0b348564-ddac-4ed3-994c-4523bb1f5b11.jsonl
```

## Commands

```bash
cd /home/will/projects/pi-read-map
npm run typecheck   # Type checking
npm test            # Run tests
npm run validate    # Full validation (typecheck + lint + format)
```

## Starting Point

Begin by reading the current `src/index.ts` to understand the existing structure, then follow Task 1 in the plan.
