import { join } from "node:path";
import { describe, it, expect, afterAll } from "vitest";

import { generateMap } from "../../src/mapper.js";
import { createTempFile, cleanupAllTempFiles } from "./helpers.js";

const FIXTURES_DIR = join(import.meta.dirname, "../fixtures");

describe("mapper dispatch", () => {
  afterAll(async () => {
    await cleanupAllTempFiles();
  });

  it("routes .py files to Python mapper", async () => {
    const content = `
def hello():
    print("Hello")

class Greeter:
    def greet(self):
        pass
`;
    const filepath = await createTempFile("test.py", content);
    const result = await generateMap(filepath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("Python");
    // Should find the function and class
    const symbolNames = result?.symbols.map((s) => s.name) ?? [];
    expect(symbolNames).toContain("hello");
    expect(symbolNames).toContain("Greeter");
  });

  it("routes .ts files to TypeScript mapper", async () => {
    // Use a fixture file that won't disappear during ts-morph analysis
    const filepath = join(FIXTURES_DIR, "small/hello.ts");
    const result = await generateMap(filepath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("TypeScript");
    // Should find the interface, function, and class from hello.ts
    const symbolNames = result?.symbols.map((s) => s.name) ?? [];
    expect(symbolNames).toContain("Greeting");
    expect(symbolNames).toContain("hello");
    expect(symbolNames).toContain("Greeter");
  });

  it("routes .go files to Go mapper", async () => {
    const content = `
package main

type Greeter struct {
	name string
}

func Hello() {
	fmt.Println("Hello")
}
`;
    const filepath = await createTempFile("test.go", content);
    const result = await generateMap(filepath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("Go");
    // Should find struct and function
    const symbolNames = result?.symbols.map((s) => s.name) ?? [];
    expect(symbolNames).toContain("Greeter");
    expect(symbolNames).toContain("Hello");
  });

  it("routes .sql files to SQL mapper", async () => {
    const content = `
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE INDEX idx_users_name ON users(name);
`;
    const filepath = await createTempFile("schema.sql", content);
    const result = await generateMap(filepath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("SQL");
    // SQL mapper prefixes symbol names with type (TABLE, INDEX, etc.)
    const symbolNames = result?.symbols.map((s) => s.name) ?? [];
    // Check that we have table and index symbols
    const hasTableUsers = symbolNames.some((name) => name.includes("users"));
    const hasIndex = symbolNames.some((name) =>
      name.includes("idx_users_name")
    );
    expect(hasTableUsers).toBe(true);
    expect(hasIndex).toBe(true);
  });

  it("routes .json files to JSON mapper", async () => {
    const content = `{
  "name": "test",
  "version": "1.0.0",
  "dependencies": {
    "lodash": "4.0.0"
  }
}`;
    const filepath = await createTempFile("package.json", content);
    const result = await generateMap(filepath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("JSON");
    // JSON mapper includes type info in symbol names (e.g., "name: string")
    const symbolNames = result?.symbols.map((s) => s.name) ?? [];
    // Check that we have symbols containing the key names
    const hasName = symbolNames.some((name) => name.includes("name"));
    const hasVersion = symbolNames.some((name) => name.includes("version"));
    const hasDeps = symbolNames.some((name) => name.includes("dependencies"));
    expect(hasName).toBe(true);
    expect(hasVersion).toBe(true);
    expect(hasDeps).toBe(true);
  });

  it("routes .yaml files to YAML mapper", async () => {
    const content = `
name: test
version: 1.0.0
config:
  debug: true
  timeout: 30
`;
    const filepath = await createTempFile("config.yaml", content);
    const result = await generateMap(filepath);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("YAML");
    // Should find top-level keys
    const symbolNames = result?.symbols.map((s) => s.name) ?? [];
    expect(symbolNames).toContain("name");
    expect(symbolNames).toContain("version");
    expect(symbolNames).toContain("config");
  });

  it("routes unknown extensions to fallback chain", async () => {
    // Create a file with unknown extension but recognizable pattern
    const content = `
function doSomething() {
  return true;
}

class MyClass {
  method() {}
}
`;
    const filepath = await createTempFile("test.xyz", content);
    const result = await generateMap(filepath);

    // Fallback chain (ctags or grep) should still produce a result
    expect(result).not.toBeNull();
  });

  it("fallback produces result for unrecognized files", async () => {
    // Create a file with truly random content
    const content = `
SECTION: Header
  item1: value1
  item2: value2

SECTION: Footer
  copyright: 2024
`;
    const filepath = await createTempFile("data.custom", content);
    const result = await generateMap(filepath);

    // Even for truly unknown content, we should get some result
    // Either ctags finds something or grep fallback runs
    expect(result).not.toBeNull();
    expect(result?.path).toBe(filepath);
  });
});
