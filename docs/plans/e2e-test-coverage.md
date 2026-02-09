# E2E Test Coverage Plan

## Current State

All E2E tests now pass reliably with proper model distribution.

## Model Distribution Strategy

Tests are distributed across ZAI models to respect concurrency limits:

| Model | Concurrency | Test Files | Test Count |
|-------|-------------|------------|------------|
| `glm-4.7` | 3 | `read-large-file.test.ts`, `read-large-go.test.ts` | 11 |
| `glm-4.6` | 3 | `read-large-typescript.test.ts`, `read-large-sql.test.ts` | 10 |
| `glm-4.5` | 10 | `read-small-file.test.ts`, `read-small-nonpython.test.ts`, `read-with-offset.test.ts` | 15 |

**Total concurrent capacity: 16 tests**

## Test File Summary

| Test File | Parser Type | Fixture | Model | Status |
|-----------|-------------|---------|-------|--------|
| `read-large-file.test.ts` | External script | `large/processor.py` | glm-4.7 | ✅ |
| `read-large-go.test.ts` | External binary | `large/server.go` | glm-4.7 | ✅ |
| `read-large-typescript.test.ts` | Native AST (ts-morph) | `large/handler.ts` | glm-4.6 | ✅ |
| `read-large-sql.test.ts` | Regex parser | `large/schema.sql` | glm-4.6 | ✅ |
| `read-small-file.test.ts` | Passthrough | `small/hello.py` | glm-4.5 | ✅ |
| `read-small-nonpython.test.ts` | Cross-language passthrough | `small/hello.ts`, `small/hello.go` | glm-4.5 | ✅ |
| `read-with-offset.test.ts` | Offset/limit passthrough | Various | glm-4.5 | ✅ |

## Implementation Details

### Model Configuration

Models are configured in `tests/helpers/models.ts`:

```typescript
export const MODELS = {
  SMART: "glm-4.7",   // For complex large file tests
  MEDIUM: "glm-4.6",  // For large file tests  
  FAST: "glm-4.5",    // For simple small file tests
} as const;

export const PROVIDER = "zai";
```

### Pi Runner Updates

`tests/helpers/pi-runner.ts` now accepts `provider` and `model` options:

```typescript
export function runPiSession(options: PiSessionOptions): Promise<PiSessionResult> {
  const {
    provider = "zai",
    model = "glm-4.5",
    // ...
  } = options;
  
  const args = [
    "--provider", provider,
    "--model", model,
    // ...
  ];
}
```

### Test File Pattern

Each test file sets its model configuration:

```typescript
import { MODELS, PROVIDER } from "../helpers/models.js";

const MODEL_CONFIG = { provider: PROVIDER, model: MODELS.SMART };

// Then in each test:
const result = await runPiSession({
  ...MODEL_CONFIG,
  prompt: `...`,
  timeout: 90_000,
});
```

## What NOT to Test in E2E

Already covered by unit tests:
- Symbol extraction accuracy
- Specific signature formats
- Language detection logic
- Formatter output formatting
- Child symbol nesting

## Future Considerations

### Optional Tests (Low Priority)
- `read-large-rust.test.ts` - Tree-sitter integration (Bun compatibility risk)
- `read-mapper-failure.test.ts` - Graceful degradation on mapper errors
