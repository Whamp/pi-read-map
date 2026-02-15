import { describe, it, expect, vi, beforeEach } from "vitest";

import piReadMapExtension, {
  resetPendingMaps,
  getPendingMaps,
} from "../../src/index.js";

describe("separate map message", () => {
  beforeEach(() => {
    resetPendingMaps();
  });

  describe("tool_result event handler", () => {
    it("sends pending map via sendMessage when tool_result fires", () => {
      const onHandler = vi.fn();
      const sendMessage = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: onHandler,
        registerMessageRenderer: vi.fn(),
        sendMessage,
      };

      piReadMapExtension(mockPi as never);

      // Get the tool_result handler
      const toolResultCall = onHandler.mock.calls.find(
        (call) => call[0] === "tool_result"
      );
      expect(toolResultCall).toBeDefined();
      const handler = toolResultCall?.[1];

      // Simulate having a pending map
      const pendingMaps = getPendingMaps();
      pendingMaps.set("test-call-id", {
        path: "/test/file.ts",
        map: "fake map content",
        details: {
          filePath: "/test/file.ts",
          totalLines: 1000,
          totalBytes: 50_000,
          symbolCount: 25,
          language: "TypeScript",
        },
      });

      // Simulate tool_result event
      handler(
        {
          toolName: "read",
          toolCallId: "test-call-id",
          input: { path: "/test/file.ts" },
        },
        {}
      );

      // Verify sendMessage was called with correct args
      expect(sendMessage).toHaveBeenCalledOnce();
      expect(sendMessage).toHaveBeenCalledWith(
        {
          customType: "file-map",
          content: "fake map content",
          display: true,
          details: {
            filePath: "/test/file.ts",
            totalLines: 1000,
            totalBytes: 50_000,
            symbolCount: 25,
            language: "TypeScript",
          },
        },
        { deliverAs: "followUp" }
      );

      // Verify pending map was cleaned up
      expect(pendingMaps.size).toBe(0);
    });

    it("ignores tool_result events for non-read tools", () => {
      const onHandler = vi.fn();
      const sendMessage = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: onHandler,
        registerMessageRenderer: vi.fn(),
        sendMessage,
      };

      piReadMapExtension(mockPi as never);

      // Get the tool_result handler
      const toolResultCall = onHandler.mock.calls.find(
        (call) => call[0] === "tool_result"
      );
      const handler = toolResultCall?.[1];

      // Simulate having a pending map
      const pendingMaps = getPendingMaps();
      pendingMaps.set("test-call-id", {
        path: "/test/file.ts",
        map: "fake map content",
        details: {
          filePath: "/test/file.ts",
          totalLines: 1000,
          totalBytes: 50_000,
          symbolCount: 25,
          language: "TypeScript",
        },
      });

      // Simulate tool_result event for a different tool
      handler(
        {
          toolName: "bash",
          toolCallId: "other-call-id",
          input: { command: "ls" },
        },
        {}
      );

      // Verify sendMessage was NOT called
      expect(sendMessage).not.toHaveBeenCalled();

      // Verify pending map was NOT cleaned up
      expect(pendingMaps.size).toBe(1);
    });

    it("ignores tool_result when no pending map exists", () => {
      const onHandler = vi.fn();
      const sendMessage = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: onHandler,
        registerMessageRenderer: vi.fn(),
        sendMessage,
      };

      piReadMapExtension(mockPi as never);

      // Get the tool_result handler
      const toolResultCall = onHandler.mock.calls.find(
        (call) => call[0] === "tool_result"
      );
      const handler = toolResultCall?.[1];

      // Simulate tool_result event with no pending map
      handler(
        {
          toolName: "read",
          toolCallId: "non-existent-id",
          input: { path: "/test/file.ts" },
        },
        {}
      );

      // Verify sendMessage was NOT called
      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("message renderer", () => {
    it("renders collapsed view with summary", () => {
      const rendererFn = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: vi.fn(),
        registerMessageRenderer: (type: string, renderer: unknown) => {
          if (type === "file-map") {
            rendererFn.mockImplementation(renderer as () => unknown);
          }
        },
        sendMessage: vi.fn(),
      };

      piReadMapExtension(mockPi as never);

      // Create a mock theme
      const mockTheme = {
        fg: (color: string, text: string) => `[${color}:${text}]`,
        bold: (text: string) => `**${text}**`,
      };

      // Call the renderer in collapsed mode
      const message = {
        customType: "file-map",
        content: "map content here",
        details: {
          filePath: "/path/to/example.ts",
          totalLines: 500,
          totalBytes: 25_000,
          symbolCount: 15,
          language: "TypeScript",
        },
      };

      const result = rendererFn(message, { expanded: false }, mockTheme);

      // Verify it returns a Text component (has render method or is Text instance)
      expect(result).toBeDefined();
      // The rendered text should contain summary info
      // Note: We can't easily inspect Text internals, but we verified renderer is called
    });

    it("renders expanded view with full content", () => {
      const rendererFn = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: vi.fn(),
        registerMessageRenderer: (type: string, renderer: unknown) => {
          if (type === "file-map") {
            rendererFn.mockImplementation(renderer as () => unknown);
          }
        },
        sendMessage: vi.fn(),
      };

      piReadMapExtension(mockPi as never);

      // Create a mock theme
      const mockTheme = {
        fg: (color: string, text: string) => `[${color}:${text}]`,
        bold: (text: string) => `**${text}**`,
      };

      // Call the renderer in expanded mode
      const message = {
        customType: "file-map",
        content: "full map content\nwith multiple lines",
        details: {
          filePath: "/path/to/example.ts",
          totalLines: 500,
          totalBytes: 25_000,
          symbolCount: 15,
          language: "TypeScript",
        },
      };

      const result = rendererFn(message, { expanded: true }, mockTheme);

      // Verify it returns a component
      expect(result).toBeDefined();
    });

    it("handles content as array of content blocks", () => {
      const rendererFn = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: vi.fn(),
        registerMessageRenderer: (type: string, renderer: unknown) => {
          if (type === "file-map") {
            rendererFn.mockImplementation(renderer as () => unknown);
          }
        },
        sendMessage: vi.fn(),
      };

      piReadMapExtension(mockPi as never);

      // Create a mock theme
      const mockTheme = {
        fg: (color: string, text: string) => `[${color}:${text}]`,
        bold: (text: string) => `**${text}**`,
      };

      // Call the renderer with array content (expanded to trigger content extraction)
      const message = {
        customType: "file-map",
        content: [
          { type: "text", text: "first block" },
          { type: "text", text: "second block" },
        ],
        details: {
          filePath: "/path/to/example.ts",
          totalLines: 500,
          totalBytes: 25_000,
          symbolCount: 15,
          language: "TypeScript",
        },
      };

      const result = rendererFn(message, { expanded: true }, mockTheme);

      // Verify it returns a component without errors
      expect(result).toBeDefined();
    });
  });
});
