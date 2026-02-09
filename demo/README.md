# pi-read-map Demo: Judgement Results

This document contains the results of side-by-side comparisons between sessions with `pi-read-map` installed and sessions without it, when analyzing massive source files.

## Demo Assets

The `assets/` directory contains large, complex files from famous open-source projects for testing and demonstration:

| File | Source | Size | Lines | Description |
|------|--------|------|-------|-------------|
| `typescript/checker.ts` | [Microsoft TypeScript](https://github.com/microsoft/TypeScript) | 3.1 MB | 54,419 | The type-checker — one of the largest single files in open source |
| `python/frame.py` | [pandas](https://github.com/pandas-dev/pandas) | 631 KB | 18,771 | The DataFrame class implementation — pandas' core data structure |
| `go/types.go` | [Kubernetes](https://github.com/kubernetes/kubernetes) | 303 KB | 7,191 | Core API types — Pod, Service, Container, and all K8s primitives |
| `rust/expr.rs` | [Rust Compiler](https://github.com/rust-lang/rust) | 183 KB | 4,367 | The expression parser — handles all Rust expression syntax |
| `cpp/SemaExpr.cpp` | [LLVM/Clang](https://github.com/llvm/llvm-project) | 857 KB | 21,758 | Semantic analysis for C/C++ expressions — type checking, overloads, conversions |
| `c/core.c` | [Linux Kernel](https://github.com/torvalds/linux) | 284 KB | 10,902 | The process scheduler core — heart of Linux task management |
| `markdown/CHANGELOG-1.29.md` | [Kubernetes](https://github.com/kubernetes/kubernetes) | 430 KB | 3,726 | Release changelog — deeply nested headings, lists, and links |
| `yaml/github-api.yaml` | [GitHub REST API](https://github.com/github/rest-api-description) | 8.6 MB | 239,368 | OpenAPI spec — every GitHub API endpoint, schema, and parameter |
| `sql/structure.sql` | [GitLab](https://github.com/gitlabhq/gitlabhq) | 2.7 MB | 58,599 | Database schema — hundreds of tables, indexes, and constraints |
| `json/cloudformation-spec.json` | [AWS CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/) | 13 MB | 254,827 | Resource specification — every AWS resource type and property |

These files demonstrate the extension's ability to provide structural understanding of massive codebases without exhausting context windows.

`pi-read-map` is a drop-in extension that enhances the built-in `read` tool. It automatically generates structural maps for large files (>2,000 lines or >50 KB) and falls back gracefully to the standard read tool on any failure. No configuration or explicit invocation is required.

---

## Case Study 1: TypeScript (`checker.ts`)

**Judgement Session URL:** [https://pi.dev/session/#b3e85ab50754a98dd14ab1b48d07fca5](https://pi.dev/session/#b3e85ab50754a98dd14ab1b48d07fca5)

### The Verdict

**Winner:** `pi-read-map` (Superior Technical Depth)

While the standard tool provided a functional overview based on the first 2,000 lines, `pi-read-map` correctly identified the critical architectural pattern of the file: **a single massive closure**.

#### Key Differentiator

The standard `read` tool sees only the top ~4% of the file (imports and initial definitions). It guessed the contents were a class or module export based on the start of the file.

`pi-read-map`, by generating a structural map of the entire 54k line file, "saw" that `createTypeChecker` starts on line ~1,400 and *never ends* until the bottom of the file. This allowed it to identify:
1.  **The Monolithic Closure Pattern**: The entire checker state is captured in one scope, not a class instance.
2.  **Internal Enum Definitions**: `TypeFacts`, `CheckMode`, etc., defined deep in the file.
3.  **Object Pooling**: The use of `objectAllocator` for performance.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Architectural Insight** | **High** - Identified the massive closure, object pooling, and caching strategies. | **Medium** - Identified it as a factory function but missed the monolithic closure implication. |
| **Component Analysis** | **Specific** - Listed internal Enums (`TypeFacts`, `IteratuionUse`) and Dependencies. | **Functional** - Listed capabilities (`getTypeOfSymbol`) and public API surface. |
| **Token Efficiency** | **Lower** (~77k tokens used) | **Higher** (~56k tokens used) |
| **Format** | Structured Table + Lists | Numbered Lists |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 3.1 MB, 54,419 lines |
| **Map Size** | ~8 KB (0.26% of original) |
| **Map Cost** | ~2,000 tokens |
| **Standard Session** | ~56k tokens |
| **Mapped Session** | ~77k tokens |
| **Difference** | +21k tokens (map + 3 targeted reads) |

The extra tokens enabled discovery of the monolithic closure pattern—worth the cost.

---

## Case Study 2: Python (`frame.py`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` (Superior Coverage)

The standard tool missed the vast majority of the functional methods that define the pandas DataFrame, as they reside beyond the truncation limit. `pi-read-map` successfully identified these categories, providing a true summary of the *entire* file.

#### Key Differentiator

The standard `read` tool only saw the first ~2,000 lines of the 18,771-line file. It accurately summarized the imports, class definition, and constructor, but completely missed core data manipulation functionalities.

`pi-read-map` generated a structural map that included methods defined thousands of lines deep. It successfully identified and categorized critical operations like `groupby`, `merge`, `pivot`, `melt`, `stack`, `explode`, and aggregation methods (`sum`, `mean`), which are essential to understanding the class's purpose.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Method Coverage** | **Complete** - Identified `groupby`, `merge`, `pivot`, `isna`, `sum`, etc. | **Partial** - Only saw `__init__`, properties, and basic iteration. |
| **Categorization** | **Rich** - Grouped methods by functionality (I/O, Manipulation, Aggregation). | **Basic** - Grouped by code structure (Imports, Constructor, Properties). |
| **File Insight** | **Full** - Saw all 18,771 lines. | **Limited** - Truncated at line ~2,000. |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 631 KB, 18,771 lines |
| **Standard Session** | ~16k tokens |
| **Mapped Session** | ~26k tokens |
| **Difference** | +10k tokens |

The standard tool saved tokens but missed ~90% of the DataFrame's methods.

---

## Case Study 3: Go (`types.go`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` (Line-Range Navigation)

Both tools produced comprehensive, well-categorized summaries of the Kubernetes core API types. However, `pi-read-map` provided **specific line ranges** for each component category, enabling precise navigation.

#### Key Differentiator

The 7,191-line file was small enough that both tools captured the complete structure. The critical difference: `pi-read-map` included line ranges like "Container & Pod Types (Lines 2122–2732, 3692–4654)" while the standard tool only listed categories without location information.

This matters for:
1. **Targeted reads**: Jump directly to line 4839 for Service types
2. **Understanding layout**: See that Pod types are split across two non-contiguous ranges
3. **Code navigation**: Use line numbers with editor or `read --offset`

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - All 8 type categories | **Complete** - All 8 type categories |
| **Line Ranges** | **Yes** - Specific ranges per section | **No** - Categories only |
| **Categorization** | **Excellent** - Tables with line numbers | **Excellent** - Tables without locations |
| **Actionability** | **High** - Can navigate directly | **Medium** - Must search for sections |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 303 KB, 7,191 lines |
| **Standard Session** | ~15k tokens |
| **Mapped Session** | ~18k tokens |
| **Difference** | +3k tokens |

Minimal overhead for a smaller file; both tools performed well.

---

## Case Study 4: Rust (`expr.rs`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` (Line-Range Precision)

Both tools produced excellent summaries of the Rust compiler's expression parser. However, `pi-read-map` included **specific line numbers** for every function, enabling immediate navigation to any of the 100+ parsing methods.

#### Key Differentiator

At 4,367 lines, this file is small enough that the standard tool could read the full content and produce a thorough summary. Both correctly identified the Pratt parsing architecture, error recovery patterns, and edition-aware parsing.

The difference: `pi-read-map` provides function signatures with line numbers (e.g., `parse_expr_closure` at lines 2395-2501), while the standard tool lists methods without location. For a file with dozens of similarly-named parsing methods (`parse_expr_*`), line numbers are critical for navigation.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - All parsing methods | **Complete** - All parsing methods |
| **Line Numbers** | **Yes** - Precise ranges per function | **No** - Methods listed without locations |
| **Categorization** | **Excellent** - Grouped by parsing phase (Entry, Prefix, Postfix, Control Flow) | **Excellent** - Similar grouping structure |
| **Error Recovery** | Both identified recovery methods (`recover_tilde_expr`, `recover_not_expr`, etc.) | Same |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 183 KB, 4,367 lines |
| **Standard Session** | ~14k tokens |
| **Mapped Session** | ~17k tokens |
| **Difference** | +3k tokens |

Line-number precision at minimal overhead—both tools handled this mid-sized file well.

---

## Case Study 5: C++ (`SemaExpr.cpp`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` (Deep Symbol Navigation)

Both tools produced well-organized summaries of this massive Clang semantic analysis file. However, `pi-read-map` included **precise line ranges** for functions throughout the entire 21,758-line file, while the standard tool could only describe functions from the truncated portion.

#### Key Differentiator

The standard `read` tool truncates at ~2,000 lines, seeing only ~9% of this file. It correctly summarized the visible content (includes, early diagnostics, type conversions) but had **no line numbers** for any functions.

`pi-read-map` generated a structural map with 469 symbols spanning the entire file. It provided:
1. **Line ranges** for every function (e.g., `CreateBuiltinBinOp` at lines 15242-15524)
2. **Deep symbol discovery**: Functions like `CreateRecoveryExpr` (lines 21744-21758), `tryCaptureVariable` (lines 19452-19759)
3. **Internal class locations**: Helper classes like `RebuildUnknownAnyExpr` (lines 21092-21431)

The mapped summary enabled immediate navigation to any of the 469 symbols across the file.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - 469 symbols across 21,758 lines | **Partial** - ~2,000 lines visible |
| **Line Numbers** | **Yes** - Precise ranges for every function | **No** - Functions listed without locations |
| **Deep Functions** | Identified `CreateBuiltinBinOp`, `tryCaptureVariable`, `CreateRecoveryExpr`, etc. | Could not see functions past line ~2,000 |
| **Categorization** | Grouped by functionality with line ranges | Grouped by functionality without locations |
| **Actionability** | **High** - Navigate directly to any symbol | **Low** - Must search to find locations |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 857 KB, 21,758 lines |
| **Map Symbol Count** | 469 symbols |
| **Standard Session** | ~20k tokens (truncated content) |
| **Mapped Session** | ~25k tokens (truncated content + map) |
| **Difference** | +5k tokens |

The structural map added ~5k tokens but provided navigable access to symbols spanning the entire 21k-line file—a worthwhile trade-off for files of this scale.
