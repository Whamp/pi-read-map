import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it, expect, afterAll, vi } from "vitest";

import piReadMapExtension from "../../src/index.js";

const TEMP_BASE = join(tmpdir(), "pi-read-map-dir-test");
const createdDirs = new Set<string>();

async function createTempDir(files?: Record<string, string>): Promise<string> {
  const dir = join(TEMP_BASE, randomUUID().slice(0, 8));
  await mkdir(dir, { recursive: true });
  createdDirs.add(dir);
  if (files) {
    for (const [name, content] of Object.entries(files)) {
      const filePath = join(dir, name);
      // Support nested dirs in file names
      await mkdir(join(filePath, ".."), { recursive: true });
      await writeFile(filePath, content);
    }
  }
  return dir;
}

afterAll(async () => {
  const dirs = [...createdDirs];
  createdDirs.clear();
  await Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true })));
});

function createMockPi() {
  return {
    registerTool: vi.fn(),
    on: vi.fn(),
    registerMessageRenderer: vi.fn(),
    sendMessage: vi.fn(),
  };
}

function getRegisteredTool(mockPi: ReturnType<typeof createMockPi>) {
  piReadMapExtension(mockPi as never);
  return mockPi.registerTool.mock.calls[0]?.[0];
}

describe("directory read handling", () => {
  it("returns ls output instead of EISDIR error", async () => {
    const dir = await createTempDir({
      "hello.ts": "export const x = 1;",
      "world.txt": "hello world",
    });

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);

    const result = await tool.execute("test-call-1", { path: dir });

    const text = result.content
      .filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("\n");

    expect(text).toContain("read was called on a directory, not a file");
    expect(text).toContain("Here is ls:");
    expect(text).toContain("hello.ts");
    expect(text).toContain("world.txt");
  });

  it("shows subdirectories with trailing slash", async () => {
    const dir = await createTempDir({
      "file.ts": "const a = 1;",
      "subdir/nested.ts": "const b = 2;",
    });

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);

    const result = await tool.execute("test-call-2", { path: dir });

    const text = result.content
      .filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("\n");

    expect(text).toContain("subdir/");
    expect(text).toContain("file.ts");
  });

  it("handles empty directories", async () => {
    const dir = await createTempDir();

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);

    const result = await tool.execute("test-call-3", { path: dir });

    const text = result.content
      .filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("\n");

    expect(text).toContain("read was called on a directory, not a file");
  });

  it("does not throw EISDIR", async () => {
    const dir = await createTempDir({ "a.txt": "content" });

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);

    // Should resolve, not reject
    await expect(
      tool.execute("test-call-4", { path: dir })
    ).resolves.toBeDefined();
  });
});
