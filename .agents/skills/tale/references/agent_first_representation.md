---
title: 'Agent-First Representation & Token Optimization Standards'
type: 'reference'
status: 'active'
description: 'ASD-STE100 and ADR-001 profile for agent-consumed architecture documents, context maps, and sidecars.'
---

# Agent-First Representation & Token Optimization Standards (ADR-001)

This reference document defines the syntax and formatting profile for files that AI agents read.
These files include architecture records, context maps, and module sidecars.

All files must obey ASD-STE100 Issue 9 grammar and vocabulary rules.
In addition, agent-facing files must obey the six token-optimal syntax rules defined below.

---

## 1. Scope and File Classification

Agent-facing documents must use high semantic density.
Human visual files (such as diagrams and graphical dashboards) must live in separate files.

| Classification   | Typical File Patterns                                         | Syntax Rules Enforced                  |
| :--------------- | :------------------------------------------------------------ | :------------------------------------- |
| **Agent-First**  | `AGENTS.md`, `RULES.md`, `*context*`, `architecture/**`       | Full ASD-STE100 + ADR-001 Syntax Rules |
| **Human-Facing** | `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `visual-*.md` | Full ASD-STE100 only                   |

Configure custom file patterns in `.talerc.json` or in the `package.json` file.

---

## 2. ADR-001 Syntax Rules

### Rule 1: No Decorative Syntax or Multi-Byte Emojis

- **Prohibited:** Emojis, Unicode symbols, ASCII drawings, and horizontal rules (`---` or `***`) outside the frontmatter header.
- **Permitted:** Standard ASCII characters and functional Markdown headings (`#`, `##`) and list items (`-`).
- **Rationale:** Emojis require multiple bytes and multiple tokens. Decorative drawings reduce attention accuracy.

### Rule 2: Compact Delimited Records Over Markdown Tables

- **Prohibited:** Multi-column Markdown tables with pipe borders and alignment separator rows (`| :--- | :--- |`).
- **Permitted:** Single-line pipe-delimited key-value records:
  ```text
  Core (Layer 0): src/core/index.ts -> deps: none | caps: auth, routing
  ```
- **Rationale:** Markdown table delimiters consume 20 to 50 percent of tokens without adding semantic data.

### Rule 3: Single-Occurrence Path References

- **Prohibited:** Redundant link labels: `[Auth Service](src/auth/service.ts)`.
- **Permitted:** Direct file path anchors: `[src/auth/service.ts]` or bare paths `src/auth/service.ts`.
- **Rationale:** Duplicate strings waste token memory.

### Rule 4: Strict ASD-STE100 Grammar Primacy

- **Rule:** Agent-first files must obey all ASD-STE100 rules.
- **Rules Enforced:**
  - Keep sentences less than 20 words for instructions and 25 words for descriptions.
  - Do not use semicolons. Split thoughts into separate sentences.
  - Do not use contractions or unapproved non-STE words.
  - Use active voice and simple present tense.

### Rule 5: Strict Two-Space Indentation and Single Line Breaks

- **Prohibited:** Multiple consecutive blank lines and four-space indentation.
- **Permitted:** Exactly one blank line between logical sections. Use two spaces for nested lists.

### Rule 6: Decouple Visual Documentation

- **Prohibited:** Mermaid diagrams (` ```mermaid `) in agent-facing architecture documents.
- **Permitted:** Put Mermaid diagrams in dedicated visual files (for example, `visual-map.md`).
- **Rationale:** Large diagram definitions crowd out working memory in agent context windows.

---

## 3. Configuration in `.talerc.json`

Create a `.talerc.json` file in the root directory to customize file matching:

```json
{
  "agentFirst": {
    "patterns": [
      "AGENTS.md",
      "RULES.md",
      "**/*context*",
      "knowledge/architecture/**",
      "**/*.spec.md"
    ],
    "exclude": ["README.md", "CONTRIBUTING.md", "CHANGELOG.md", "**/visual-*"]
  }
}
```
