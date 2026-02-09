import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { csvMapper } from "../../../src/mappers/csv.js";

describe("csvMapper", () => {
  it("extracts headers and row count from CSV", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/csv/data.csv`;
    const result = await csvMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("CSV");

    // Should have summary symbol
    const summary = result?.symbols.find((s) => s.kind === SymbolKind.Table);
    expect(summary?.name).toContain("5 rows");
    expect(summary?.name).toContain("5 columns");
  });

  it("extracts column names from headers", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/csv/data.csv`;
    const result = await csvMapper(testFile);

    const columnNames = result?.symbols
      .filter((s) => s.kind === SymbolKind.Property)
      .map((s) => s.name);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("email");
    expect(columnNames).toContain("department");
    expect(columnNames).toContain("salary");
  });

  it("includes sample data row", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/csv/data.csv`;
    const result = await csvMapper(testFile);

    const sample = result?.symbols.find((s) => s.name.startsWith("Sample:"));
    expect(sample).toBeDefined();
    expect(sample?.name).toContain("Alice");
  });

  it("handles TSV files correctly", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/csv/data.tsv`;
    const result = await csvMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("TSV");

    const summary = result?.symbols.find((s) => s.kind === SymbolKind.Table);
    expect(summary?.name).toContain("3 rows");
    expect(summary?.name).toContain("4 columns");
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/csv/data.csv`;
    const result = await csvMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await csvMapper("/non/existent/file.csv");
    expect(result).toBeNull();
  });
});
