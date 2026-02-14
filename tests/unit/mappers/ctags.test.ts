import { describe, expect, it } from "vitest";

import { DetailLevel } from "../../../src/enums.js";
import {
  ctagsMapper,
  isCtagsAvailable,
  resetCtagsCache,
} from "../../../src/mappers/ctags.js";

describe("ctagsMapper", () => {
  it("ctags is available", async () => {
    resetCtagsCache();
    const available = await isCtagsAvailable();
    expect(available).toBe(true);
  });

  it("caches ctags availability check", async () => {
    resetCtagsCache();
    const first = await isCtagsAvailable();
    const second = await isCtagsAvailable();
    expect(first).toBe(second);
  });

  it("returns a map for a known file", async () => {
    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    resetCtagsCache();

    const result = await ctagsMapper(testFile);
    expect(result).not.toBeNull();
    expect(result?.symbols.length).toBeGreaterThan(0);
  });

  it("gracefully handles non-existent files", async () => {
    resetCtagsCache();
    const result = await ctagsMapper("/non/existent/file.js");
    expect(result).toBeNull();
  });

  it("returns correct detail level", async () => {
    resetCtagsCache();

    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    const result = await ctagsMapper(testFile);
    expect(result).not.toBeNull();
    expect(result?.detailLevel).toBe(DetailLevel.Compact);
  });
});
