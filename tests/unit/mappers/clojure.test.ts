import { writeFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { SymbolKind } from "../../../src/enums.js";
import { clojureMapper } from "../../../src/mappers/clojure.js";
import { hasTreeSitterClojure } from "../../helpers/tree-sitter.js";

const FIXTURES_DIR = join(import.meta.dirname, "../../fixtures");
const TMP_DIR = join(FIXTURES_DIR, "tmp");

describe("clojureMapper", () => {
  it("returns null for non-existent files", async () => {
    const result = await clojureMapper("/non/existent/file.clj");
    expect(result).toBeNull();
  });

  it("returns null for empty files", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "empty.clj");
    await writeFile(filePath, "");

    try {
      const result = await clojureMapper(filePath);
      expect(result).toBeNull();
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it("returns null for files with only comments", async () => {
    await mkdir(TMP_DIR, { recursive: true });
    const filePath = join(TMP_DIR, "comments.clj");
    await writeFile(filePath, ";; just a comment\n;; another one\n");

    try {
      const result = await clojureMapper(filePath);
      expect(result).toBeNull();
    } finally {
      await rm(filePath, { force: true });
    }
  });

  describe.runIf(hasTreeSitterClojure)("with tree-sitter", () => {
    it("extracts ns, defn, def, and imports from fixture", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      expect(result?.language).toBe("Clojure");
      expect(result?.symbols.length).toBeGreaterThan(0);

      // Namespace
      const ns = result?.symbols.find((s) => s.kind === SymbolKind.Namespace);
      expect(ns).toBeDefined();
      expect(ns?.name).toBe("my-app.core");
      expect(ns?.docstring).toBe("Application core namespace.");

      // Imports
      expect(result?.imports).toContain("[clojure.string :as str]");
      expect(result?.imports).toContain(
        "[clojure.set :refer [union intersection]]"
      );
    });

    it("extracts defn with docstring and signature", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const hello = result?.symbols.find((s) => s.name === "hello");
      expect(hello).toBeDefined();
      expect(hello?.kind).toBe(SymbolKind.Function);
      expect(hello?.docstring).toBe("Says hello to the given name.");
      expect(hello?.signature).toBe("(defn hello [name])");
      expect(hello?.isExported).toBe(true);
    });

    it("marks defn- as private", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const helper = result?.symbols.find((s) => s.name === "private-helper");
      expect(helper).toBeDefined();
      expect(helper?.kind).toBe(SymbolKind.Function);
      expect(helper?.isExported).toBe(false);
      expect(helper?.modifiers).toContain("private");
    });

    it("extracts def and defonce", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const constant = result?.symbols.find((s) => s.name === "my-constant");
      expect(constant).toBeDefined();
      expect(constant?.kind).toBe(SymbolKind.Variable);
      expect(constant?.docstring).toBe("The answer to everything.");
      expect(constant?.isExported).toBe(true);

      // ^:private metadata sets isExported=false and adds "private" modifier
      const secret = result?.symbols.find((s) => s.name === "secret");
      expect(secret).toBeDefined();
      expect(secret?.isExported).toBe(false);
      expect(secret?.modifiers).toContain("private");

      const conn = result?.symbols.find((s) => s.name === "db-connection");
      expect(conn).toBeDefined();
      expect(conn?.kind).toBe(SymbolKind.Variable);
      expect(conn?.docstring).toBe("Persistent database connection.");
    });

    it("extracts defmacro with macro modifier", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const unless = result?.symbols.find((s) => s.name === "unless");
      expect(unless).toBeDefined();
      expect(unless?.kind).toBe(SymbolKind.Function);
      expect(unless?.modifiers).toContain("macro");
      expect(unless?.signature).toBe("(defmacro unless [pred & body])");
    });

    it("extracts defprotocol with method children", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const proto = result?.symbols.find((s) => s.name === "Greetable");
      expect(proto).toBeDefined();
      expect(proto?.kind).toBe(SymbolKind.Interface);
      expect(proto?.children).toBeDefined();
      expect(proto?.children?.length).toBe(2);

      const greet = proto?.children?.find((c) => c.name === "greet");
      expect(greet).toBeDefined();
      expect(greet?.kind).toBe(SymbolKind.Method);
    });

    it("extracts defrecord", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const person = result?.symbols.find((s) => s.name === "Person");
      expect(person).toBeDefined();
      expect(person?.kind).toBe(SymbolKind.Class);
      expect(person?.signature).toContain("[name age]");

      const fastCounter = result?.symbols.find((s) => s.name === "FastCounter");
      expect(fastCounter).toBeDefined();
      expect(fastCounter?.kind).toBe(SymbolKind.Class);
      expect(fastCounter?.signature).toContain("[^:volatile-mutable cnt]");
    });

    it("extracts defmulti and defmethod", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const multi = result?.symbols.find((s) => s.name === "area");
      expect(multi).toBeDefined();
      expect(multi?.kind).toBe(SymbolKind.Function);
      expect(multi?.signature).toBe("(defmulti area :shape)");

      const circle = result?.symbols.find((s) => s.name === "area :circle");
      expect(circle).toBeDefined();
      expect(circle?.kind).toBe(SymbolKind.Method);

      const rect = result?.symbols.find((s) => s.name === "area :rect");
      expect(rect).toBeDefined();
      expect(rect?.kind).toBe(SymbolKind.Method);
    });

    it("extracts multi-arity function", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const multiArity = result?.symbols.find((s) => s.name === "multi-arity");
      expect(multiArity).toBeDefined();
      expect(multiArity?.signature).toContain("[x]");
      expect(multiArity?.signature).toContain("[x y]");
    });

    it("handles function without docstring", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/sample.clj");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const noDoc = result?.symbols.find((s) => s.name === "no-docstring");
      expect(noDoc).toBeDefined();
      expect(noDoc?.docstring).toBeUndefined();
    });

    it("extracts imports from ns with reader conditionals", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/reader_cond.cljc");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      // Regular import
      expect(result?.imports).toContain("[clojure.string :as str]");

      // Platform-specific imports unwrapped from #?()
      expect(result?.imports).toContain("[clojure.java.io :as io] :clj");
      expect(result?.imports).toContain("[cljs.reader :as reader] :cljs");
    });

    it("extracts defs from reader conditionals", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/reader_cond.cljc");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      // Regular def should still be there
      const shared = result?.symbols.find((s) => s.name === "shared-fn");
      expect(shared).toBeDefined();
      expect(shared?.modifiers).toBeUndefined();

      // Platform-specific defs from reader conditional
      const platformFns = result?.symbols.filter(
        (s) => s.name === "platform-fn"
      );
      expect(platformFns).toHaveLength(2);

      const cljVariant = platformFns?.find((s) =>
        s.modifiers?.includes("platform-clj")
      );
      expect(cljVariant).toBeDefined();
      expect(cljVariant?.docstring).toBe("JVM implementation.");

      const cljsVariant = platformFns?.find((s) =>
        s.modifiers?.includes("platform-cljs")
      );
      expect(cljsVariant).toBeDefined();
      expect(cljsVariant?.docstring).toBe("JS implementation.");
    });

    it("extracts private defs inside reader conditionals", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/reader_cond.cljc");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const secret = result?.symbols.find((s) => s.name === "jvm-secret");
      expect(secret).toBeDefined();
      expect(secret?.isExported).toBe(false);
      expect(secret?.modifiers).toContain("private");
      expect(secret?.modifiers).toContain("platform-clj");
    });

    it("extracts different names from different branches", async () => {
      const filePath = join(FIXTURES_DIR, "clojure/reader_cond.cljc");
      const result = await clojureMapper(filePath);
      expect(result).not.toBeNull();

      const cljOnly = result?.symbols.find((s) => s.name === "clj-only");
      expect(cljOnly).toBeDefined();
      expect(cljOnly?.modifiers).toContain("platform-clj");

      const cljsOnly = result?.symbols.find((s) => s.name === "cljs-only");
      expect(cljsOnly).toBeDefined();
      expect(cljsOnly?.modifiers).toContain("platform-cljs");
    });

    it("extracts deftype", async () => {
      await mkdir(TMP_DIR, { recursive: true });
      const filePath = join(TMP_DIR, "deftype.clj");
      await writeFile(
        filePath,
        `(deftype Counter [^:volatile-mutable cnt]
  clojure.lang.IDeref
  (deref [_] cnt))
`
      );

      try {
        const result = await clojureMapper(filePath);
        expect(result).not.toBeNull();

        const counter = result?.symbols.find((s) => s.name === "Counter");
        expect(counter).toBeDefined();
        expect(counter?.kind).toBe(SymbolKind.Class);
        expect(counter?.signature).toContain("[^:volatile-mutable cnt]");
      } finally {
        await rm(filePath, { force: true });
      }
    });
  });
});
