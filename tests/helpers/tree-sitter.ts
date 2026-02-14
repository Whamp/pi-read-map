import { createRequire } from "node:module";

function checkTreeSitter(grammarName: string): boolean {
  const isBun = (globalThis as { Bun?: unknown }).Bun !== undefined;
  if (isBun) {
    return false;
  }
  try {
    const require = createRequire(import.meta.url);
    require("tree-sitter");
    require(grammarName);
    return true;
  } catch {
    return false;
  }
}

export const hasTreeSitterRust = checkTreeSitter("tree-sitter-rust");
export const hasTreeSitterCpp = checkTreeSitter("tree-sitter-cpp");
export const hasTreeSitterClojure = checkTreeSitter("tree-sitter-clojure");
