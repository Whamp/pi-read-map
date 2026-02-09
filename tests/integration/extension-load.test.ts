import { describe, it, expect, vi } from "vitest";

import piReadMapExtension from "../../src/index.js";

describe("extension loading", () => {
  it("exports a default function", () => {
    expect(typeof piReadMapExtension).toBe("function");
  });

  it("registers the read tool when called", () => {
    const mockPi = {
      registerTool: vi.fn(),
    };

    piReadMapExtension(mockPi as never);

    expect(mockPi.registerTool).toHaveBeenCalledOnce();
    expect(mockPi.registerTool).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "read",
      })
    );
  });

  it("registered tool has correct schema", () => {
    const mockPi = {
      registerTool: vi.fn(),
    };

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
    const mockPi = {
      registerTool: vi.fn(),
    };

    piReadMapExtension(mockPi as never);

    const registeredTool = mockPi.registerTool.mock.calls[0]?.[0];

    expect(registeredTool).toBeDefined();
    expect(typeof registeredTool.execute).toBe("function");
    // Verify it's an async function (returns a Promise when called)
    expect(registeredTool.execute.constructor.name).toBe("AsyncFunction");
  });
});
