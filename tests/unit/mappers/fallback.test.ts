import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

import { fallbackMapper } from "../../../src/mappers/fallback.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");

describe("fallbackMapper", () => {
  it("extracts symbols using grep patterns", async () => {
    const filePath = join(FIXTURES_DIR, "small/hello.py");
    const result = await fallbackMapper(filePath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("Python");

    // Should find some symbols via grep
    const symbols = result?.symbols ?? [];
    // Grep should find "def hello" and "class Greeter"
    const defSymbols = symbols.filter((s) => s.kind === "function");
    const classSymbols = symbols.filter((s) => s.kind === "class");

    expect(defSymbols.length + classSymbols.length).toBeGreaterThan(0);
  });

  it("handles files with no recognizable patterns", async () => {
    const tempDir = join(FIXTURES_DIR, "temp");
    const tempFile = join(tempDir, "no-patterns.txt");

    await mkdir(tempDir, { recursive: true });
    await writeFile(tempFile, "Just some text\nWith no patterns\nTo match\n");

    try {
      const result = await fallbackMapper(tempFile);

      expect(result).not.toBeNull();
      expect(result?.symbols).toEqual([]);
      expect(result?.totalLines).toBe(3);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("includes line numbers for symbols", async () => {
    const filePath = join(FIXTURES_DIR, "small/hello.py");
    const result = await fallbackMapper(filePath);

    for (const symbol of result?.symbols ?? []) {
      expect(symbol.startLine).toBeGreaterThan(0);
      expect(symbol.endLine).toBeGreaterThanOrEqual(symbol.startLine);
    }
  });

  it("returns null for non-existent files", async () => {
    const result = await fallbackMapper("/non/existent/file.txt");
    expect(result).toBeNull();
  });

  it("sets detail level to minimal", async () => {
    const filePath = join(FIXTURES_DIR, "small/hello.py");
    const result = await fallbackMapper(filePath);

    expect(result?.detailLevel).toBe("minimal");
  });
});
