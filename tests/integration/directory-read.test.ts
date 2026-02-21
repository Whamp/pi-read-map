import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import piReadMapExtension from "../../src/index.js";

// Mock the dependencies correctly
// eslint-disable-next-line jest/no-untyped-mock-factory
vi.mock("@mariozechner/pi-coding-agent", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@mariozechner/pi-coding-agent")>();
  return {
    ...actual,
    createReadTool: vi.fn(() => ({
      execute: vi.fn().mockImplementation(() => {
        // eslint-disable-next-line @factory/structured-logging
        throw new Error("EISDIR: illegal operation on a directory");
      }),
    })),
    createLsTool: vi.fn(() => ({
      execute: vi.fn().mockResolvedValue({
        toolName: "ls",
        toolCallId: "test-call-id",
        isError: false,
        content: [{ type: "text", text: "hello.ts\nworld.txt" }],
      }),
    })),
  };
});

describe("directory read handling", () => {
  const TEST_DIR = `/tmp/pi-read-map-dir-test/${Math.random().toString(16).slice(2, 10)}`;

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeFile(join(TEST_DIR, "hello.ts"), "hello");
    await writeFile(join(TEST_DIR, "world.txt"), "world");
    await mkdir(join(TEST_DIR, "subdir"));
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("throws with inline ls text on directory read", async () => {
    const mockPi = {
      registerTool: vi.fn(),
      on: vi.fn(),
    };

    piReadMapExtension(mockPi as never);

    const toolRegistration = mockPi.registerTool.mock.calls[0]?.[0];
    const executePromise = toolRegistration.execute("test-call-id", {
      path: TEST_DIR,
    });

    // Check we get a rejected promise containing the inline ls text
    await expect(executePromise).rejects.toThrow(/EISDIR/);
    await expect(executePromise).rejects.toThrow(/Fallback ls output/);
    await expect(executePromise).rejects.toThrow(/hello\.ts/);
    await expect(executePromise).rejects.toThrow(/world\.txt/);
  });
});
