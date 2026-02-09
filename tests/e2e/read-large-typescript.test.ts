/**
 * E2E Test: Large TypeScript File Map Generation
 *
 * Verifies that the ts-morph native AST parser integrates correctly
 * with the extension for large TypeScript files.
 *
 * Parser type: Native in-process AST (ts-morph)
 * Model: glm-4.6 (medium) - TypeScript files, moderate context
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

describe("e2e: read large TypeScript file", () => {
  const projectRoot = getProjectRoot();
  const largeFixture = join(projectRoot, "tests/fixtures/large/handler.ts");

  afterEach(async () => {
    await waitBriefly();
  });

  afterAll(async () => {
    await cleanupE2ETempFiles();
  });

  it("produces a file map for large TypeScript files", async () => {
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

  it("identifies file as TypeScript in map header", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${largeFixture}"`,
      timeout: 90_000,
    });

    const mapOutput = result.getFileMapOutput();
    expect(mapOutput).not.toBeNull();

    if (mapOutput) {
      expect(mapOutput).toContain("handler.ts");
      expect(mapOutput).toContain("TypeScript");
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

  it("extracts TypeScript symbols with line numbers", async () => {
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

      // Should contain TypeScript-specific constructs
      // (functions, classes, interfaces, types)
      expect(mapOutput).toMatch(/function|class|interface|type/i);
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
