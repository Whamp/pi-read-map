import { writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SymbolKind } from "../../../src/enums.js";
import { cppMapper } from "../../../src/mappers/cpp.js";
import { hasTreeSitterCpp } from "../../helpers/tree-sitter.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");
const TMP_DIR = join(FIXTURES_DIR, "tmp");

describe("cppMapper", () => {
  it("returns null for non-existent files", async () => {
    const result = await cppMapper("/non/existent/file.cpp");
    expect(result).toBeNull();
  });

  describe.runIf(hasTreeSitterCpp)("with tree-sitter", () => {
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
        expect(result).not.toBeNull();

        expect(result?.language).toBe("C++");
        expect(result?.symbols.length).toBeGreaterThan(0);

        const classSymbol = result?.symbols.find(
          (s) => s.kind === SymbolKind.Class
        );
        expect(classSymbol).toBeDefined();
        expect(classSymbol?.name).toBe("MyClass");
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
        expect(result).not.toBeNull();

        const nsSymbol = result?.symbols.find((s) => s.name === "MyNamespace");
        expect(nsSymbol).toBeDefined();
      } finally {
        await rm(filePath, { force: true });
      }
    });

    it("extracts doc comments as docstrings", async () => {
      const filePath = join(FIXTURES_DIR, "cpp/docstrings.cpp");
      const result = await cppMapper(filePath);
      expect(result).not.toBeNull();

      const handler = result?.symbols.find((s) => s.name === "RequestHandler");
      expect(handler?.docstring).toBe("A request handler for the HTTP server.");

      const factorial = result?.symbols.find((s) => s.name === "factorial");
      expect(factorial?.docstring).toBe("Compute the factorial of n.");

      // static function with no doc comment
      const moduleInit = result?.symbols.find((s) => s.name === "module_init");
      expect(moduleInit?.docstring).toBeUndefined();
    });

    it("sets isExported based on linkage and access", async () => {
      const filePath = join(FIXTURES_DIR, "cpp/docstrings.cpp");
      const result = await cppMapper(filePath);
      expect(result).not.toBeNull();

      // Free function without static => exported
      const factorial = result?.symbols.find((s) => s.name === "factorial");
      expect(factorial?.isExported).toBe(true);

      // static function => not exported
      const moduleInit = result?.symbols.find((s) => s.name === "module_init");
      expect(moduleInit?.isExported).toBe(false);
    });
  });
});
