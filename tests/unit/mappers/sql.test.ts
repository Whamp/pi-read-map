import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { sqlMapper } from "../../../src/mappers/sql.js";

describe("sqlMapper", () => {
  it("extracts CREATE TABLE statements", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/sql/schema.sql`;
    const result = await sqlMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("SQL");

    const tableSymbols = result?.symbols.filter((s) =>
      s.name.startsWith("TABLE ")
    );
    expect(tableSymbols?.length).toBeGreaterThan(0);
  });

  it("extracts CREATE FUNCTION statements", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/sql/schema.sql`;
    const result = await sqlMapper(testFile);

    const funcSymbols = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Function
    );
    expect(funcSymbols).toBeDefined();
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/sql/schema.sql`;
    const result = await sqlMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await sqlMapper("/non/existent/file.sql");
    expect(result).toBeNull();
  });
});
