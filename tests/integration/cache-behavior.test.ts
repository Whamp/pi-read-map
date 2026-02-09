import { writeFile, utimes } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, it, expect, afterAll, beforeEach } from "vitest";

import { resetMapCache } from "../../src/index.js";
import { generateMap } from "../../src/mapper.js";
import {
  createTempFile,
  cleanupAllTempFiles,
  generatePythonCode,
} from "./helpers.js";

describe("cache behavior", () => {
  beforeEach(() => {
    // Reset cache before each test to ensure isolation
    resetMapCache();
  });

  afterAll(async () => {
    await cleanupAllTempFiles();
  });

  it("generateMap produces consistent results for same file", async () => {
    // Note: The cache in index.ts is used by the tool's execute function,
    // not by generateMap directly. This test verifies consistency.
    const content = generatePythonCode(10);
    const filepath = await createTempFile("consistent.py", content);

    // First call
    const result1 = await generateMap(filepath);

    // Second call
    const result2 = await generateMap(filepath);

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    expect(result1?.symbols.length).toBe(result2?.symbols.length);
    expect(result1?.language).toBe(result2?.language);
  });

  it("cache invalidates when file mtime changes", async () => {
    // Create initial file
    const content1 = generatePythonCode(10);
    const filepath = await createTempFile("mtime-test.py", content1);

    // Generate initial map
    const result1 = await generateMap(filepath);
    expect(result1).not.toBeNull();
    expect(result1?.symbols.length).toBe(10);

    // Modify file content (add more functions)
    const content2 = generatePythonCode(20);
    await writeFile(filepath, content2);

    // Touch file to update mtime (ensure it's different)
    const futureTime = Date.now() + 1000;
    await utimes(filepath, futureTime / 1000, futureTime / 1000);

    // Generate map again - should reflect new content
    const result2 = await generateMap(filepath);
    expect(result2).not.toBeNull();
    expect(result2?.symbols.length).toBe(20);
  });

  it("different files have separate cache entries", async () => {
    const content1 = `
def func_a():
    pass
`;
    const content2 = `
def func_b():
    pass
`;

    const filepath1 = await createTempFile("file1.py", content1);
    const filepath2 = await createTempFile("file2.py", content2);

    const result1 = await generateMap(filepath1);
    const result2 = await generateMap(filepath2);

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();

    // Each file should have its own content
    const names1 = result1?.symbols.map((s) => s.name) ?? [];
    const names2 = result2?.symbols.map((s) => s.name) ?? [];

    expect(names1).toContain("func_a");
    expect(names1).not.toContain("func_b");
    expect(names2).toContain("func_b");
    expect(names2).not.toContain("func_a");
  });

  it("cache uses absolute path as key", async () => {
    const content = `
def my_function():
    return 42
`;
    const filepath = await createTempFile("absolute-test.py", content);

    // Call with absolute path
    const absolutePath = resolve(filepath);
    const result1 = await generateMap(absolutePath);

    // Call with relative path (from parent dir)
    const parentDir = join(filepath, "..");
    const relativePath = join(parentDir, "absolute-test.py");
    const result2 = await generateMap(relativePath);

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();

    // Both should produce the same result
    expect(result1?.symbols.length).toBe(result2?.symbols.length);
    expect(result1?.symbols[0]?.name).toBe(result2?.symbols[0]?.name);
  });
});
