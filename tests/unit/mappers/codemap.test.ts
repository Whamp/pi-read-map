import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { codemapMapper } from "../../../src/mappers/codemap.js";

describe("codemapMapper", () => {
  it("extracts symbols from TypeScript files", async () => {
    // Use the project's own mapper.ts as a test file
    const testFile = `${import.meta.dirname}/../../../src/mapper.ts`;
    const result = await codemapMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("TypeScript");
    expect(result?.symbols.length).toBeGreaterThan(0);

    // Should find the generateMap function
    const generateMap = result?.symbols.find((s) => s.name === "generateMap");
    expect(generateMap).toBeDefined();
    expect(generateMap?.kind).toBe(SymbolKind.Function);
  });

  it("extracts symbols from JavaScript files", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/js/module.js`;
    const result = await codemapMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("JavaScript");
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../../src/mapper.ts`;
    const result = await codemapMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await codemapMapper("/non/existent/file.ts");
    expect(result).toBeNull();
  });

  it("extracts modifiers correctly", async () => {
    const testFile = `${import.meta.dirname}/../../../src/mapper.ts`;
    const result = await codemapMapper(testFile);

    // generateMap should be exported and async
    const generateMap = result?.symbols.find((s) => s.name === "generateMap");
    expect(generateMap?.modifiers).toContain("export");
    expect(generateMap?.modifiers).toContain("async");
  });
});
