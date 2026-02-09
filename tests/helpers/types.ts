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
  /** Cleanup function */
  cleanup: () => Promise<void>;
}
