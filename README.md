# pi-read-map

A pi extension that adds structural file maps for large files. When reading files that exceed the truncation threshold (2,000 lines or 50 KB), this extension generates a structural map of the entire file alongside the initial content, enabling precise, targeted reads instead of sequential scanning.

## Features

- **Structural File Maps**: Automatically generates maps showing symbols, classes, functions, and their line ranges
- **Language Support**: TypeScript, JavaScript, Python, Go, Rust, C, C++, SQL, JSON, YAML, TOML, CSV, Markdown
- **Smart Truncation**: Maps compress to ~3-5% of original file size (e.g., 400 KB file → ~18 KB map)
- **Budget Enforcement**: Progressive detail reduction ensures maps stay under 20 KB
- **Caching**: In-memory caching by file path + mtime for fast re-reads
- **Graceful Fallback**: Grep-based heuristics for unsupported file types

## Installation

### Option 1: Global Installation (Recommended)

Install the extension for use across all projects:

```bash
# Clone the repository
git clone <repository-url> ~/.pi/agent/extensions/pi-read-map

# Install dependencies
cd ~/.pi/agent/extensions/pi-read-map
npm install
```

The extension will be auto-discovered by pi on next start or via `/reload`.

### Option 2: Project-Local Installation

Install the extension for a specific project only:

```bash
# From your project root
mkdir -p .pi/extensions
git clone <repository-url> .pi/extensions/pi-read-map

# Install dependencies
cd .pi/extensions/pi-read-map
npm install
```

### Option 3: Quick Test (One-off)

Test the extension without installing:

```bash
pi -e ./path/to/pi-read-map/src/index.ts
```

## Verification

After installation, verify the extension is loaded:

1. Start pi or run `/reload` in an existing session
2. The extension registers an enhanced `read` tool
3. Read a large file (over 2,000 lines or 50 KB) to see the map in action

Example:
```
read path/to/large-file.ts
```

Output will include:
```
[Content of first 2,000 lines...]

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

### Scripts

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Run all validation
npm run validate

# Tests
npm run test
npm run test:watch
npm run test:integration
npm run test:e2e

# Benchmarks
npm run bench
```

### Project Structure

```
src/
├── index.ts              # Extension entry point
├── types.ts              # Shared TypeScript types
├── enums.ts              # Symbol kinds and detail levels
├── mapper.ts             # Dispatcher: detect language → mapper
├── formatter.ts          # Map formatting with budget enforcement
├── language-detect.ts    # Language detection from file extensions
└── mappers/              # Language-specific mappers
    ├── typescript.ts     # TypeScript/JavaScript (ts-morph)
    ├── python.ts         # Python (ast module subprocess)
    ├── go.ts             # Go (go/ast subprocess)
    ├── rust.ts           # Rust (tree-sitter)
    ├── cpp.ts            # C/C++ (tree-sitter)
    ├── c.ts              # C (regex patterns)
    ├── sql.ts            # SQL (regex)
    ├── json.ts           # JSON (jq subprocess)
    ├── yaml.ts           # YAML (regex)
    ├── toml.ts           # TOML (regex)
    ├── csv.ts            # CSV/TSV (in-process)
    ├── markdown.ts       # Markdown (regex)
    ├── codemap.ts        # Codemap CLI fallback
    ├── ctags.ts          # universal-ctags fallback
    └── fallback.ts       # Grep-based fallback
```

## How It Works

When the `read` tool is called:

1. **Small files** (≤2,000 lines AND ≤50 KB): Pass through to built-in read tool
2. **Targeted reads** (offset or limit provided): Pass through to built-in read tool
3. **Large files**: 
   - Read first chunk via built-in tool
   - Detect language from file extension
   - Generate structural map using appropriate mapper
   - Format map with budget enforcement
   - Append map to response with navigation guidance

## Dependencies

**Required npm packages:**
- `ts-morph` - TypeScript AST analysis
- `tree-sitter` - Parser framework
- `tree-sitter-cpp` - C/C++ parsing
- `tree-sitter-rust` - Rust parsing

**System tools (optional, for specific mappers):**
- `python3` - Python mapper
- `go` - Go mapper
- `jq` - JSON mapper
- `universal-ctags` - Broad language fallback

## Configuration

The extension uses sensible defaults and requires no configuration. Future versions may support per-language enable/disable settings.

## License

ISC