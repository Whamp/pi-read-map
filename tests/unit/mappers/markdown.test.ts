import { writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SymbolKind } from "../../../src/enums.js";
import { markdownMapper } from "../../../src/mappers/markdown.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");
const TMP_DIR = join(FIXTURES_DIR, "tmp");

describe("markdownMapper", () => {
  it("extracts headings from markdown files", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "test.md");
    await writeFile(
      filePath,
      `# Heading 1
Some content

## Heading 2
More content

### Heading 3
Even more content
`
    );

    try {
      const result = await markdownMapper(filePath);

      expect(result).not.toBeNull();
      expect(result?.language).toBe("Markdown");
      expect(result?.symbols.length).toBe(1); // Only top-level heading

      const h1 = result?.symbols[0];
      expect(h1?.name).toBe("Heading 1");
      expect(h1?.kind).toBe(SymbolKind.Class);
      expect(h1?.children?.length).toBe(1);

      const h2 = h1?.children?.[0];
      expect(h2?.name).toBe("Heading 2");
      expect(h2?.children?.length).toBe(1);

      const h3 = h2?.children?.[0];
      expect(h3?.name).toBe("Heading 3");
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("returns null for files with no headings", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "no-headings.md");
    await writeFile(filePath, "Just some text without headings\n");

    try {
      const result = await markdownMapper(filePath);
      expect(result).toBeNull();
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("returns null for non-existent files", async () => {
    const result = await markdownMapper("/non/existent/file.md");
    expect(result).toBeNull();
  });

  it("handles multiple top-level headings", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "multi.md");
    await writeFile(
      filePath,
      `# Section 1
Content

# Section 2
Content
`
    );

    try {
      const result = await markdownMapper(filePath);

      expect(result).not.toBeNull();
      expect(result?.symbols.length).toBe(2);
      expect(result?.symbols[0]?.name).toBe("Section 1");
      expect(result?.symbols[1]?.name).toBe("Section 2");
    } finally {
      await rm(filePath, { force: true });
    }
  });
});
