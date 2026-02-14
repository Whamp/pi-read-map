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
| `clojure/core.clj` | [Clojure](https://github.com/clojure/clojure) | 270 KB | 8,229 | The Clojure language core — every built-in function, macro, and protocol |

These files demonstrate the extension's ability to provide structural understanding of massive codebases without exhausting context windows.

`pi-read-map` is a drop-in extension that enhances the built-in `read` tool. It automatically generates structural maps for large files (>2,000 lines or >50 KB) and falls back gracefully to the standard read tool on any failure. No configuration or explicit invocation is required.

---

## Important Context: One-Shot vs. Compounding Value

The verdicts below evaluate **single-query summarization** only. This is the fairest comparison, but it understates `pi-read-map`'s real value.

**The compounding advantage**: When you ask follow-up questions ("show me the implementation of `merge`", "what error handling patterns are used in the type checker?", "compare the locking strategies across these functions"), `pi-read-map` leverages the map already in context. The standard tool requires re-reading and re-processing file sections each time.

| Scenario | Standard Tool | `pi-read-map` |
|----------|---------------|---------------|
| One summary | Reads first ~2k lines | Generates map + summary |
| 3 follow-up queries | Re-reads sections (variable tokens) | Uses map in context (~0 incremental tokens for navigation) |
| Total tokens | 3N (grows with each query) | Map + summary + minimal overhead |

**Bottom line**: A "tie" in one-shot summarization likely tips toward `pi-read-map` once you use the map for targeted navigation, code comparison, or deep analysis.

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

**Tie** (with marginal advantage to `pi-read-map` for line numbers)

Both tools produced comprehensive, well-categorized summaries of the Kubernetes core API types. At 7,191 lines, this file is within the range where the standard tool can see the complete structure. The only meaningful difference: `pi-read-map` provided **specific line ranges** for each component category, enabling precise navigation.

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

**Tie** (with marginal advantage to `pi-read-map` for line numbers)

Both tools produced excellent summaries of the Rust compiler's expression parser. At 4,367 lines, this file is small enough that the standard tool captures the full content. Both correctly identified the Pratt parsing architecture, error recovery patterns, and edition-aware parsing. The only meaningful difference: `pi-read-map` included **specific line numbers** for every function.

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

---

## Case Study 6: C (`core.c`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Tie** (different strengths)

Both tools produced excellent, comprehensive summaries of the Linux kernel scheduler core. Both accurately identified all major components: runqueue management, task wakeups, scheduler entry points, migration/affinity, scheduling classes, core scheduling, and UCLAMP. `pi-read-map` provided **actual code snippets** illustrating patterns; the standard tool described patterns clearly but without code samples.

#### Key Differentiator

The standard `read` tool accurately identified all major components: runqueue management, task wakeups, scheduler entry points, migration/affinity, scheduling classes, core scheduling, and UCLAMP. It described patterns like "strict lock ordering" and "memory barriers for synchronization" but only in prose.

`pi-read-map` went further by embedding actual code excerpts:
- **Locking hierarchy** shown as a code comment block with the actual lock order
- **Memory barriers** demonstrated with specific API calls (`smp_rmb()`, `smp_store_release()`)
- **Wake queue pattern** shown with the actual `wake_q_add()` / `wake_up_q()` API
- **Static keys** illustrated with `DEFINE_STATIC_KEY_FALSE()` usage

These concrete examples make the patterns immediately actionable for kernel developers.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - All scheduler subsystems | **Complete** - All scheduler subsystems |
| **Function Detail** | Tables with descriptions | Tables with descriptions |
| **Code Examples** | **Yes** - Actual pattern implementations | **No** - Textual descriptions only |
| **Configuration Table** | **Yes** - 8 config options listed | **Mentioned** - In prose throughout |
| **Pattern Depth** | **High** - Code + explanation | **Medium** - Explanation only |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 284 KB, 10,902 lines |
| **Standard Session** | ~16k tokens |
| **Mapped Session** | ~19k tokens |
| **Difference** | +3k tokens |

Minimal overhead for concrete code examples that demonstrate kernel patterns—a valuable addition for systems programming contexts.

---

## Case Study 7: Markdown (`CHANGELOG-1.29.md`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Tie** (different strengths)

Both tools produced comprehensive summaries of this Kubernetes changelog. `pi-read-map` excelled at identifying the **repeating structural patterns** that define how each release section is organized, while the standard tool produced more detailed **data aggregation** (comprehensive CVE tables, per-release Go version tracking). Choose based on whether you need document architecture or reference data.

#### Key Differentiator

The standard `read` tool accurately catalogued all 21 releases and their contents, creating useful tables for Go version updates, CVEs, and architectural changes. It treated the file as a data source to be aggregated.

`pi-read-map` recognized the changelog as a **templated document** with standardized sections. It identified the exact subsection structure repeated across all 21 versions (Downloads, Source Code, Client Binaries, Container Images, Changelog since..., Changes by Kind, Dependencies). This structural insight is more valuable for understanding how to navigate or parse the document.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - All 21 versions documented | **Complete** - All 21 versions documented |
| **Structural Insight** | **High** - Identified repeating per-version section template | **Medium** - Treated versions as data records |
| **Pattern Recognition** | **Yes** - Documented the standardized subsection structure | **No** - Focused on content aggregation |
| **Actionability** | **High** - Understands document architecture for navigation | **Medium** - Data tables for reference |
| **Security CVEs** | 3 CVEs with format documentation | 6 CVEs with detailed descriptions |
| **Go Version Tracking** | Basic mention | Detailed per-release table |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 430 KB, 3,726 lines |
| **Standard Session** | ~13k tokens |
| **Mapped Session** | ~16k tokens |
| **Difference** | +3k tokens |

Both tools handled this smaller file well. The mapped summary's structural pattern recognition provides better understanding of the document's organization, while the standard summary's data aggregation provides more comprehensive reference tables.

---

## Case Study 8: JSON (`cloudformation-spec.json`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` (Honest Coverage)

Both tools produced well-structured summaries of this massive AWS CloudFormation specification. However, the standard tool **fabricated statistics** it could not possibly have verified, while `pi-read-map` provided an accurate analysis grounded in actual file contents.

#### Key Differentiator

The standard `read` tool only processes the first ~2,000 lines of this 254,827-line file (less than 1%). Yet it presented specific counts like "String: 10,383", "Immutable: 2,506", and "Mutable: 20,215" as factual statistics. These numbers appear to be hallucinated—there is no way to count 20,000+ properties from 2,000 lines of JSON.

`pi-read-map` generated a structural map of the entire file and provided accurate, defensible observations: 7,354 PropertyTypes, 1,312 ResourceTypes, coverage of 228+ AWS services. It did not claim knowledge it couldn't verify from the actual content.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - Full 254,827 lines analyzed | **Partial** - First ~2,000 lines only |
| **Statistic Accuracy** | **Verified** - Counts derived from actual content | **Fabricated** - Presented counts without reading full file |
| **Service Coverage** | **228+ services identified** | Mentioned broad coverage without specifics |
| **Type System** | Accurate property schema documentation | Similar structure but with invented statistics |
| **Honesty** | **High** - Stayed within verified knowledge | **Low** - Presented speculation as fact |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 13 MB, 254,827 lines |
| **Standard Session** | ~18k tokens |
| **Mapped Session** | ~28k tokens |
| **Difference** | +10k tokens |

The extra tokens bought genuine full-file coverage versus confident-sounding but unverifiable claims. For specification files where accuracy matters, `pi-read-map` provides trustworthy analysis.

---

## Case Study 9: SQL (`structure.sql`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` (Precise Quantification)

Both tools produced comprehensive summaries of this massive GitLab database schema, but `pi-read-map` delivered **verifiably accurate counts** while the standard tool approximated with vague qualifiers ("200+" vs actual 296 functions, "~1,000+" vs 1,399 tables).

#### Key Differentiator

The standard `read` tool characterized the schema in broad strokes—correctly identifying it as a GitLab PostgreSQL dump with partitioning and sharding—but its counts were estimates ("200+ functions", "~1,000+ tables", "200+ comments"). These approximations understate the actual scale.

`pi-read-map` generated precise tallies from the structural map:
- **296 functions** (not "200+")
- **1,399 tables** (not "~1,000+")  
- **3,688 indexes**, **815 sequences**, **343 triggers**, **1,674 foreign keys**

It also identified specific partition counts (64 hash partitions for `issue_search_data`, 32 for `namespace_descendants`) that the standard summary glossed over.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - Full 58,599-line schema analyzed | **Complete** - Full structure visible (regular SQL format) |
| **Count Precision** | **Exact** - 296 functions, 1,399 tables, 3,688 indexes | **Approximate** - "200+", "~1,000+", "200+" |
| **Function Categories** | **7 detailed categories** with specific examples per type | **7 broad categories** with general descriptions |
| **Partition Detail** | Specific partition counts (64, 32, 16) per table | General partitioning strategy description |
| **Sharding Patterns** | Detailed `organization_id` propagation analysis | Identified sharding keys but less mechanism detail |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 2.7 MB, 58,599 lines |
| **Map Symbol Count** | ~2,500+ schema objects |
| **Standard Session** | ~45k tokens |
| **Mapped Session** | ~58k tokens |
| **Difference** | +13k tokens |

The extra tokens bought quantitative precision—exact counts versus hand-wavy approximations. For database schemas where scale matters (ops planning, migration estimates), `pi-read-map`'s accuracy is essential.

---

## Case Study 10: YAML (`github-api.yaml`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` (Structural Section Mapping)

Both summaries provided useful OpenAPI documentation analysis, but `pi-read-map` revealed the **massive scale distribution** of the file's three main sections, while the standard tool presented statistics without structural context.

#### Key Differentiator

The standard `read` tool truncated at ~2,000 lines (less than 1% of this 239,368-line file) yet presented specific counts: "1,344 operations", "907 schemas", "44 categories". These numbers appear to be estimates or hallucinations—impossible to verify from the visible portion.

`pi-read-map` generated a structural map showing the **actual section sizes by line count**:
- **Paths section**: ~54,500 lines (API endpoints)
- **Webhooks section**: ~17,500 lines (`x-webhooks` extension)
- **Components section**: ~167,000 lines (schemas, parameters, responses)

This structural breakdown provides actionable insight into where to find specific content—critical for navigating an 8.6 MB specification file.

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | **Complete** - Full 239,368 lines mapped | **Partial** - First ~2,000 lines only |
| **Section Sizes** | **Precise** - Paths (54.5k), Webhooks (17.5k), Components (167k) | **Absent** - No structural breakdown |
| **Category Count** | 45 tags identified | 44 tags claimed |
| **Line Ranges** | **Yes** - Section boundaries documented | **No** - No location information |
| **Statistic Claims** | Cautious - Focused on verifiable patterns | **Overconfident** - Specific counts unverifiable from visible content |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | 8.6 MB, 239,368 lines |
| **Map Size** | ~16 KB (0.18% of original) |
| **Standard Session** | ~18k tokens |
| **Mapped Session** | ~28k tokens |
| **Difference** | +10k tokens |

The structural map added ~10k tokens but provided navigable section boundaries for an 8.6 MB specification—essential for locating specific schemas or endpoints in the largest file in the demo suite.
