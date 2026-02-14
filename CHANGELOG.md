# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-02-14

### Added

- **Clojure mapper** — tree-sitter-based parser for `.clj`, `.cljs`, `.cljc`, and `.edn` files. Extracts `ns`, `defn`, `defn-`, `def`, `defonce`, `defmacro`, `defmulti`, `defmethod`, `defprotocol`, `defrecord`, and `deftype` forms with docstrings, signatures, modifiers, and protocol method children. Supports reader conditionals (`#?`) with per-platform annotations. Contributed by [Baishampayan Ghose](https://github.com/ghoseb). ([#2](https://github.com/Whamp/pi-read-map/pull/2))
- Clojure demo asset (`clojure/core.clj` from the official Clojure repo)

### Changed

- Tree-sitter tests use `describe.runIf` for conditional execution

## [1.1.0] - 2026-02-10

### Added

- Docstring extraction (`FileSymbol.docstring`) across all mappers
- Export flag (`FileSymbol.isExported`) across all mappers
- Required imports (`FileMap.imports`) across all mappers
- Skipped read recovery — detects reads cancelled by steering queue and re-issues them
- JSONL session-aware maps for pi session files
- Directory read handling with EISDIR error and `ls` fallback

### Fixed

- Symbol duplication in file map output
- oxlint warnings and errors resolved across codebase

### Changed

- Test helpers refactored; `models.ts` renamed to `constants.ts`

## [1.0.0] - 2026-02-09

Initial release.

### Added

- Structural file maps for large files (>2,000 lines or >50 KB)
- 14 language mappers: TypeScript, JavaScript, Python, Go, Rust, C, C++, SQL, JSON, JSONL, YAML, TOML, CSV, Markdown
- Budget-aware formatting with progressive detail reduction (10 KB full → 100 KB truncated)
- In-memory caching by file path and modification time
- Fallback chain: language mapper → universal-ctags → grep
- Custom `file-map` messages delivered after `tool_result` events
- E2E test infrastructure via tmux
- Demo assets from 10 major open-source projects
