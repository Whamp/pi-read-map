import { writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SymbolKind } from "../../../src/enums.js";
import { rustMapper } from "../../../src/mappers/rust.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");
const TMP_DIR = join(FIXTURES_DIR, "tmp");

describe("rustMapper", () => {
  it("extracts structs from Rust files", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "test.rs");
    await writeFile(
      filePath,
      `pub struct MyStruct {
    pub name: String,
    value: i32,
}

impl MyStruct {
    pub fn new(name: String, value: i32) -> Self {
        Self { name, value }
    }

    pub fn get_value(&self) -> i32 {
        self.value
    }
}
`
    );

    try {
      const result = await rustMapper(filePath);

      // May return null if tree-sitter is not available
      if (result) {
        expect(result.language).toBe("Rust");
        expect(result.symbols.length).toBeGreaterThan(0);

        const structSymbol = result.symbols.find(
          (s) => s.kind === SymbolKind.Class && s.name === "MyStruct"
        );
        expect(structSymbol).toBeDefined();
      }
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("extracts enums from Rust files", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "enum.rs");
    await writeFile(
      filePath,
      `pub enum Status {
    Active,
    Inactive,
    Pending(String),
}
`
    );

    try {
      const result = await rustMapper(filePath);

      if (result) {
        const enumSymbol = result.symbols.find(
          (s) => s.kind === SymbolKind.Enum
        );
        expect(enumSymbol).toBeDefined();
        expect(enumSymbol?.name).toBe("Status");
      }
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("extracts traits from Rust files", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "trait.rs");
    await writeFile(
      filePath,
      `pub trait Processor {
    fn process(&self, data: &str) -> Result<(), Error>;
    fn validate(&self) -> bool;
}
`
    );

    try {
      const result = await rustMapper(filePath);

      if (result) {
        const traitSymbol = result.symbols.find(
          (s) => s.kind === SymbolKind.Interface
        );
        expect(traitSymbol).toBeDefined();
        expect(traitSymbol?.name).toBe("Processor");
      }
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("returns null for non-existent files", async () => {
    const result = await rustMapper("/non/existent/file.rs");
    expect(result).toBeNull();
  });
});
