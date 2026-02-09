/**
 * E2E Test: Offset/Limit Reads Passthrough
 *
 * Verifies that targeted reads (with offset or limit parameters) pass through
 * unchanged, even for large files that would normally get mapped.
 *
 * These tests verify the ACTUAL TOOL OUTPUT, not LLM summaries.
 */

import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import {
  cleanupE2ETempFiles,
  createTempFile,
  getProjectRoot,
  hasFileMap,
  runPiSession,
  waitBriefly,
} from "../helpers/pi-runner.js";

describe("e2e: read with offset/limit", () => {
  const projectRoot = getProjectRoot();
  const largeFixture = join(projectRoot, "tests/fixtures/large/processor.py");

  afterEach(async () => {
    await waitBriefly();
  });

  afterAll(async () => {
    await cleanupE2ETempFiles();
  });

  it("passes through with offset parameter (no map)", async () => {
    const result = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}" starting at offset 100`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Targeted reads should NOT get a map
      expect(hasFileMap(toolOutput)).toBe(false);
    }

    await result.cleanup();
  });

  it("passes through with limit parameter (no map)", async () => {
    const result = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}" with a limit of 50 lines`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Targeted reads should NOT get a map
      expect(hasFileMap(toolOutput)).toBe(false);
    }

    await result.cleanup();
  });

  it("passes through with both offset and limit (no map)", async () => {
    const result = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}" from offset 200 with limit 100`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Targeted reads should NOT get a map
      expect(hasFileMap(toolOutput)).toBe(false);
    }

    await result.cleanup();
  });

  it("returns content for targeted read on large file", async () => {
    // Create a predictable file for testing offset behavior
    const lines: string[] = [];
    for (let i = 1; i <= 3000; i++) {
      lines.push(`LINE_${i}_CONTENT`);
    }
    const content = lines.join("\n");

    const tempFile = await createTempFile("offset_test.txt", content);

    const result = await runPiSession({
      prompt: `Use the read tool to read "${tempFile}" starting at line 100 with limit 10`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should NOT have a file map for targeted read
      expect(hasFileMap(toolOutput)).toBe(false);
    }

    await result.cleanup();
  });

  it("handles offset on generated large file", async () => {
    // Generate a large file
    const lines: string[] = ["# Large file for offset testing"];
    for (let i = 0; i < 1000; i++) {
      lines.push(`def func_${i}():`);
      lines.push(`    return ${i}`);
      lines.push("");
    }
    const content = lines.join("\n");

    const tempFile = await createTempFile("offset_large.py", content);

    const result = await runPiSession({
      prompt: `Use the read tool to read "${tempFile}" with offset=500 and limit=50`,
      timeout: 90_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Targeted reads should NOT get a map even for large files
      expect(hasFileMap(toolOutput)).toBe(false);
    }

    await result.cleanup();
  });

  it("sequential offset reads do not produce maps", async () => {
    // Simulate the "sequential reading" pattern the extension aims to improve
    // Each offset read should NOT produce a map

    const result1 = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}" with offset 1 and limit 100`,
      timeout: 90_000,
    });
    const output1 = result1.getToolOutput();
    expect(output1).not.toBeNull();
    if (output1) {
      expect(hasFileMap(output1)).toBe(false);
    }
    await result1.cleanup();

    const result2 = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}" with offset 101 and limit 100`,
      timeout: 90_000,
    });
    const output2 = result2.getToolOutput();
    expect(output2).not.toBeNull();
    if (output2) {
      expect(hasFileMap(output2)).toBe(false);
    }
    await result2.cleanup();

    const result3 = await runPiSession({
      prompt: `Use the read tool to read "${largeFixture}" with offset 201 and limit 100`,
      timeout: 90_000,
    });
    const output3 = result3.getToolOutput();
    expect(output3).not.toBeNull();
    if (output3) {
      expect(hasFileMap(output3)).toBe(false);
    }
    await result3.cleanup();
  });
});
