import { describe, expect, it } from "vitest";

import { DetailLevel, SymbolKind } from "../../../src/enums.js";
import { jsonlMapper } from "../../../src/mappers/jsonl.js";

const FIXTURE_DIR = `${import.meta.dirname}/../../fixtures/jsonl`;

describe("jsonlMapper — pi session detection", () => {
  it("detects a pi session file and sets language to Pi Session", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("Pi Session");
  });

  it("keeps generic language for non-session JSONL", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/events.jsonl`);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("JSON Lines");
  });

  it("produces a header symbol with cwd and timestamp", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);
    const header = result?.symbols[0];

    expect(header).toBeDefined();
    expect(header?.kind).toBe(SymbolKind.Module);
    expect(header?.name).toContain("/home/test/project");
    expect(header?.name).toContain("2026-01-15");
    expect(header?.startLine).toBe(1);
    expect(header?.endLine).toBe(1);
  });

  it("produces a stats summary symbol with entry type counts", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);
    const stats = result?.symbols.find((s) => s.name.startsWith("Stats:"));

    expect(stats).toBeDefined();
    expect(stats?.kind).toBe(SymbolKind.Property);
    // The fixture has: 4 user, 8 assistant, 4 toolResult, 1 compaction, 2 model_change
    expect(stats?.name).toContain("4 user");
    expect(stats?.name).toContain("8 assistant");
    expect(stats?.name).toContain("4 tool");
    expect(stats?.name).toContain("1 compaction");
  });

  it("creates symbols for each user message turn", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);
    const userTurns = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Function
    );

    // 4 user messages in fixture
    expect(userTurns?.length).toBe(4);
    expect(userTurns?.[0]?.name).toContain("Fix the login bug");
    expect(userTurns?.[1]?.name).toContain("add unit tests");
    expect(userTurns?.[2]?.name).toContain("integration tests");
    expect(userTurns?.[3]?.name).toContain("Great work");
  });

  it("user turn line ranges span through subsequent responses", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);
    const userTurns = result?.symbols.filter(
      (s) => s.kind === SymbolKind.Function
    );

    // First user turn starts at line 4 (after session, model_change, thinking_level_change)
    // and spans through the assistant/tool responses until the next structural entry
    expect(userTurns?.[0]?.startLine).toBe(4);
    expect(userTurns?.[0]?.endLine).toBeGreaterThan(4);

    // Each turn's endLine should be < next turn's startLine
    for (let i = 0; i < (userTurns?.length ?? 0) - 1; i++) {
      expect(userTurns![i]!.endLine).toBeLessThan(userTurns![i + 1]!.startLine);
    }
  });

  it("creates a symbol for compaction boundaries", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);
    const compactions = result?.symbols.filter((s) =>
      s.name.startsWith("[Compaction]")
    );

    expect(compactions?.length).toBe(1);
    expect(compactions?.[0]?.kind).toBe(SymbolKind.Namespace);
  });

  it("creates a symbol for model changes", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);
    const modelChanges = result?.symbols.filter((s) =>
      s.name.startsWith("[Model]")
    );

    // The fixture has 2 model_change entries, but the first one is before
    // any user message (initial setup). We should still show both.
    expect(modelChanges?.length).toBe(2);
    expect(modelChanges?.[0]?.name).toContain("anthropic");
    expect(modelChanges?.[1]?.name).toContain("openai");
  });

  it("creates a symbol for session name when present", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);
    const sessionInfo = result?.symbols.find((s) =>
      s.name.startsWith("[Session]")
    );

    expect(sessionInfo).toBeDefined();
    expect(sessionInfo?.name).toContain("Fix login bug and add tests");
    expect(sessionInfo?.kind).toBe(SymbolKind.Property);
  });

  it("handles a session with only a header", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session-minimal.jsonl`);

    expect(result).not.toBeNull();
    expect(result?.language).toBe("Pi Session");
    expect(result?.totalLines).toBe(1);
    // Should have header + stats (with all zeros)
    const header = result?.symbols[0];
    expect(header?.kind).toBe(SymbolKind.Module);
  });

  it("symbols are ordered by line number", async () => {
    const result = await jsonlMapper(`${FIXTURE_DIR}/pi-session.jsonl`);

    for (let i = 0; i < (result?.symbols.length ?? 0) - 1; i++) {
      expect(result!.symbols[i]!.startLine).toBeLessThanOrEqual(
        result!.symbols[i + 1]!.startLine
      );
    }
  });
});
