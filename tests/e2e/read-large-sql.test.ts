/**
 * E2E Test: Large SQL File Map Generation
 *
 * Verifies that the regex-based SQL parser integrates correctly
 * with the extension for large SQL files.
 *
 * Parser type: Native regex (no external dependencies)
 * Model: glm-4.6 (medium) - SQL files, moderate context
 */

import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import { MODELS, PROVIDER } from "../helpers/models.js";
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
const MODEL_CONFIG = { provider: PROVIDER, model: MODELS.MEDIUM };

describe("e2e: read large SQL file", () => {
  const projectRoot = getProjectRoot();
  const largeFixture = join(projectRoot, "tests/fixtures/large/schema.sql");

  afterEach(async () => {
    await waitBriefly();
  });

  afterAll(async () => {
    await cleanupE2ETempFiles();
  });

  it("produces a file map for large SQL files", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      expect(hasFileMap(mapOutput)).toBe(true);
      expect(mapOutput).toContain(FILE_MAP_DELIMITER);
      expect(mapOutput).toContain("File Map:");
    }

    await result.cleanup();
  });

  it("identifies file as SQL in map header", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      expect(mapOutput).toContain("schema.sql");
      expect(mapOutput).toContain("SQL");
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
      // Should contain line count and size
      expect(mapOutput).toMatch(/\d+\s*(lines|,)/);
      expect(mapOutput).toMatch(/\d+\s*KB/);
    }

    await result.cleanup();
  });

  it("extracts SQL DDL statements with line numbers", async () => {
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

      // Should contain SQL DDL keywords (TABLE, VIEW, INDEX, FUNCTION, etc.)
      expect(mapOutput).toMatch(/TABLE|VIEW|INDEX|FUNCTION|PROCEDURE/i);
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
});
