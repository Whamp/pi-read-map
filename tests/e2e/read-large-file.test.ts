/**
 * E2E Test: Large File Map Generation
 *
 * Verifies that reading a file exceeding thresholds (>2000 lines OR >50KB)
 * produces a structural map alongside the truncated content.
 *
 * These tests verify the ACTUAL TOOL OUTPUT, not LLM summaries.
 */

import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import {
  cleanupE2ETempFiles,
  createTempFile,
  FILE_MAP_DELIMITER,
  getProjectRoot,
  hasFileMap,
  hasTargetedReadGuidance,
  runPiSession,
  waitBriefly,
  wasTruncated,
} from "../helpers/pi-runner.js";

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
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    // Get the actual tool output
    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Verify the file map markers are in the raw tool output
      expect(hasFileMap(toolOutput)).toBe(true);

      // Verify the box delimiter is present
      expect(toolOutput).toContain(FILE_MAP_DELIMITER);

      // Verify "File Map:" header is present
      expect(toolOutput).toContain("File Map:");
    }

    await result.cleanup();
  });

  it("includes file metadata in map header", async () => {
    const result = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // The map header should contain file info
      expect(toolOutput).toContain("processor.py");
      expect(toolOutput).toContain("Python");

      // Should contain line count and size
      expect(toolOutput).toMatch(/\d+\s*(lines|,)/);
      expect(toolOutput).toMatch(/\d+\s*KB/);
    }

    await result.cleanup();
  });

  it("includes truncation notice for large files", async () => {
    const result = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should indicate file was truncated
      expect(wasTruncated(toolOutput)).toBe(true);
    }

    await result.cleanup();
  });

  it("extracts Python symbols with line numbers", async () => {
    const result = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should contain line number ranges in [start-end] or [line] format
      expect(toolOutput).toMatch(/\[\d+(-\d+)?\]/);

      // Should contain class definitions from processor.py
      expect(toolOutput).toMatch(/class\s+\w+/);

      // Should contain function/method definitions
      expect(toolOutput).toMatch(/def\s+\w+|async\s+def\s+\w+/);
    }

    await result.cleanup();
  });

  it("provides targeted read guidance footer", async () => {
    const result = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should have guidance footer
      expect(hasTargetedReadGuidance(toolOutput)).toBe(true);
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
      prompt: `Use the read tool to read "${tempFile}"`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should have a file map
      expect(hasFileMap(toolOutput)).toBe(true);

      // Should contain our generated functions
      expect(toolOutput).toContain("function_0");

      // Should identify as Python
      expect(toolOutput).toContain("Python");
    }

    await result.cleanup();
  });
});
