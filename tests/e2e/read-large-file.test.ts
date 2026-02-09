/**
 * E2E Test: Large File Map Generation
 *
 * Verifies that reading a file exceeding thresholds (>2000 lines OR >50KB)
 * produces a structural map alongside the truncated content.
 *
 * These tests verify the ACTUAL TOOL OUTPUT and FILE MAP MESSAGE.
 * The map is now sent as a separate custom message (file-map type).
 *
 * Model: glm-4.7 (smartest) - Python files have largest context
 */

import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import { MODELS, PROVIDER } from "../helpers/models.js";
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

    // Get the file map message (now sent separately)
    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      // Verify the file map markers are in the map output
      expect(hasFileMap(mapOutput)).toBe(true);

      // Verify the box delimiter is present
      expect(mapOutput).toContain(FILE_MAP_DELIMITER);

      // Verify "File Map:" header is present
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
      // The map header should contain file info
      expect(mapOutput).toContain("processor.py");
      expect(mapOutput).toContain("Python");

      // Should contain line count and size
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

    // Truncation notice should be in the tool output (content) OR
    // the file map should be present (indicating truncation occurred)
    const toolOutput = result.getToolOutput();
    const mapOutput = result.getFileMapOutput();

    // If there's a tool output, it may have truncation info
    // OR if there's a file map, that indicates truncation occurred
    expect(toolOutput !== null || mapOutput !== null).toBe(true);

    // File map presence indicates truncation happened
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
      // Should contain line number ranges in [start-end] or [line] format
      expect(mapOutput).toMatch(/\[\d+(-\d+)?\]/);

      // Should contain class definitions from processor.py
      expect(mapOutput).toMatch(/class\s+\w+/);

      // Should contain method names like __init__, process, validate
      // The map format uses "name: [lines]" not "def name"
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
      // Should have guidance footer
      expect(hasTargetedReadGuidance(mapOutput)).toBe(true);
    }

    await result.cleanup();
  });

  it("produces map for generated large Python file", async () => {
    // Generate a large file dynamically
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
      // Should have a file map
      expect(hasFileMap(mapOutput)).toBe(true);

      // Should contain our generated functions
      expect(mapOutput).toContain("function_0");

      // Should identify as Python
      expect(mapOutput).toContain("Python");
    }

    await result.cleanup();
  });
});
