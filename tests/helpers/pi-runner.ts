/**
 * Pi Session Runner for E2E Tests
 *
 * Spawns pi sessions with the extension loaded and captures output
 * for verification in E2E tests.
 *
 * Uses --mode json to capture raw tool results rather than LLM summaries.
 *
 * Model Distribution Strategy:
 * - glm-4.7: 3 concurrent (smartest, for complex large file tests)
 * - glm-4.6: 3 concurrent (medium, for large file tests)
 * - glm-4.5: 10 concurrent (fastest, for simple small file tests)
 */

import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { PiSessionOptions, PiSessionResult, ToolResult } from "./types.js";

import { FILE_MAP_DELIMITER } from "./constants.js";

export { FILE_MAP_DELIMITER } from "./constants.js";
export type { PiSessionOptions, PiSessionResult, ToolResult } from "./types.js";

/** Project root directory */
const PROJECT_ROOT = resolve(import.meta.dirname, "../..");

/** Temp directory for E2E test outputs */
const E2E_TEMP_DIR = join(PROJECT_ROOT, "tests/fixtures/tmp/e2e");

/** Default provider for E2E tests */
const DEFAULT_PROVIDER = "zai";

/** Default model for E2E tests */
const DEFAULT_MODEL = "glm-4.5";

/**
 * Parse JSON lines output to extract tool results.
 * File maps are now inline in the tool result content (not separate messages).
 */
function parseSessionOutput(jsonLines: string): {
  toolResults: ToolResult[];
} {
  const toolResults: ToolResult[] = [];

  for (const line of jsonLines.split("\n")) {
    if (!line.trim()) {
      continue;
    }

    try {
      const event = JSON.parse(line);

      // Look for agent_end which contains the full message history
      if (event.type === "agent_end" && Array.isArray(event.messages)) {
        for (const msg of event.messages) {
          if (msg.role === "toolResult") {
            toolResults.push({
              toolName: msg.toolName,
              toolCallId: msg.toolCallId,
              content: msg.content || [],
              isError: msg.isError || false,
            });
          }
        }
      }
    } catch {
      // Skip non-JSON lines
    }
  }

  return { toolResults };
}

/**
 * Sleep utility that follows linting rules.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Run a pi session with the extension loaded in non-interactive mode.
 * Uses --mode json to capture raw tool output.
 */
export function runPiSession(
  options: PiSessionOptions
): Promise<PiSessionResult> {
  const {
    extension = "./src/index.ts",
    prompt,
    timeout = 60_000,
    cwd = PROJECT_ROOT,
    flags = [],
    provider = DEFAULT_PROVIDER,
    model = DEFAULT_MODEL,
  } = options;

  const extPath = resolve(cwd, extension);
  const args = [
    "--provider",
    provider,
    "--model",
    model,
    "--mode",
    "json", // Use JSON mode to get raw tool output
    "-ne",
    "-ns",
    "-np",
    "-e",
    extPath,
    "-p",
    prompt,
    "--no-session",
    ...flags,
  ];

  return new Promise<PiSessionResult>((resolve, reject) => {
    const proc = spawn("pi", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PI_CONFIG_DIR: join(E2E_TEMP_DIR, ".pi-config"),
      },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGTERM");
    }, timeout);

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        const timeoutError = new Error("Pi session timed out");
        reject(timeoutError);
      } else {
        const { toolResults } = parseSessionOutput(stdout);
        const [firstResult] = toolResults;

        const getToolOutputFn = (): string | null => {
          if (!firstResult) {
            return null;
          }
          const textContent = firstResult.content.find(
            (c) => c.type === "text"
          );
          return textContent?.text ?? null;
        };

        // File maps are now inline in the tool result content.
        // Extract the map portion by looking for the delimiter.
        const getFileMapOutputFn = (): string | null => {
          // Scan all tool results (important for parallel reads where the first result might be small)
          for (const tr of toolResults) {
            for (const block of tr.content) {
              if (
                block.type === "text" &&
                block.text &&
                block.text.includes(FILE_MAP_DELIMITER) &&
                block.text.includes("File Map:")
              ) {
                return block.text;
              }
            }
          }
          return null;
        };

        resolve({
          rawOutput: stdout,
          stderr,
          exitCode: code ?? 0,
          toolResults,
          getToolOutput: getToolOutputFn,
          getFileMapOutput: getFileMapOutputFn,
          getCombinedOutput(): string | null {
            const toolOut = getToolOutputFn();
            const mapOut = getFileMapOutputFn();
            if (!toolOut && !mapOut) {
              return null;
            }
            return [toolOut, mapOut].filter(Boolean).join("\n");
          },
          cleanup: async () => {
            // No-op cleanup function
          },
        });
      }
    });

    proc.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/**
 * Create a temporary test file with the given content.
 */
export async function createTempFile(
  filename: string,
  content: string
): Promise<string> {
  const tempDir = join(E2E_TEMP_DIR, "files");
  await mkdir(tempDir, { recursive: true });
  const filePath = join(tempDir, filename);
  await writeFile(filePath, content);
  return filePath;
}

/**
 * Clean up all E2E temp files.
 */
export async function cleanupE2ETempFiles(): Promise<void> {
  await rm(E2E_TEMP_DIR, { recursive: true, force: true });
}

/**
 * Get the project root directory.
 */
export function getProjectRoot(): string {
  return PROJECT_ROOT;
}

/**
 * Check if tool output contains the file map markers.
 */
export function hasFileMap(toolOutput: string): boolean {
  return (
    toolOutput.includes(FILE_MAP_DELIMITER) && toolOutput.includes("File Map:")
  );
}

/**
 * Check if tool output contains the targeted read guidance.
 */
export function hasTargetedReadGuidance(toolOutput: string): boolean {
  return toolOutput.includes("Use read(path, offset=");
}

/**
 * Check if tool output indicates truncation occurred.
 */
export function wasTruncated(toolOutput: string): boolean {
  return toolOutput.includes("[Truncated:") || toolOutput.includes("truncated");
}

/**
 * Wait for a short period (used in afterEach hooks).
 */
export async function waitBriefly(): Promise<void> {
  await sleep(100);
}
