import { join } from "node:path";
import { describe, it, expect } from "vitest";

import { pythonMapper } from "../../../src/mappers/python.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");

describe("pythonMapper", () => {
  it("extracts symbols from a small Python file", async () => {
    const filePath = join(FIXTURES_DIR, "small/hello.py");
    const result = await pythonMapper(filePath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("Python");
    expect(result?.symbols.length).toBeGreaterThan(0);

    // Should find the hello function
    const helloFn = result?.symbols.find((s) => s.name === "hello");
    expect(helloFn).toBeDefined();
    expect(helloFn?.kind).toBe("function");

    // Should find the Greeter class
    const greeterClass = result?.symbols.find((s) => s.name === "Greeter");
    expect(greeterClass).toBeDefined();
    expect(greeterClass?.kind).toBe("class");

    // Greeter should have methods as children
    expect(greeterClass?.children?.length).toBeGreaterThan(0);
  });

  it("extracts symbols from a large Python file", async () => {
    const filePath = join(FIXTURES_DIR, "large/processor.py");
    const result = await pythonMapper(filePath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("Python");
    expect(result?.totalLines).toBeGreaterThan(2000);

    // Should find many classes
    const classes = result?.symbols.filter((s) => s.kind === "class") ?? [];
    expect(classes.length).toBeGreaterThan(10);

    // Should find many functions
    const functions =
      result?.symbols.filter((s) => s.kind === "function") ?? [];
    expect(functions.length).toBeGreaterThan(50);

    // Should have imports
    expect(result?.imports?.length).toBeGreaterThan(0);
  });

  it("extracts function signatures", async () => {
    const filePath = join(FIXTURES_DIR, "small/hello.py");
    const result = await pythonMapper(filePath);

    const greeterClass = result?.symbols.find((s) => s.name === "Greeter");
    const greetMethod = greeterClass?.children?.find((s) => s.name === "greet");

    expect(greetMethod?.signature).toBeDefined();
    expect(greetMethod?.signature).toContain("self");
    expect(greetMethod?.signature).toContain("str");
  });

  it("extracts async function modifiers", async () => {
    const filePath = join(FIXTURES_DIR, "large/processor.py");
    const result = await pythonMapper(filePath);

    // Find an async function
    const asyncFn = result?.symbols.find((s) =>
      s.name.startsWith("async_handler")
    );
    expect(asyncFn).toBeDefined();
    expect(asyncFn?.modifiers).toContain("async");
  });

  it("returns null for non-existent files", async () => {
    const result = await pythonMapper("/non/existent/file.py");
    expect(result).toBeNull();
  });

  it("includes line ranges for symbols", async () => {
    const filePath = join(FIXTURES_DIR, "small/hello.py");
    const result = await pythonMapper(filePath);

    for (const symbol of result?.symbols ?? []) {
      expect(symbol.startLine).toBeGreaterThan(0);
      expect(symbol.endLine).toBeGreaterThanOrEqual(symbol.startLine);
    }
  });

  it("extracts docstrings from Python functions and classes", async () => {
    const filePath = join(FIXTURES_DIR, "python/docstrings.py");
    const result = await pythonMapper(filePath);

    expect(result).not.toBeNull();

    const processData = result?.symbols.find((s) => s.name === "process_data");
    expect(processData?.docstring).toBe(
      "Process a list of items and return results."
    );

    const dataProcessor = result?.symbols.find(
      (s) => s.name === "DataProcessor"
    );
    expect(dataProcessor?.docstring).toBe(
      "Handles complex data transformations."
    );

    const noDocstring = result?.symbols.find((s) => s.name === "no_docstring");
    expect(noDocstring?.docstring).toBeUndefined();
  });

  it("sets isExported based on underscore convention", async () => {
    const filePath = join(FIXTURES_DIR, "python/docstrings.py");
    const result = await pythonMapper(filePath);

    expect(result).not.toBeNull();

    const processData = result?.symbols.find((s) => s.name === "process_data");
    expect(processData?.isExported).toBe(true);

    const privateHelper = result?.symbols.find(
      (s) => s.name === "_private_helper"
    );
    expect(privateHelper?.isExported).toBe(false);
  });
});
