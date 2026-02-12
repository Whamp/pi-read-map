# Skipped Read Recovery

> Created: 2026-02-12

## Problem

When pi-read-map generates a file map for a large file, it sends the map via `pi.sendMessage()` in the `tool_result` event handler. During streaming, `sendMessage` defaults to `deliverAs: "steer"`, which pushes the message into the agent's steering queue. After each tool execution, `agent-loop.ts` checks the steering queue — if non-empty, it skips all remaining tool calls with "Skipped due to queued user message."

This means: if the agent requests 3 parallel reads and the first file triggers a map, the other 2 reads are cancelled and never execute.

## Root Cause Chain

1. Agent requests `read(A.rs)`, `read(B.rs)`, `read(C.rs)` in one turn
2. `agent-loop.ts` executes them sequentially in a for loop (lines 305-377)
3. `read(A.rs)` executes → file is large → map generated → stored in `pendingMaps`
4. `wrapper.ts` calls `emitToolResult()` → our `tool_result` handler fires
5. Handler calls `pi.sendMessage({customType: "file-map", ...})` with no `deliverAs`
6. `agent-session.ts:974-976`: during streaming, no `deliverAs` defaults to `this.agent.steer(appMessage)`
7. Map message enters the steering queue
8. Back in `agent-loop.ts:363-376`: after tool execution, `getSteeringMessages()` finds our map
9. Remaining tool calls (`B.rs`, `C.rs`) get `skipToolCall()` → "Skipped due to queued user message."

## Constraint

Modifying pi core is not an option. The fix must work within extension API boundaries.

## Solution: turn_end Recovery

Register a `turn_end` handler that detects skipped read calls and sends a `followUp` message instructing the agent to re-issue them.

### Detection

`TurnEndEvent` provides `toolResults: ToolResultMessage[]`. Each has:
- `toolName: string`
- `toolCallId: string`
- `content: (TextContent | ImageContent)[]`
- `isError: boolean`

Skipped reads have content `[{type: "text", text: "Skipped due to queued user message."}]`.

**Problem:** `ToolResultMessage` does NOT have an `input` field — we can't see the file path from the tool result alone.

**Solution:** Track read inputs via `tool_call` events. The `tool_call` event fires before each tool executes and includes `input: {path: string}`. Store a mapping of `toolCallId → path`. Look up paths for skipped reads at `turn_end`.

