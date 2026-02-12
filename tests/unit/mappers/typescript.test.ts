import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SymbolKind } from "../../../src/enums.js";
import { typescriptMapper } from "../../../src/mappers/typescript.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");

describe("typescriptMapper", () => {
  it("extracts symbols from TypeScript files", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("TypeScript");
    expect(result?.symbols.length).toBeGreaterThan(0);
  });

  it("extracts classes with methods", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const classSymbol = result?.symbols.find(
      (s) => s.kind === SymbolKind.Class
    );
    expect(classSymbol).toBeDefined();
  });

  it("extracts functions", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const funcSymbol = result?.symbols.find(
      (s) => s.kind === SymbolKind.Function
    );
    expect(funcSymbol).toBeDefined();
  });

  it("returns null for non-existent files", async () => {
    const result = await typescriptMapper("/non/existent/file.ts");
    expect(result).toBeNull();
  });

  it("handles JavaScript files", async () => {
    const filePath = join(FIXTURES_DIR, "js/simple.js");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("JavaScript");
  });

  it("extracts JSDoc docstrings from functions", async () => {
    const filePath = join(FIXTURES_DIR, "js/jsdoc.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const handleRequest = result?.symbols.find(
      (s) => s.name === "handleRequest"
    );
    expect(handleRequest?.docstring).toBe(
      "Processes incoming HTTP requests and routes them."
    );
  });

  it("extracts JSDoc docstrings from classes and methods", async () => {
    const filePath = join(FIXTURES_DIR, "js/jsdoc.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const userService = result?.symbols.find((s) => s.name === "UserService");
    expect(userService?.docstring).toBe("Service for managing user accounts.");

    const addUser = userService?.children?.find((s) => s.name === "addUser");
    expect(addUser?.docstring).toBe("Creates a new user in the system.");
  });

  it("returns only the first line of multi-line JSDoc", async () => {
    const filePath = join(FIXTURES_DIR, "js/jsdoc.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const userService = result?.symbols.find((s) => s.name === "UserService");
    const getUser = userService?.children?.find((s) => s.name === "getUser");
    expect(getUser?.docstring).toBe("Retrieves a user by their ID.");
  });

  it("returns undefined docstring when no JSDoc present", async () => {
    const filePath = join(FIXTURES_DIR, "js/jsdoc.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const noDoc = result?.symbols.find((s) => s.name === "noDoc");
    expect(noDoc?.docstring).toBeUndefined();

    const userService = result?.symbols.find((s) => s.name === "UserService");
    const deleteUser = userService?.children?.find(
      (s) => s.name === "deleteUser"
    );
    expect(deleteUser?.docstring).toBeUndefined();
  });

  it("extracts JSDoc from interfaces, enums, type aliases, and variables", async () => {
    const filePath = join(FIXTURES_DIR, "js/jsdoc.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const user = result?.symbols.find((s) => s.name === "User");
    expect(user?.docstring).toBe("A user in the system.");

    const logLevel = result?.symbols.find((s) => s.name === "LogLevel");
    expect(logLevel?.docstring).toBe("Supported log levels.");

    const handler = result?.symbols.find((s) => s.name === "Handler");
    expect(handler?.docstring).toBe("A type alias for handler functions.");

    const maxRetries = result?.symbols.find((s) => s.name === "MAX_RETRIES");
    expect(maxRetries?.docstring).toBe(
      "Maximum number of retries for failed operations."
    );
  });

  it("sets isExported correctly", async () => {
    const filePath = join(FIXTURES_DIR, "js/jsdoc.ts");
    const result = await typescriptMapper(filePath);

    expect(result).not.toBeNull();
    const handleRequest = result?.symbols.find(
      (s) => s.name === "handleRequest"
    );
    expect(handleRequest?.isExported).toBe(true);

    const userService = result?.symbols.find((s) => s.name === "UserService");
    // Methods are not exported from the module (they're class members)
    const addUser = userService?.children?.find((s) => s.name === "addUser");
    expect(addUser?.isExported).toBe(false);
  });
});
