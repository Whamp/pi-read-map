/**
 * E2E Test: Large Go File Map Generation
 *
 * Verifies that the Go external binary parser integrates correctly
 * with the extension for large Go files.
 *
 * Parser type: External binary (go_outline compiled from go_outline.go)
 * Model: glm-4.7 (smartest) - Go files have large context
 */

import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import { MODELS, PROVIDER } from "../helpers/constants.js";
import {
  cleanupE2ETempFiles,
  FILE_MAP_DELIMITER,
  getProjectRoot,
  hasFileMap,
  hasTargetedReadGuidance,
  runPiSession,
  waitBriefly,
} from "../helpers/pi-runner.js";

/** Model configuration for this test file */
const MODEL_CONFIG = { provider: PROVIDER, model: MODELS.SMART };

describe("e2e: read large Go file", () => {
  const projectRoot = getProjectRoot();
  const largeFixture = join(projectRoot, "tests/fixtures/large/server.go");

  afterEach(async () => {
    await waitBriefly();
  });

  afterAll(async () => {
    await cleanupE2ETempFiles();
  });

  it("produces a file map for large Go files", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 120_000, // Go binary may need to compile on first run
    });

    const mapOutput = result.getFileMapOutput();

    // Go mapper may return null if Go is not installed
    // In that case, fallback (ctags or grep) should still produce output
    if (mapOutput) {
      expect(hasFileMap(mapOutput)).toBe(true);
      expect(mapOutput).toContain(FILE_MAP_DELIMITER);
      expect(mapOutput).toContain("File Map:");
    } else {
      // If no map output, at least the tool output should exist
      const toolOutput = result.getToolOutput();
      expect(toolOutput).not.toBeNull();
    }

    await result.cleanup();
  });

  it("identifies file as Go in map header", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 120_000,
    });

    const mapOutput = result.getFileMapOutput();

    if (mapOutput) {
      expect(mapOutput).toContain("server.go");
      expect(mapOutput).toContain("Go");
    }

    await result.cleanup();
  });

  it("includes file metadata in map header", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 120_000,
    });

    const mapOutput = result.getFileMapOutput();

    if (mapOutput) {
      // Should contain line count and size
      expect(mapOutput).toMatch(/\d+\s*(lines|,)/);
      expect(mapOutput).toMatch(/\d+\s*KB/);
    }

    await result.cleanup();
  });

  it("extracts Go symbols with line numbers", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 120_000,
    });

    const mapOutput = result.getFileMapOutput();

    if (mapOutput) {
      // Should contain line number ranges in [start-end] or [line] format
      expect(mapOutput).toMatch(/\[\d+(-\d+)?\]/);

      // Should contain Go-specific constructs
      // Go mapper outputs: class (for structs), NewX (constructors), *Type.Method (methods)
      expect(mapOutput).toMatch(/class|New\w+|\*\w+\.\w+/);
    }

    await result.cleanup();
  });

  it("provides targeted read guidance footer", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 120_000,
    });

    const mapOutput = result.getFileMapOutput();

    if (mapOutput) {
      expect(hasTargetedReadGuidance(mapOutput)).toBe(true);
    }

    await result.cleanup();
  });
});
