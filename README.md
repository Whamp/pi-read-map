# pi-read-map

This pi extension augments the built-in `read` tool with structural file maps. When you open a file larger than 2,000 lines or 50 KB, the extension generates a map of every symbol and its line range. You navigate large codebases precisely instead of scanning sequentially.

## Why This Exists

**The problem:** pi sees only the first 2,000 lines of a 50,000-line source file. Ask "how does the type checker handle unions?" and the model either hallucinates or burns tokens re-reading until it finds the answer.

**The trade-off:** `pi-read-map` spends ~2,000–10,000 tokens upfront to generate a map of the entire file. The extension triggers only for files exceeding the truncation limit (>2,000 lines and >50 KB); smaller files pass through unchanged.

**The payoff:** The map stays in context. Ask "show me the merge implementation," "compare error handling in these three functions," or "what symbols exist after line 40,000?" without re-reading. The investment pays for itself when you analyze a large file beyond a single summary.

## Demo

See `pi-read-map` in action analyzing the TypeScript compiler's 54,000-line type checker:


https://github.com/user-attachments/assets/4408f37b-b669-453f-a588-336a5332ae90


## What It Does

- **Generates structural maps** showing symbols, classes, functions, and their exact line ranges
- **Supports 16 languages** through specialized parsers: TypeScript, JavaScript, Python, Go, Rust, C, C++, SQL, JSON, JSONL, YAML, TOML, CSV, Markdown
- **Compresses aggressively** to ~3-5% of original file size (a 400 KB file yields an ~18 KB map)
- **Enforces a 20 KB budget** through progressive detail reduction
- **Caches maps** in memory by file path and modification time for instant re-reads
- **Falls back** from language-specific parsers to ctags to grep heuristics

## Installation

### Global (Recommended)

```bash
git clone <repository-url> ~/.pi/agent/extensions/pi-read-map
cd ~/.pi/agent/extensions/pi-read-map
npm install
```

pi discovers the extension automatically on start or via `/reload`.

### Project-Local

```bash
mkdir -p .pi/extensions
git clone <repository-url> .pi/extensions/pi-read-map
cd .pi/extensions/pi-read-map
npm install
```

### One-off Test

```bash
pi -e ./path/to/pi-read-map/src/index.ts
```

## Verification

Start pi or run `/reload`. Then read a large file:

```
read path/to/large-file.ts
```

Output includes the truncated content followed by:

```
[Truncated: showing first 2000 lines of 10,247 (50 KB of 412 KB)]
───────────────────────────────────────
File Map: path/to/large-file.ts
10,247 lines │ 412 KB │ TypeScript
───────────────────────────────────────

class ProcessorConfig: [18-32]
class BatchProcessor: [34-890]
  constructor(config: ProcessorConfig): [40-65]
  async run(items: List<Item>): [67-180]
  ...

───────────────────────────────────────
Use read(path, offset=LINE, limit=N) for targeted reads.
───────────────────────────────────────
```

## Development

```bash
npm run typecheck      # Type checking
npm run lint           # Linting with oxlint
npm run lint:fix       # Auto-fix lint issues
npm run format         # Format with oxfmt
npm run format:check   # Check formatting
npm run validate       # Run all checks
npm run test           # Unit tests
npm run test:watch     # Watch mode
npm run test:integration  # Integration tests
npm run test:e2e       # End-to-end tests
npm run bench          # Benchmarks
```

## Project Structure

```
src/
├── index.ts              # Extension entry: tool registration, caching, messages
├── mapper.ts             # Dispatcher: routes files to language mappers
├── formatter.ts          # Budget-aware formatting with detail reduction
├── language-detect.ts    # Maps file extensions to languages
├── types.ts              # Shared interfaces (FileMap, FileSymbol)
├── enums.ts              # SymbolKind, DetailLevel
├── constants.ts          # Thresholds (2,000 lines, 50 KB, 20 KB budget)
└── mappers/              # Language-specific parsers
    ├── typescript.ts     # ts-morph for TS/JS
    ├── python.ts         # Python AST via subprocess
    ├── go.ts             # Go AST via subprocess
    ├── rust.ts           # tree-sitter
    ├── cpp.ts            # tree-sitter for C/C++
    ├── c.ts              # Regex patterns
    ├── sql.ts            # Regex
    ├── json.ts           # jq subprocess
    ├── jsonl.ts          # Streaming parser
    ├── yaml.ts           # Regex
    ├── toml.ts           # Regex
    ├── csv.ts            # In-process parser
    ├── markdown.ts       # Regex
    ├── ctags.ts          # universal-ctags fallback
    └── fallback.ts       # Grep-based final fallback

scripts/
├── python_outline.py     # Python AST extraction
└── go_outline.go         # Go AST extraction (compiles on first use)

tests/
├── unit/                 # Mapper and utility tests
├── integration/          # Dispatcher, caching, budget enforcement
├── e2e/                  # Real pi sessions via tmux
└── fixtures/             # Sample files per language
```

## How It Works

The extension intercepts `read` calls and decides:

1. **Small files** (≤2,000 lines, ≤50 KB): Delegate to built-in read tool
2. **Targeted reads** (offset or limit provided): Delegate to built-in read tool
3. **Large files:**
   - Call built-in read for the first chunk
   - Detect language from file extension
   - Dispatch to a mapper (language-specific → ctags → grep fallback)
   - Format with budget enforcement
   - Cache the map
   - Send as a separate `file-map` message after `tool_result`

## Dependencies

**npm packages:**
- `ts-morph` - TypeScript AST analysis
- `tree-sitter` - Parser framework
- `tree-sitter-cpp` - C/C++ parsing
- `tree-sitter-rust` - Rust parsing

**System tools (optional):**
- `python3` - Python mapper
- `go` - Go mapper
- `jq` - JSON mapper
- `universal-ctags` - Language fallback

## Acknowledgments

This project was inspired by and built upon the foundation of [codemap](https://github.com/kcosr/codemap) by [kcosr](https://github.com/kcosr). Check out the original project for the ideas that made this possible.

## License

MIT
