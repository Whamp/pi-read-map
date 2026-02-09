import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { jsonlMapper } from "../../../src/mappers/jsonl.js";

describe("jsonlMapper", () => {
  it("extracts schema from JSON Lines file", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/jsonl/events.jsonl`;
    const result = await jsonlMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("JSON Lines");
    expect(result?.symbols.length).toBeGreaterThan(0);

    // First symbol should be schema info
    const schemaSymbol = result?.symbols[0];
    expect(schemaSymbol?.kind).toBe(SymbolKind.Class);
    expect(schemaSymbol?.name).toContain("Schema:");
  });

  it("samples first few lines", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/jsonl/events.jsonl`;
    const result = await jsonlMapper(testFile);

    // Should have schema + samples + "more" indicator
    expect(result?.symbols.length).toBeGreaterThan(1);

    // Check for line samples
    const lineSamples = result?.symbols.filter((s) =>
      s.name.startsWith("Line ")
    );
    expect(lineSamples?.length).toBeGreaterThan(0);
  });

  it("returns correct line count", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/jsonl/events.jsonl`;
    const result = await jsonlMapper(testFile);

    expect(result?.totalLines).toBe(100);
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/jsonl/events.jsonl`;
    const result = await jsonlMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await jsonlMapper("/non/existent/file.jsonl");
    expect(result).toBeNull();
  });

  it("handles empty JSONL file", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/jsonl/empty.jsonl`;
    const result = await jsonlMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.totalLines).toBe(0);
    expect(result?.symbols.length).toBe(0);
  });

  it("handles arrays as root elements", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/jsonl/arrays.jsonl`;
    const result = await jsonlMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.symbols[0]?.name).toContain("array");
  });
});
