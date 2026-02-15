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

function getToolResultHandler(mockPi: ReturnType<typeof createMockPi>) {
  const onCalls = mockPi.on.mock.calls;
  const toolResultCall = onCalls.find((call) => call[0] === "tool_result");
  return toolResultCall?.[1] as (
    event: { toolName: string; toolCallId: string },
    ctx: unknown
  ) => void;
}

describe("directory read handling", () => {
  afterAll(async () => {
    const dirs = [...createdDirs];
    createdDirs.clear();
    await Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true })));
  });

  it("throws EISDIR error when reading a directory", async () => {
    const dir = await createTempDir({
      "hello.ts": "export const x = 1;",
      "world.txt": "hello world",
    });

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);

    await expect(tool.execute("test-call-1", { path: dir })).rejects.toThrow(
      "EISDIR"
    );
  });

  it("sends directory listing as separate message after error", async () => {
    const dir = await createTempDir({
      "hello.ts": "export const x = 1;",
      "world.txt": "hello world",
    });

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);
    const handler = getToolResultHandler(mockPi);

    // The read call should fail
    try {
      await tool.execute("test-call-2", { path: dir });
    } catch {
      // expected
    }

    // Simulate tool_result event firing after the error
    handler({ toolName: "read", toolCallId: "test-call-2" }, {});

    // Should have sent a directory-listing message
    expect(mockPi.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        customType: "directory-listing",
      }),
      { deliverAs: "followUp" }
    );

    const message = mockPi.sendMessage.mock.calls[0]?.[0];
    expect(message.content).toContain("is a directory");
    expect(message.content).toContain("hello.ts");
    expect(message.content).toContain("world.txt");
  });

  it("shows subdirectories with trailing slash in listing", async () => {
    const dir = await createTempDir({
      "file.ts": "const a = 1;",
      "subdir/nested.ts": "const b = 2;",
    });

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);
    const handler = getToolResultHandler(mockPi);

    try {
      await tool.execute("test-call-3", { path: dir });
    } catch {
      // expected
    }

    handler({ toolName: "read", toolCallId: "test-call-3" }, {});

    const message = mockPi.sendMessage.mock.calls[0]?.[0];
    expect(message.content).toContain("subdir/");
    expect(message.content).toContain("file.ts");
  });

  it("handles empty directories", async () => {
    const dir = await createTempDir();

    const mockPi = createMockPi();
    const tool = getRegisteredTool(mockPi);
    const handler = getToolResultHandler(mockPi);

    try {
      await tool.execute("test-call-4", { path: dir });
    } catch {
      // expected
    }

    handler({ toolName: "read", toolCallId: "test-call-4" }, {});

    const message = mockPi.sendMessage.mock.calls[0]?.[0];
    expect(message.content).toContain("is a directory");
  });
});
