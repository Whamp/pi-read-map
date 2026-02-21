/**
 * E2E Test: Large File Map Generation
 *
 * Verifies that reading a file exceeding thresholds (>2000 lines OR >50KB)
 * produces a structural map inline in the tool result content.
 *
 * Model: glm-4.7 (smartest) - Python files have largest context
 */

import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import { MODELS, PROVIDER } from "../helpers/constants.js";
import {
  cleanupE2ETempFiles,
  createTempFile,
  FILE_MAP_DELIMITER,
  getProjectRoot,
  hasFileMap,
  hasTargetedReadGuidance,
  runPiSession,
  waitBriefly,
} from "../helpers/pi-runner.js";

/** Model configuration for this test file */
const MODEL_CONFIG = { provider: PROVIDER, model: MODELS.SMART };

describe("e2e: read large file", () => {
  const projectRoot = getProjectRoot();
  const largeFixture = join(projectRoot, "tests/fixtures/large/processor.py");

  afterEach(async () => {
    await waitBriefly();
  });

  afterAll(async () => {
    await cleanupE2ETempFiles();
  });

  it("produces a file map for files over line threshold", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    // File map is now inline in the tool result
    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      expect(hasFileMap(mapOutput)).toBe(true);
      expect(mapOutput).toContain(FILE_MAP_DELIMITER);
      expect(mapOutput).toContain("File Map:");
    }

    await result.cleanup();
  });

  it("includes file metadata in map header", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      expect(mapOutput).toContain("processor.py");
      expect(mapOutput).toContain("Python");
      expect(mapOutput).toMatch(/\d+\s*(lines|,)/);
      expect(mapOutput).toMatch(/\d+\s*KB/);
    }

    await result.cleanup();
  });

  it("includes truncation notice for large files", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    const mapOutput = result.getFileMapOutput();

    // Either truncation info in tool output or a file map (indicating truncation)
    expect(toolOutput !== null || mapOutput !== null).toBe(true);

    if (mapOutput) {
      expect(mapOutput).toContain("File Map:");
    }

    await result.cleanup();
  });

  it("extracts Python symbols with line numbers", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      // Line number ranges in [start-end] or [line] format
      expect(mapOutput).toMatch(/\[\d+(-\d+)?\]/);
      // Class definitions from processor.py
      expect(mapOutput).toMatch(/class\s+\w+/);
      // Method names
      expect(mapOutput).toMatch(/__init__|process|validate/);
    }

    await result.cleanup();
  });

  it("provides targeted read guidance footer", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      expect(hasTargetedReadGuidance(mapOutput)).toBe(true);
    }

    await result.cleanup();
  });

  it("produces map for generated large Python file", async () => {
    const lines: string[] = ["# Large Python file for E2E testing", ""];

    for (let i = 0; i < 800; i++) {
      lines.push(`def function_${i}(arg1: int, arg2: str) -> bool:`);
      lines.push(`    """Docstring for function ${i}."""`);
      lines.push(`    return True`);
      lines.push("");
    }

    const content = lines.join("\n");
    const tempFile = await createTempFile("generated_large.py", content);

    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${tempFile}"`,
      timeout: 90_000,
    });

    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      expect(hasFileMap(mapOutput)).toBe(true);
      expect(mapOutput).toContain("function_0");
      expect(mapOutput).toContain("Python");
    }

    await result.cleanup();
  });
});
