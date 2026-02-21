import { describe, it, expect, expectTypeOf, vi } from "vitest";

import piReadMapExtension from "../../src/index.js";

/**
 * Create a mock pi object with all required methods for the extension.
 */
function createMockPi() {
  return {
    registerTool: vi.fn(),
    on: vi.fn(),
    registerMessageRenderer: vi.fn(),
    sendMessage: vi.fn(),
  };
}

describe("extension loading", () => {
  it("exports a default function", () => {
    expectTypeOf(piReadMapExtension).toBeFunction();
  });

  it("registers the read tool when called", () => {
    const mockPi = createMockPi();

    piReadMapExtension(mockPi as never);

    expect(mockPi.registerTool).toHaveBeenCalledOnce();
    expect(mockPi.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "read",
      })
    );
  });

  it("registered tool has correct schema", () => {
    const mockPi = createMockPi();

    piReadMapExtension(mockPi as never);

    const registeredTool = mockPi.registerTool.mock.calls[0]?.[0];

    expect(registeredTool).toBeDefined();
    expect(registeredTool.name).toBe("read");
    expect(registeredTool.label).toBe("Read");
    expect(registeredTool.description).toContain("Read the contents of a file");
    expect(registeredTool.parameters).toBeDefined();
    expect(registeredTool.parameters.properties).toBeDefined();
    expect(registeredTool.parameters.properties.path).toBeDefined();
    expect(registeredTool.parameters.properties.offset).toBeDefined();
    expect(registeredTool.parameters.properties.limit).toBeDefined();
  });

  it("registered tool execute is callable", () => {
    const mockPi = createMockPi();

    piReadMapExtension(mockPi as never);

    const registeredTool = mockPi.registerTool.mock.calls[0]?.[0];

    expect(registeredTool).toBeDefined();
    expect(registeredTool.execute).toBeTypeOf("function");
    expect(registeredTool.execute.constructor.name).toBe("AsyncFunction");
  });
});
