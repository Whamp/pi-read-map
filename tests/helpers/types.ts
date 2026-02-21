/**
 * Types for pi-runner E2E test helper.
 */

export interface PiSessionOptions {
  /** Path to extension (relative to project root) */
  extension?: string;
  /** Task prompt to send to pi */
  prompt: string;
  /** Execution timeout in ms (default: 60000) */
  timeout?: number;
  /** Working directory (default: project root) */
  cwd?: string;
  /** Additional CLI flags */
  flags?: string[];
  /** Model provider (default: zai) */
  provider?: string;
  /** Model name (default: glm-4.7) */
  model?: string;
}

export interface ToolResult {
  toolName: string;
  toolCallId: string;
  content: { type: string; text?: string }[];
  isError: boolean;
}

export interface PiSessionResult {
  /** Raw stdout (JSON lines) */
  rawOutput: string;
  /** Stderr from pi */
  stderr: string;
  /** Exit code */
  exitCode: number;
  /** Parsed tool results from the session */
  toolResults: ToolResult[];
  /** Get the text content from the first tool result */
  getToolOutput(): string | null;
  /** Get the file map from the first tool result (inline in content) */
  getFileMapOutput(): string | null;
  /** Get combined tool output and file map */
  getCombinedOutput(): string | null;
  /** Cleanup function */
  cleanup: () => Promise<void>;
}
