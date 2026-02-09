import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { cMapper } from "../../../src/mappers/c.js";

describe("cMapper", () => {
  it("extracts functions from C files", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    const result = await cMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("C");

    const funcSymbols = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Function
    );
    expect(funcSymbols?.length).toBeGreaterThan(0);
  });

  it("extracts structs correctly", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    const result = await cMapper(testFile);

    const structSymbols = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Class
    );
    expect(structSymbols?.length).toBeGreaterThan(0);
  });

  it("extracts #define macros", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    const result = await cMapper(testFile);

    const constSymbols = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Constant
    );
    expect(constSymbols?.length).toBeGreaterThan(0);
  });

  it("extracts enums correctly", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    const result = await cMapper(testFile);

    const enumSymbols = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Enum
    );
    expect(enumSymbols?.length).toBeGreaterThan(0);
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    const result = await cMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await cMapper("/non/existent/file.c");
    expect(result).toBeNull();
  });
});
