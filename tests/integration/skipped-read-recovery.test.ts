import { describe, it, expect, vi, beforeEach } from "vitest";

import piReadMapExtension, { resetPendingMaps } from "../../src/index.js";

/**
 * Helper to create a mock pi and extract the turn_end handler.
 */
function setupExtension() {
  const onHandler = vi.fn();
  const sendMessage = vi.fn();
  const mockPi = {
    registerTool: vi.fn(),
    on: onHandler,
    registerMessageRenderer: vi.fn(),
    sendMessage,
  };

  piReadMapExtension(mockPi as never);

  const turnEndCall = onHandler.mock.calls.find(
    (call) => call[0] === "turn_end"
  );
  expect(turnEndCall).toBeDefined();
  const [, handler] = turnEndCall ?? [];

  return { mockPi, sendMessage, handler };
}

/**
 * Build a TurnEndEvent with an assistant message and tool results.
 */
function makeTurnEndEvent(
  toolCalls: { id: string; name: string; path: string }[],
  toolResults: {
    toolCallId: string;
    toolName: string;
    skipped: boolean;
    isError?: boolean;
  }[]
) {
  return {
    type: "turn_end",
    turnIndex: 0,
    message: {
      role: "assistant" as const,
      content: toolCalls.map((tc) => ({
        type: "toolCall" as const,
        id: tc.id,
        name: tc.name,
        arguments: { path: tc.path },
      })),
      api: "anthropic-messages",
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
      usage: { input: 0, output: 0, cacheRead: 0 },
      stopReason: "toolCall" as const,
      timestamp: Date.now(),
    },
    toolResults: toolResults.map((tr) => ({
      role: "toolResult" as const,
      toolCallId: tr.toolCallId,
      toolName: tr.toolName,
      isError: tr.isError ?? false,
      content: tr.skipped
        ? [
            {
              type: "text" as const,
              text: "Skipped due to queued user message.",
            },
          ]
        : [{ type: "text" as const, text: "file contents here" }],
      timestamp: Date.now(),
    })),
  };
}

