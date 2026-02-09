/**
 * E2E Test: Small Non-Python File Passthrough
 *
 * Verifies that small file passthrough behavior works correctly
 * for non-Python languages. This ensures the extension's threshold
 * logic isn't Python-specific.
 *
 * Tests TypeScript and Go small files.
 * Model: glm-4.5 (fast) - Simple small file tests
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
  runPiSession,
  waitBriefly,
} from "../helpers/pi-runner.js";

/** Model configuration for this test file */
const MODEL_CONFIG = { provider: PROVIDER, model: MODELS.FAST };

describe("e2e: read small non-Python files", () => {
  const projectRoot = getProjectRoot();
  const smallTypeScript = join(projectRoot, "tests/fixtures/small/hello.ts");
  const smallGo = join(projectRoot, "tests/fixtures/small/hello.go");

  afterEach(async () => {
    await waitBriefly();
  });

  afterAll(async () => {
    await cleanupE2ETempFiles();
  });

  it("passes small TypeScript files through without a map", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${smallTypeScript}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    const mapOutput = result.getFileMapOutput();

    // Small files should NOT get a file map message
    expect(mapOutput).toBeNull();

    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should NOT contain map markers
      expect(hasFileMap(toolOutput)).toBe(false);
      expect(toolOutput).not.toContain(FILE_MAP_DELIMITER);
      expect(toolOutput).not.toContain("File Map:");

      // Should contain actual TypeScript content
      expect(toolOutput).toMatch(/interface|function|class/);
    }

    await result.cleanup();
  });

  it("passes small Go files through without a map", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${smallGo}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    const mapOutput = result.getFileMapOutput();

    // Small files should NOT get a file map message
    expect(mapOutput).toBeNull();

    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should NOT contain map markers
      expect(hasFileMap(toolOutput)).toBe(false);
      expect(toolOutput).not.toContain(FILE_MAP_DELIMITER);
      expect(toolOutput).not.toContain("File Map:");

      // Should contain actual Go content
      expect(toolOutput).toMatch(/package|func|struct/);
    }

    await result.cleanup();
  });

  it("passes small generated SQL file through without a map", async () => {
    const content = `
-- Small SQL file
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE
);

CREATE INDEX idx_users_email ON users(email);
`;

    const tempFile = await createTempFile("small_schema.sql", content);

    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${tempFile}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    const mapOutput = result.getFileMapOutput();

    // Small files should NOT get a file map message
    expect(mapOutput).toBeNull();

    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      expect(hasFileMap(toolOutput)).toBe(false);
      expect(toolOutput).toContain("CREATE TABLE");
    }

    await result.cleanup();
  });

  it("passes small generated JSON file through without a map", async () => {
    const content = JSON.stringify(
      {
        name: "test-package",
        version: "1.0.0",
        dependencies: {
          lodash: "^4.17.21",
        },
      },
      null,
      2
    );

    const tempFile = await createTempFile("small_package.json", content);

    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${tempFile}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    const mapOutput = result.getFileMapOutput();

    // Small files should NOT get a file map message
    expect(mapOutput).toBeNull();

    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      expect(hasFileMap(toolOutput)).toBe(false);
      expect(toolOutput).toContain("test-package");
    }

    await result.cleanup();
  });
});
