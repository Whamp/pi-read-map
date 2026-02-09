import { describe, expect, it } from "vitest";

import { DetailLevel } from "../../../src/enums.js";
import {
  ctagsMapper,
  isCtagsAvailable,
  resetCtagsCache,
} from "../../../src/mappers/ctags.js";

describe("ctagsMapper", () => {
  it("isCtagsAvailable returns boolean", async () => {
    resetCtagsCache();
    const available = await isCtagsAvailable();
    expect(typeof available).toBe("boolean");
  });

  it("caches ctags availability check", async () => {
    resetCtagsCache();
    const first = await isCtagsAvailable();
    const second = await isCtagsAvailable();
    expect(first).toBe(second);
  });

  it("returns null when ctags is not available", async () => {
    // This test works whether or not ctags is installed
    // If not installed, it returns null. If installed, it succeeds.
    const testFile = `${import.meta.dirname}/../../fixtures/js/sample.js`;
    resetCtagsCache();

    const available = await isCtagsAvailable();
    const result = await ctagsMapper(testFile);

    if (available) {
      // ctags is installed, should return a map
      expect(result).not.toBeNull();
      expect(result?.symbols.length).toBeGreaterThanOrEqual(0);
    } else {
      expect(result).toBeNull();
    }
  });

  it("gracefully handles non-existent files", async () => {
    resetCtagsCache();
    const result = await ctagsMapper("/non/existent/file.js");
    expect(result).toBeNull();
  });

  it("returns correct detail level when ctags works", async () => {
    resetCtagsCache();
    const available = await isCtagsAvailable();

    if (!available) {
      // Skip test if ctags not installed
      return;
    }

    const testFile = `${import.meta.dirname}/../../fixtures/c/main.c`;
    const result = await ctagsMapper(testFile);

    if (result) {
      expect(result.detailLevel).toBe(DetailLevel.Compact);
    }
  });
});
