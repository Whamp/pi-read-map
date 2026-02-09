import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { goMapper } from "../../../src/mappers/go.js";

describe("goMapper", () => {
  it("extracts symbols from Go files", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/go/main.go`;
    const result = await goMapper(testFile);

    // May be null if Go is not installed
    if (result === null) {
      console.log(
        "Skipping Go mapper test: Go not installed or binary not compiled"
      );
      return;
    }

    expect(result.language).toBe("Go");
    expect(result.symbols.length).toBeGreaterThan(0);
  });

  it("extracts structs correctly", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/go/main.go`;
    const result = await goMapper(testFile);

    if (result === null) {
      return;
    }

    const structSymbols = result.symbols.filter(
      (s) => s.kind === SymbolKind.Class
    );
    expect(structSymbols.length).toBeGreaterThan(0);
  });

  it("extracts functions correctly", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/go/main.go`;
    const result = await goMapper(testFile);

    if (result === null) {
      return;
    }

    const funcSymbols = result.symbols.filter(
      (s) => s.kind === SymbolKind.Function
    );
    expect(funcSymbols.length).toBeGreaterThan(0);
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/go/main.go`;
    const result = await goMapper(testFile);

    if (result === null) {
      return;
    }

    expect(result.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await goMapper("/non/existent/file.go");
    expect(result).toBeNull();
  });

  it("extracts imports", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/go/main.go`;
    const result = await goMapper(testFile);

    if (result === null) {
      return;
    }

    expect(result.imports).toBeDefined();
    expect(result.imports?.length).toBeGreaterThan(0);
  });
});
