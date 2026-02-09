import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SymbolKind } from "../../../src/enums.js";
import { typescriptMapper } from "../../../src/mappers/typescript.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");

describe("typescriptMapper", () => {
  it("extracts symbols from TypeScript files", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("TypeScript");
    expect(result?.symbols.length).toBeGreaterThan(0);
  });

  it("extracts classes with methods", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const classSymbol = result?.symbols.find(
      (s) => s.kind === SymbolKind.Class
    );
    expect(classSymbol).toBeDefined();
  });

  it("extracts functions", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const funcSymbol = result?.symbols.find(
      (s) => s.kind === SymbolKind.Function
    );
    expect(funcSymbol).toBeDefined();
  });

  it("returns null for non-existent files", async () => {
    const result = await typescriptMapper("/non/existent/file.ts");
    expect(result).toBeNull();
  });

  it("handles JavaScript files", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.js");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("JavaScript");
  });
});
