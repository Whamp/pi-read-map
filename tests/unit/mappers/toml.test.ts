import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { tomlMapper } from "../../../src/mappers/toml.js";

describe("tomlMapper", () => {
  it("extracts sections with line numbers", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/toml/config.toml`;
    const result = await tomlMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("TOML");

    const sectionNames = result?.symbols.map((s) => s.name);
    expect(sectionNames).toContain("[package]");
    expect(sectionNames).toContain("[dependencies]");
    expect(sectionNames).toContain("[build]");
  });

  it("extracts array sections [[name]]", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/toml/config.toml`;
    const result = await tomlMapper(testFile);

    const arraySections = result?.symbols.filter((s) =>
      s.name.startsWith("[[")
    );
    expect(arraySections?.length).toBeGreaterThan(0);
    expect(arraySections?.map((s) => s.name)).toContain("[[bin]]");
  });

  it("includes keys as children of sections", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/toml/config.toml`;
    const result = await tomlMapper(testFile);

    const packageSection = result?.symbols.find((s) => s.name === "[package]");
    expect(packageSection?.children).toBeDefined();
    expect(packageSection?.children?.some((c) => c.name === "authors")).toBe(
      true
    );
  });

  it("returns correct SymbolKind for sections", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/toml/config.toml`;
    const result = await tomlMapper(testFile);

    // Regular sections are Class
    const packageSection = result?.symbols.find((s) => s.name === "[package]");
    expect(packageSection?.kind).toBe(SymbolKind.Class);

    // Array sections are Variable
    const binSection = result?.symbols.find((s) => s.name === "[[bin]]");
    expect(binSection?.kind).toBe(SymbolKind.Variable);
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/toml/config.toml`;
    const result = await tomlMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await tomlMapper("/non/existent/file.toml");
    expect(result).toBeNull();
  });
});
