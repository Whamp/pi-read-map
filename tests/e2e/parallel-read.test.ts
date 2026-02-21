import { statSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

import { runPiSession } from "../helpers/pi-runner.js";

const home = homedir();
const FILE1 = resolve(
  home,
  "tools/pi-mono/packages/coding-agent/src/core/agent-session.ts"
);
const FILE2 = resolve(
  home,
  "tools/pi-mono/packages/coding-agent/src/core/package-manager.ts"
);
const FILE3 = resolve(
  home,
  "tools/pi-mono/packages/coding-agent/src/modes/interactive/interactive-mode.ts"
);

const filesExist = [FILE1, FILE2, FILE3].every((f) => {
  try {
    statSync(f);
    return true;
  } catch {
    return false;
  }
});

describe("e2e: parallel read inline", () => {
  it.skipIf(!filesExist)(
    "successfully reads multiple large files in parallel without skipping or recovery turns",
    async () => {
      const prompt = `Use the read tool to read these 3 files at the exact same time using parallel tool execution:
1. ${FILE1}
2. ${FILE2}
3. ${FILE3}

Reply "DONE" when you have read all three. Do NOT summarize them.`;

      const result = await runPiSession({
        prompt,
        provider: "zai",
        model: "glm-4.7",
        timeout: 180_000,
      });

      console.log("Exit Code:", result.exitCode);
      console.log("Tool Results Length:", result.toolResults.length);

      try {
        const readTools = result.toolResults.filter(
          (tr) => tr.toolName === "read"
        );

        const skippedReads = readTools.filter((tr) =>
          tr.content.some(
            (c) =>
              c.type === "text" &&
              c.text?.includes("Skipped due to queued user message.")
          )
        );

        // 1. With inline maps, there should be NO skipped reads
        expect(skippedReads).toHaveLength(0);

        // 2. All reads should have completed successfully
        const successfulReads = readTools.filter((tr) => !tr.isError);
        expect(successfulReads.length).toBeGreaterThanOrEqual(3);

        // 3. The file maps should be embedded directly in the tool results
        let foundMapInResult = false;
        for (const tr of successfulReads) {
          if (
            tr.content.some(
              (c) => c.type === "text" && c.text?.includes("File Map:")
            )
          ) {
            foundMapInResult = true;
            break;
          }
        }
        expect(foundMapInResult).toBe(true);

        expect(result.exitCode).toBe(0);
        expect(result.stderr).not.toMatch(/Cloud Code Assist API error/i);
        expect(result.stderr).not.toMatch(
          /tool_use ids were found without tool_result blocks/i
        );
      } finally {
        await result.cleanup();
      }
    },
    180_000
  );
});
