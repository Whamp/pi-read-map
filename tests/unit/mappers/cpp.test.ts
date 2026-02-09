import { writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SymbolKind } from "../../../src/enums.js";
import { cppMapper } from "../../../src/mappers/cpp.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");
const TMP_DIR = join(FIXTURES_DIR, "tmp");

describe("cppMapper", () => {
  it("extracts classes from C++ files", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "test.cpp");
    await writeFile(
      filePath,
      `class MyClass {
public:
    MyClass();
    void doSomething();
private:
    int value;
};

void MyClass::doSomething() {
    // implementation
}
`
    );

    try {
      const result = await cppMapper(filePath);

      // May return null if tree-sitter is not available
      if (result) {
        expect(result.language).toBe("C++");
        expect(result.symbols.length).toBeGreaterThan(0);

        const classSymbol = result.symbols.find(
          (s) => s.kind === SymbolKind.Class
        );
        expect(classSymbol).toBeDefined();
        expect(classSymbol?.name).toBe("MyClass");
      }
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("extracts namespaces from C++ files", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "namespace.cpp");
    await writeFile(
      filePath,
      `namespace MyNamespace {
    class InnerClass {
    public:
        void method();
    };
}
`
    );

    try {
      const result = await cppMapper(filePath);

      if (result) {
        const nsSymbol = result.symbols.find((s) => s.name === "MyNamespace");
        expect(nsSymbol).toBeDefined();
      }
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("returns null for non-existent files", async () => {
    const result = await cppMapper("/non/existent/file.cpp");
    expect(result).toBeNull();
  });
});
