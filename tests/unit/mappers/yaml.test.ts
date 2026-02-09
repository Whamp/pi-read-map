import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { yamlMapper } from "../../../src/mappers/yaml.js";

describe("yamlMapper", () => {
  it("extracts top-level keys with line numbers", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/yaml/config.yaml`;
    const result = await yamlMapper(testFile);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("YAML");

    const topLevelNames = result?.symbols.map((s) => s.name);
    expect(topLevelNames).toContain("name");
    expect(topLevelNames).toContain("dependencies");
    expect(topLevelNames).toContain("scripts");
    expect(topLevelNames).toContain("config");
  });

  it("includes nested keys as children", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/yaml/config.yaml`;
    const result = await yamlMapper(testFile);

    const dependencies = result?.symbols.find((s) => s.name === "dependencies");
    expect(dependencies?.children).toBeDefined();
    expect(dependencies?.children?.length).toBeGreaterThan(0);
  });

  it("assigns correct SymbolKind to keys", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/yaml/config.yaml`;
    const result = await yamlMapper(testFile);

    const propertySymbols = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Property
    );
    expect(propertySymbols?.length).toBeGreaterThan(0);
  });

  it("returns correct detail level", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/yaml/config.yaml`;
    const result = await yamlMapper(testFile);

    expect(result?.detailLevel).toBe(DetailLevel.Full);
  });

  it("returns null for non-existent files", async () => {
    const result = await yamlMapper("/non/existent/file.yaml");
    expect(result).toBeNull();
  });
});
