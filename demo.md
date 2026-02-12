# Skipped Read Recovery

*2026-02-12T16:06:08Z*

When pi-read-map generates a file map for a large file, it sends the map via `pi.sendMessage()`. During streaming, this defaults to `deliverAs: "steer"`, which pushes the message into the agent's steering queue. After each tool execution, the agent loop checks the steering queue — if non-empty, it skips all remaining tool calls with 'Skipped due to queued user message.'

This means: if the agent requests 3 parallel reads and the first file triggers a map, the other 2 reads are cancelled.

**Skipped Read Recovery** detects these cancelled reads at `turn_end` and sends a `followUp` message instructing the agent to re-issue them.

## How It Works

1. A `turn_end` event handler inspects all tool results for the turn
2. It identifies read results containing 'Skipped due to queued user message.'
3. It extracts the file paths from the assistant message's `toolCall` entries
4. It sends a `read-recovery` followUp message listing the interrupted paths
5. The followUp triggers a new turn where the agent re-reads the skipped files

## Files Changed

| File | Change |
|------|--------|
| `src/index.ts` | Added `turn_end` handler and `read-recovery` message renderer |
| `tests/integration/skipped-read-recovery.test.ts` | 9 new tests covering detection, edge cases, and rendering |

## Tests

The new test suite covers:

```bash
cd /home/will/projects/pi-read-map && npx vitest run tests/integration/skipped-read-recovery.test.ts 2>&1 | tail -20
```

```output

 RUN  v3.2.4 /home/will/projects/pi-read-map

 ✓ tests/integration/skipped-read-recovery.test.ts (9 tests) 6ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  08:06:28
   Duration  845ms (transform 139ms, setup 0ms, collect 625ms, tests 6ms, environment 0ms, prepare 61ms)

```

## Full Validation

Typecheck, lint, format, and dead-code detection all pass:

```bash
cd /home/will/projects/pi-read-map && npm run validate 2>&1
```

```output

> pi-read-map@1.0.0 validate
> npm run typecheck && npm run lint && npm run format:check && npm run dead-code


> pi-read-map@1.0.0 typecheck
> tsc --noEmit


> pi-read-map@1.0.0 lint
> oxlint -c .oxlintrc.json src tests

Found 0 warnings and 0 errors.
Finished in 214ms on 61 files with 427 rules using 16 threads.

> pi-read-map@1.0.0 format:check
> oxfmt --config .oxfmtrc.jsonc src tests --check

Checking formatting...

All matched files use the correct format.
Finished in 556ms on 73 files using 16 threads.

> pi-read-map@1.0.0 dead-code
> knip

```

## Full Test Suite

All 197 tests pass (27 test files), including the 9 new recovery tests:

```bash
cd /home/will/projects/pi-read-map && npm run test 2>&1 | grep -E "(Test Files|Tests|✓ tests/integration)" 
```

```output
 ✓ tests/integration/mapper-dispatch.test.ts (8 tests) 627ms
 ✓ tests/integration/budget-enforcement.test.ts (8 tests) 693ms
 ✓ tests/integration/directory-read.test.ts (4 tests) 14ms
 ✓ tests/integration/cache-behavior.test.ts (4 tests) 262ms
 ✓ tests/integration/skipped-read-recovery.test.ts (9 tests) 7ms
 ✓ tests/integration/separate-map-message.test.ts (6 tests) 9ms
 ✓ tests/integration/extension-load.test.ts (6 tests) 6ms
 Test Files  27 passed (27)
      Tests  197 passed (197)
```

## Implementation Detail

The recovery handler in `src/index.ts` narrows the `AgentMessage` union to `AssistantMessage` (via `role === "assistant"` check) and then matches skipped `toolCallId`s against the `toolCall` entries in the assistant content to extract file paths. The recovery message is delivered as a `followUp`, which triggers a new agent turn without entering the steering queue.

A custom `read-recovery` message renderer shows a compact summary in collapsed view (e.g., 'Recovery: 2 interrupted read(s) being re-issued') and the full path list when expanded.
