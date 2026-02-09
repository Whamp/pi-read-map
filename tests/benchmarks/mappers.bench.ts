import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, bench, beforeAll } from "vitest";

import { codemapMapper } from "../../src/mappers/codemap.js";
import { cppMapper } from "../../src/mappers/cpp.js";
import { markdownMapper } from "../../src/mappers/markdown.js";
import { rustMapper } from "../../src/mappers/rust.js";
import { typescriptMapper } from "../../src/mappers/typescript.js";

const FIXTURES_DIR = join(import.meta.dirname, "../fixtures/bench");

// Generate a large TypeScript file for benchmarking
const generateLargeTs = (numClasses: number): string => {
  const lines: string[] = ["// Generated TypeScript file for benchmarking\n"];

  for (let i = 0; i < numClasses; i++) {
    lines.push(`export interface Config${i} {`);
    lines.push(`  name: string;`);
    lines.push(`  value: number;`);
    lines.push(`}\n`);

    lines.push(`export class Service${i} {`);
    lines.push(`  private config: Config${i};`);
    lines.push(`  constructor(config: Config${i}) {`);
    lines.push(`    this.config = config;`);
    lines.push(`  }`);
    lines.push(`  process(): void {`);
    lines.push(`    console.log(this.config.name);`);
    lines.push(`  }`);
    lines.push(`  async fetch(): Promise<string> {`);
    lines.push(`    return this.config.name;`);
    lines.push(`  }`);
    lines.push(`}\n`);
  }

  return lines.join("\n");
};

describe("mapper performance benchmarks", () => {
  const tsFilePath = join(FIXTURES_DIR, "large.ts");
  const mdFilePath = join(FIXTURES_DIR, "large.md");
  const cppFilePath = join(FIXTURES_DIR, "large.cpp");
  const rsFilePath = join(FIXTURES_DIR, "large.rs");

  beforeAll(async () => {
    await mkdir(FIXTURES_DIR, { recursive: true });

    // Create large TypeScript file
    await writeFile(tsFilePath, generateLargeTs(100));

    // Create large Markdown file
    const mdLines: string[] = [];
    for (let i = 0; i < 50; i++) {
      mdLines.push(`# Section ${i}`);
      for (let j = 0; j < 5; j++) {
        mdLines.push(`## Subsection ${i}.${j}`);
        mdLines.push(`Content for subsection ${i}.${j}`);
        mdLines.push("");
      }
    }
    await writeFile(mdFilePath, mdLines.join("\n"));

    // Create large C++ file
    const cppLines: string[] = ["#include <iostream>\n"];
    for (let i = 0; i < 50; i++) {
      cppLines.push(`class Class${i} {`);
      cppLines.push(`public:`);
      cppLines.push(`  void method${i}();`);
      cppLines.push(`private:`);
      cppLines.push(`  int value${i};`);
      cppLines.push(`};\n`);
    }
    await writeFile(cppFilePath, cppLines.join("\n"));

    // Create large Rust file
    const rsLines: string[] = [];
    for (let i = 0; i < 50; i++) {
      rsLines.push(`pub struct Struct${i} {`);
      rsLines.push(`  pub name: String,`);
      rsLines.push(`}`);
      rsLines.push(``);
      rsLines.push(`impl Struct${i} {`);
      rsLines.push(`  pub fn new(name: String) -> Self {`);
      rsLines.push(`    Self { name }`);
      rsLines.push(`  }`);
      rsLines.push(`}`);
      rsLines.push(``);
    }
    await writeFile(rsFilePath, rsLines.join("\n"));

    return async () => {
      await rm(FIXTURES_DIR, { recursive: true, force: true });
    };
  });

  bench("typescriptMapper - 100 classes", async () => {
    await typescriptMapper(tsFilePath);
  });

  bench("codemapMapper (CLI) - 100 classes", async () => {
    await codemapMapper(tsFilePath);
  });

  bench("markdownMapper - 50 sections", async () => {
    await markdownMapper(mdFilePath);
  });

  bench("cppMapper - 50 classes", async () => {
    await cppMapper(cppFilePath);
  });

  bench("rustMapper - 50 structs", async () => {
    await rustMapper(rsFilePath);
  });
});
