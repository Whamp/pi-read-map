import { randomUUID } from "node:crypto";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEMP_BASE = join(tmpdir(), "pi-read-map-integration");

// Track directories created by this process for isolated cleanup
const createdDirs = new Set<string>();

/**
 * Create a temporary file with the given filename and content.
 * Returns the absolute path to the created file.
 */
export async function createTempFile(
  filename: string,
  content: string
): Promise<string> {
  const dir = join(TEMP_BASE, randomUUID().slice(0, 8));
  await mkdir(dir, { recursive: true });
  createdDirs.add(dir);
  const filepath = join(dir, filename);
  await writeFile(filepath, content);
  return filepath;
}

/**
 * Clean up all temporary files created by this test file.
 * Uses process-local tracking to avoid affecting other parallel tests.
 */
export async function cleanupAllTempFiles(): Promise<void> {
  const dirs = [...createdDirs];
  createdDirs.clear();
  await Promise.all(
    dirs.map((dir) => rm(dir, { recursive: true, force: true }))
  );
}

/**
 * Generate Python code with the specified number of functions.
 */
export function generatePythonCode(functionCount: number): string {
  const lines = ["# Generated Python"];
  for (let i = 0; i < functionCount; i++) {
    lines.push(`def func_${i}(x: int) -> bool:`);
    lines.push("    return True");
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Generate TypeScript code with the specified number of classes.
 */
export function generateTypeScriptCode(classCount: number): string {
  const lines = ["// Generated TypeScript"];
  for (let i = 0; i < classCount; i++) {
    lines.push(`export class C${i} { m(): void {} }`);
  }
  return lines.join("\n");
}
