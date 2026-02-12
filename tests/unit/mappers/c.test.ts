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

  it("marks non-static functions as exported", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/exports.c`;
    const result = await cMapper(testFile);

    expect(result).not.toBeNull();

    const publicFunc = result?.symbols.find((s) => s.name === "public_func");
    expect(publicFunc?.isExported).toBe(true);
  });

  it("does not extract static functions (regex limitation)", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/exports.c`;
    const result = await cMapper(testFile);

    expect(result).not.toBeNull();

    // The C regex mapper cannot parse "static void func()" — the static
    // keyword breaks the two-token "returnType funcName(" pattern.
    // Verify no symbol named "private_helper" is extracted.
    const staticFunc = result?.symbols.find((s) => s.name === "private_helper");
    expect(staticFunc).toBeUndefined();
  });
});