describe("skipped read recovery", () => {
  beforeEach(() => {
    resetPendingMaps();
  });

  describe("turn_end handler", () => {
    it("detects skipped reads and sends followUp recovery message", () => {
      const { sendMessage, handler } = setupExtension();

      const event = makeTurnEndEvent(
        [
          { id: "call-1", name: "read", path: "/src/a.rs" },
          { id: "call-2", name: "read", path: "/src/b.rs" },
          { id: "call-3", name: "read", path: "/src/c.rs" },
        ],
        [
          {
            toolCallId: "call-1",
            toolName: "read",
            skipped: false,
          },
          {
            toolCallId: "call-2",
            toolName: "read",
            skipped: true,
          },
          {
            toolCallId: "call-3",
            toolName: "read",
            skipped: true,
          },
        ]
      );

      handler(event, {});

      expect(sendMessage).toHaveBeenCalledOnce();
      const firstCall = sendMessage.mock.calls[0] as unknown[];
      const msg = firstCall[0] as { customType: string; content: string };
      const opts = firstCall[1] as { deliverAs: string };
      expect(msg.customType).toBe("read-recovery");
      expect(opts).toEqual({ deliverAs: "followUp" });
      expect(msg.content).toContain('read("/src/b.rs")');
      expect(msg.content).toContain('read("/src/c.rs")');
      expect(msg.content).not.toContain('read("/src/a.rs")');
    });

    it("does nothing when no reads were skipped", () => {
      const { sendMessage, handler } = setupExtension();

      const event = makeTurnEndEvent(
        [
          { id: "call-1", name: "read", path: "/src/a.rs" },
          { id: "call-2", name: "read", path: "/src/b.rs" },
          { id: "call-3", name: "read", path: "/src/c.rs" },
        ],
        [
          {
            toolCallId: "call-1",
            toolName: "read",
            skipped: false,
          },
          {
            toolCallId: "call-2",
            toolName: "read",
            skipped: false,
          },
          {
            toolCallId: "call-3",
            toolName: "read",
            skipped: false,
          },
        ]
      );

      handler(event, {});

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it("does nothing when skipped tools are not reads", () => {
      const { sendMessage, handler } = setupExtension();

      const event = makeTurnEndEvent(
        [
          { id: "call-1", name: "bash", path: "ls" },
          { id: "call-2", name: "write", path: "/tmp/out" },
        ],
        [
          {
            toolCallId: "call-1",
            toolName: "bash",
            skipped: true,
          },
          {
            toolCallId: "call-2",
            toolName: "write",
            skipped: true,
          },
        ]
      );

      handler(event, {});

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it("handles single skipped read", () => {
      const { sendMessage, handler } = setupExtension();

      const event = makeTurnEndEvent(
        [
          { id: "call-1", name: "read", path: "/src/a.rs" },
          { id: "call-2", name: "read", path: "/src/b.rs" },
        ],
        [
          {
            toolCallId: "call-1",
            toolName: "read",
            skipped: false,
          },
          {
            toolCallId: "call-2",
            toolName: "read",
            skipped: true,
          },
        ]
      );

      handler(event, {});

      expect(sendMessage).toHaveBeenCalledOnce();
      const firstCall = sendMessage.mock.calls[0] as unknown[];
      const msg = firstCall[0] as { content: string };
      expect(msg.content).toContain('read("/src/b.rs")');
      expect(msg.content).not.toContain('read("/src/a.rs")');
    });

    it("handles missing message content gracefully", () => {
      const { sendMessage, handler } = setupExtension();

      // Non-assistant message (e.g., a custom message type with no role)
      const event = {
        type: "turn_end",
        turnIndex: 0,
        message: { customType: "something-else" },
        toolResults: [
          {
            role: "toolResult",
            toolCallId: "call-1",
            toolName: "read",
            isError: false,
            content: [
              {
                type: "text",
                text: "Skipped due to queued user message.",
              },
            ],
            timestamp: Date.now(),
          },
        ],
      };

      // Should not crash
      handler(event, {});

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it("ignores skipped reads that are errors", () => {
      const { sendMessage, handler } = setupExtension();

      const event = makeTurnEndEvent(
        [{ id: "call-1", name: "read", path: "/src/a.rs" }],
        [
          {
            toolCallId: "call-1",
            toolName: "read",
            skipped: true,
            isError: true,
          },
        ]
      );

      handler(event, {});

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it("handles toolCall with no path argument gracefully", () => {
      const { sendMessage, handler } = setupExtension();

      const event = {
        type: "turn_end",
        turnIndex: 0,
        message: {
          role: "assistant" as const,
          content: [
            {
              type: "toolCall" as const,
              id: "call-1",
              name: "read",
              arguments: {},
            },
          ],
          api: "anthropic-messages",
          provider: "anthropic",
          model: "claude-sonnet-4-20250514",
          usage: { input: 0, output: 0, cacheRead: 0 },
          stopReason: "toolCall" as const,
          timestamp: Date.now(),
        },
        toolResults: [
          {
            role: "toolResult" as const,
            toolCallId: "call-1",
            toolName: "read",
            isError: false,
            content: [
              {
                type: "text" as const,
                text: "Skipped due to queued user message.",
              },
            ],
            timestamp: Date.now(),
          },
        ],
      };

      handler(event, {});

      // No path found, so no recovery
      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe("read-recovery message renderer", () => {
    it("renders collapsed view with path count", () => {
      const rendererFn = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: vi.fn(),
        registerMessageRenderer: (type: string, renderer: unknown) => {
          if (type === "read-recovery") {
            rendererFn.mockImplementation(renderer as () => unknown);
          }
        },
        sendMessage: vi.fn(),
      };

      piReadMapExtension(mockPi as never);

      const mockTheme = {
        fg: (_color: string, text: string) => text,
        bold: (text: string) => text,
      };

      const message = {
        customType: "read-recovery",
        content:
          'The following read() calls were interrupted:\n- read("/src/a.rs")\n- read("/src/b.rs")\nPlease re-issue these reads now.',
      };

      const result = rendererFn(message, { expanded: false }, mockTheme);
      expect(result).toBeDefined();
    });

    it("renders expanded view with full content", () => {
      const rendererFn = vi.fn();
      const mockPi = {
        registerTool: vi.fn(),
        on: vi.fn(),
        registerMessageRenderer: (type: string, renderer: unknown) => {
          if (type === "read-recovery") {
            rendererFn.mockImplementation(renderer as () => unknown);
          }
        },
        sendMessage: vi.fn(),
      };

      piReadMapExtension(mockPi as never);

      const mockTheme = {
        fg: (_color: string, text: string) => text,
        bold: (text: string) => text,
      };

      const message = {
        customType: "read-recovery",
        content: "Full recovery content here",
      };

      const result = rendererFn(message, { expanded: true }, mockTheme);
      expect(result).toBeDefined();
    });
  });
});
