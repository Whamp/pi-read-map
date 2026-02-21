import { describe, it, expect, vi, beforeEach } from "vitest";

import piReadMapExtension, { resetMapCache } from "../../src/index.js";

// Mock the built-in dependencies used by index.ts
// eslint-disable-next-line jest/no-untyped-mock-factory
vi.mock("@mariozechner/pi-coding-agent", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@mariozechner/pi-coding-agent")>();
  return {
    ...actual,
    createReadTool: vi.fn(() => ({
      execute: vi.fn().mockResolvedValue({
        toolName: "read",
        toolCallId: "test-call-id",
        isError: false,
        content: [{ type: "text", text: "Mocked original content" }],
      }),
    })),
    createLsTool: vi.fn(),
  };
});

// Mock fs to simulate a large file
// eslint-disable-next-line jest/no-untyped-mock-factory
// eslint-disable-next-line jest/no-untyped-mock-factory
vi.mock("node:fs/promises", () => ({
  stat: vi.fn().mockResolvedValue({
    isFile: () => true,
    isDirectory: () => false,
    size: 100_000,
    mtimeMs: 12_345,
  }),
}));

// Mock the mapper so we don't have to parse a real file
// eslint-disable-next-line jest/no-untyped-mock-factory
vi.mock("../../src/mapper.js", () => ({
  generateMap: vi.fn().mockResolvedValue({
    symbols: [{ name: "TestSymbol", kind: "Class", startLine: 1, endLine: 10 }],
    language: "TypeScript",
    imports: [],
  }),
  shouldGenerateMap: vi.fn().mockReturnValue(true),
}));

// Mock the formatter
// eslint-disable-next-line jest/no-untyped-mock-factory
vi.mock("../../src/formatter.js", () => ({
  formatFileMapWithBudget: vi
    .fn()
    .mockReturnValue("File Map: Mocked Map Content"),
}));

// eslint-disable-next-line jest/no-untyped-mock-factory
vi.mock("node:util", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:util")>();
  return {
    ...actual,
    promisify: vi.fn(() => vi.fn().mockResolvedValue({ stdout: "3000\n" })),
  };
});

describe("inline map generation", () => {
  beforeEach(() => {
    resetMapCache();
    vi.clearAllMocks();
  });

  it("appends the generated map string to the tool result content", async () => {
    const mockPi = {
      registerTool: vi.fn(),
      on: vi.fn(), // Should not be called
      registerMessageRenderer: vi.fn(), // Should not be called
      sendMessage: vi.fn(), // Should not be called
    };

    piReadMapExtension(mockPi as never);

    // Get the registered read tool
    const registeredTool = mockPi.registerTool.mock.calls.find(
      (call) => call[0]?.name === "read"
    )?.[0];
    expect(registeredTool).toBeDefined();

    // Execute the tool
    const result = await registeredTool.execute("test-call-id", {
      path: "/test/fake-large-file.ts",
    });

    // Verify it didn't try to send a custom message
    expect(mockPi.sendMessage).not.toHaveBeenCalled();

    // Verify the tool result contains both original content and the map
    expect(result.content).toHaveLength(2);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("Mocked original content");

    expect(result.content[1].type).toBe("text");
    expect(result.content[1].text).toBe("File Map: Mocked Map Content");
  });
});
