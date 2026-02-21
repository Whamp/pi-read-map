# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-02-20

### Changed

- **Inline file maps**: Maps are now embedded directly in the `read` tool result text instead of being sent as separate `file-map` custom messages. This sacrifices the dedicated collapsible TUI widget but enables **true parallel tool execution**. Previously, custom messages interrupted parallel tool batches, causing skipped reads and forcing slow auto-recovery loops. Inlining guarantees the LLM receives the map immediately in the same turn, drastically speeding up parallel reads and preventing strict API conversation ordering errors (400 Bad Request).
- Removed the `read-recovery` mechanism since parallel reads are no longer skipped by map generation.
- Removed `@mariozechner/pi-tui` dependency since custom message rendering is no longer needed.

### Fixed

- Directory reads now throw an `EISDIR` error with inline `ls` fallback text reliably. The fallback listing is preserved in thrown errors instead of being swallowed by the internal `try/catch` path.
- npm tarballs now exclude local scratch artifacts (`*.patch`, `*.orig`, `fix-*.js`, etc.) via `.npmignore`, preventing accidental publication of local debug/review files.

## [1.2.5] - 2026-02-15

### Fixed

- `sendMessage` calls in `tool_result` handler now use `deliverAs: "followUp"` instead of the default `"steer"` mode. The default `"steer"` mode interrupts streaming and skips remaining parallel tools — when multiple reads ran concurrently and one triggered a file-map or directory-listing message, the remaining tool calls were skipped, leaving `tool_use` blocks without matching `tool_result` blocks. This caused a 400 error from the Claude API on the next request.

## [1.2.4] - 2026-02-15

### Fixed

- Binary/image files (`.jpg`, `.png`, `.gif`, `.webp`, etc.) no longer enter the map generation pipeline — they are delegated directly to the built-in read tool. Previously, a >50 KB image would pass the size threshold, run `wc -l` on binary data, and trigger ctags/grep fallback. When multiple image reads ran in parallel, the resulting `sendMessage` calls broke the Claude API's `tool_use`/`tool_result` pairing requirement.
- Fallback mapper now returns `null` when grep finds zero symbols instead of returning an empty `FileMap`. This prevents unnecessary `sendMessage` calls for unmappable files.

## [1.2.2] - 2026-02-14

### Changed

- "Ctrl+O to expand" hint in file map summary uses dim styling instead of warning (yellow) for a less alarming appearance

## [1.2.1] - 2026-02-14

### Fixed

- Published tarball reduced from 310 KB to 49 KB by adding `.npmignore` (excluded `.codemap/` caches, compiled Go binary, `.pi/` agent files, tests, and demo assets)

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
