---
name: summary-judge
description: Compare and judge file summaries from pi-read-map vs standard read tool. Use when evaluating summary quality on large files (>2k lines). Trigger with "/skill:summary-judge <file-path>" to run full automated comparison and update demo/README.md.
---

# Summary Judge

Automated comparison of `pi-read-map` vs standard `read` tool summaries.

## Workflow

When triggered with a file path, execute these steps in order:

### Step 1: Generate Summaries

Run the generation script:

```bash
.pi/skills/summary-judge/scripts/generate-summaries.sh <target-file>
```

This creates:
- `/tmp/summary-judge/summary-standard.md`
- `/tmp/summary-judge/summary-mapped.md`
- `/tmp/summary-judge/metadata.json`

### Step 2: Read Generated Summaries

Read all three files from `/tmp/summary-judge/`.

### Step 3: Evaluate

Compare the summaries on:
- **Coverage**: Did it see the whole file or just the top ~2k lines?
- **Architectural insight**: Did it identify patterns spanning the file?
- **Component depth**: Did it find components defined deep in the file?
- **Categorization**: How well did it organize/group the content?

### Step 4: Determine Case Study Number

Read `demo/README.md` and count existing case studies.

### Step 5: Append Case Study

Append a new case study section to `demo/README.md` at the end, using this format:

```markdown
---

## Case Study [N]: [Language] (`[Filename]`)

**Judgement Session URL:** [Current Session]

### The Verdict

**Winner:** `pi-read-map` ([One-phrase reason])

[1-2 sentences: why the winner is better]

#### Key Differentiator

[What standard tool missed vs what map revealed]

#### Detailed Comparison

| Feature | `pi-read-map` | Standard `read` Tool |
| :--- | :--- | :--- |
| **Coverage** | ... | ... |
| **[Other Metric]** | ... | ... |

#### Token Usage Analysis

| Metric | Value |
|--------|-------|
| **File Size** | [size], [lines] lines |
| **Standard Session** | ~Xk tokens |
| **Mapped Session** | ~Yk tokens |
| **Difference** | +Zk tokens |

[One sentence summary of token tradeoff]
```

### Step 6: Report

Output a brief summary of the judgement result.
