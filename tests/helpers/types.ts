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

export interface CustomMessage {
  customType: string;
  content: string;
  details?: Record<string, unknown>;
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
  /** Parsed custom messages from the session */
  customMessages: CustomMessage[];
  /** Get the text content from the first tool result */
  getToolOutput(): string | null;
  /** Get the first file-map custom message content */
  getFileMapOutput(): string | null;
  /** Get combined tool output and file map (for backward compat) */
  getCombinedOutput(): string | null;
  /** Cleanup function */
  cleanup: () => Promise<void>;
}
