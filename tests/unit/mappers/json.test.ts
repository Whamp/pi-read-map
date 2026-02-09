import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { jsonMapper } from "../../../src/mappers/json.js";

describe("jsonMapper", () => {
  it("extracts top-level keys from JSON", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/json/config.json`;
    const result = await jsonMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("JSON");
    expect(result?.symbols.length).toBeGreaterThan(0);
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/json/config.json`;
    const result = await jsonMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await jsonMapper("/non/existent/file.json");
    expect(result).toBeNull();
  });

  it("handles nested objects", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/json/nested.json`;
    const result = await jsonMapper(testFile);

    expect(result).not.toBeNull();
    // Nested objects are represented as variables with {...} type
    const varSymbols = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Variable
    );
    expect(varSymbols?.length).toBeGreaterThan(0);
  });
});
