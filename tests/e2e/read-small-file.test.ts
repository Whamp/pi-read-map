/**
 * E2E Test: Small File Passthrough
 *
 * Verifies that reading files within thresholds (≤2000 lines AND ≤50KB)
 * passes through unchanged without a structural map.
 *
 * These tests verify the ACTUAL TOOL OUTPUT, not LLM summaries.
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

describe("e2e: read small file", () => {
  const projectRoot = getProjectRoot();
  const smallFixture = join(projectRoot, "tests/fixtures/small/hello.py");

  afterEach(async () => {
    await waitBriefly();
  });

  afterAll(async () => {
    await cleanupE2ETempFiles();
  });

  it("passes small files through without a map", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${smallFixture}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should NOT contain map markers
      expect(hasFileMap(toolOutput)).toBe(false);
      expect(toolOutput).not.toContain(FILE_MAP_DELIMITER);
      expect(toolOutput).not.toContain("File Map:");
    }

    await result.cleanup();
  });

  it("includes full file content for small files", async () => {
    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${smallFixture}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // The hello.py fixture contains specific content
      expect(toolOutput).toContain("def hello()");
      expect(toolOutput).toContain("class Greeter");
      expect(toolOutput).toContain("Hello, World!");

      // Should not have truncation notice
      expect(toolOutput).not.toContain("[Truncated:");
    }

    await result.cleanup();
  });

  it("handles generated small file correctly", async () => {
    const content = `
# Small Python file
def greet(name: str) -> str:
    """Return a greeting."""
    return f"Hello, {name}!"

class Calculator:
    """Simple calculator."""
    
    def add(self, a: int, b: int) -> int:
        return a + b
    
    def subtract(self, a: int, b: int) -> int:
        return a - b

if __name__ == "__main__":
    print(greet("World"))
`;

    const tempFile = await createTempFile("small_test.py", content);

    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${tempFile}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should NOT have a file map
      expect(hasFileMap(toolOutput)).toBe(false);

      // Should contain the actual content
      expect(toolOutput).toContain("def greet");
      expect(toolOutput).toContain("class Calculator");
    }

    await result.cleanup();
  });

  it("handles file just under threshold", async () => {
    // Create a file with exactly 1999 lines (just under 2000 threshold)
    const lines: string[] = ["# File with 1999 lines"];
    for (let i = 1; i < 1999; i++) {
      lines.push(`line_${i} = ${i}`);
    }
    const content = lines.join("\n");

    const tempFile = await createTempFile("just_under_threshold.py", content);

    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${tempFile}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    expect(toolOutput).not.toBeNull();

    if (toolOutput) {
      // Should NOT have a file map (just under threshold)
      expect(hasFileMap(toolOutput)).toBe(false);
    }

    await result.cleanup();
  });

  it("handles empty file", async () => {
    const tempFile = await createTempFile("empty.py", "");

    const result = await runPiSession({
      ...MODEL_CONFIG,
      prompt: `Use the read tool to read "${tempFile}"`,
      timeout: 60_000,
    });

    const toolOutput = result.getToolOutput();
    // Empty file may return empty string or null
    // The key is it should NOT have a file map
    if (toolOutput) {
      expect(hasFileMap(toolOutput)).toBe(false);
    }

    await result.cleanup();
  });
});