**Important:** `tool_call` events fire sequentially (one per tool, before that tool's execution). For skipped tools, `tool_call` does NOT fire — `skipToolCall` in `agent-loop.ts` bypasses the wrapper entirely. So we can only track paths for tools whose `tool_call` event fired.

**Workaround:** The assistant message (`TurnEndEvent.message`) contains the tool calls the model requested. Its `content` array includes `{type: "toolCall", name: "read", id: "...", arguments: {path: "..."}}` entries. We can extract paths for ALL requested reads (including skipped ones) from here.

### Recovery Message

Send via `pi.sendMessage({...}, {deliverAs: "followUp"})`. The followUp triggers another turn where the agent re-reads the skipped files.

### Implementation

#### Step 1: Add `turn_end` handler in `src/index.ts`

Inside `piReadMapExtension()`, after the existing `tool_result` handler:

```typescript
// Recover from skipped reads caused by map steering
pi.on("turn_end", (event) => {
  // Find skipped read results
  const skippedReads = event.toolResults.filter(
    (r) =>
      r.toolName === "read" &&
      !r.isError &&
      r.content.some(
        (c) =>
          c.type === "text" &&
          c.text === "Skipped due to queued user message.",
      ),
  );

  if (skippedReads.length === 0) return;

  // Extract paths from the assistant message's tool calls
  const assistantContent = event.message?.content;
  if (!Array.isArray(assistantContent)) return;

  const skippedPaths: string[] = [];
  for (const skipped of skippedReads) {
    const toolCall = assistantContent.find(
      (c: any) =>
        c.type === "toolCall" &&
        c.name === "read" &&
        c.id === skipped.toolCallId,
    );
    if (toolCall && typeof toolCall === "object" && "arguments" in toolCall) {
      const args = (toolCall as any).arguments;
      if (args?.path) {
        skippedPaths.push(args.path);
      }
    }
  }

  if (skippedPaths.length === 0) return;

  const pathList = skippedPaths.map((p) => `- read("${p}")`).join("\n");

  pi.sendMessage(
    {
      customType: "read-recovery",
      content:
        `The following read() calls were interrupted by a file map delivery and need to be completed:\n${pathList}\nPlease re-issue these reads now.`,
      display: true,
    },
    { deliverAs: "followUp" },
  );
});
```

#### Step 2: Register a message renderer for `read-recovery`

Add a simple renderer so the recovery message displays cleanly in the TUI:

```typescript
pi.registerMessageRenderer(
  "read-recovery",
  (message, options, theme: Theme) => {
    const content =
      typeof message.content === "string"
        ? message.content
        : message.content
            .filter((c) => c.type === "text")
            .map((c) => (c as { type: "text"; text: string }).text)
            .join("\n");

    if (options.expanded) {
      return new Text(content, 0, 0);
    }

    const pathCount = (content.match(/^- read\(/gm) || []).length;
    let summary = theme.fg("warning", "Recovery: ");
    summary += theme.fg("dim", `${pathCount} interrupted read(s) being re-issued`);

    return new Text(summary, 0, 0);
  },
);
```

#### Step 3: Add tests

Create `tests/integration/skipped-read-recovery.test.ts`:

1. **Test: detects skipped reads and sends followUp recovery message**
   - Mock pi with `on`, `sendMessage`, `registerTool`, `registerMessageRenderer`
   - Call `piReadMapExtension(mockPi)`
   - Get the `turn_end` handler
   - Simulate a `TurnEndEvent` with:
     - `message.content` containing 3 toolCall entries for read
     - `toolResults` where result 1 is normal, results 2 and 3 have "Skipped due to queued user message."
   - Assert `sendMessage` was called with `customType: "read-recovery"` and `deliverAs: "followUp"`
   - Assert the message content includes both skipped paths

2. **Test: does nothing when no reads were skipped**
   - Simulate `TurnEndEvent` with 3 normal read results
   - Assert `sendMessage` was NOT called

3. **Test: does nothing when skipped tools are not reads**
   - Simulate `TurnEndEvent` with skipped bash/write tools
   - Assert `sendMessage` was NOT called

4. **Test: handles single skipped read**
   - Simulate with 2 reads, 1 skipped
   - Assert recovery message lists only the skipped path

5. **Test: handles missing message content gracefully**
   - Simulate with no `message.content` or empty array
   - Assert no crash, no sendMessage

#### Step 4: Update existing test

The existing test `separate-map-message.test.ts` (test: "sends pending map via sendMessage when tool_result fires") should still pass — we're not changing the `tool_result` handler, only adding a `turn_end` handler alongside it.

#### Step 5: Validate

```bash
npm run test              # All tests pass
npm run test:integration  # Integration tests pass
npm run typecheck         # No type errors
npm run lint              # Clean
npm run format:check      # Formatted
```

### What This Does NOT Fix

- The steering still happens — sibling reads still get skipped on the current turn
- The recovery costs an extra agent turn (followUp triggers a new turn)
- If the skipped reads also produce maps, they may cause more steering (but subsequent turns have fewer parallel reads, so this converges)

### Future: Pi Core Fix

The proper fix is adding a `deliverAs: "aside"` mode to pi's `sendMessage` that appends to the conversation during streaming without entering the steering queue. This plan is a workaround until that exists.

## Files Changed

| File | Change |
|------|--------|
| `src/index.ts` | Add `turn_end` handler, add `read-recovery` renderer |
| `tests/integration/skipped-read-recovery.test.ts` | New test file |

## Verification

- `npm run validate` passes
- Manually test with 3+ parallel reads of large files to confirm recovery fires
