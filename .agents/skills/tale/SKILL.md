---
name: tale
description: >-
  Enforces ASD-STE100 Issue 9 Simplified Technical English (STE) rules across AI agent
  communication, codebase documentation, architecture records, commit messages, and PRs.
  Use this skill when authoring or reviewing documentation, checking STE compliance,
  or running the STE linter.
---

# ASD-STE100 Issue 9 Simplified Technical English (STE)

This skill governs the written communication style for **AI agents, code comments, architecture records, pull request descriptions, and user-facing reports**.

All documentation and agent output must obey the writing rules and controlled vocabulary defined in **ASD-STE100 Issue 9 (January 15, 2025)** ([resources/ASD-STE100_ISSUE9.pdf](resources/ASD-STE100_ISSUE9.pdf)).

## 1. The Eight Non-Negotiable STE Rules

1. **One Word, One Meaning, One Part of Speech:** Use approved words only as their specified part of speech. Do not use technical nouns as verbs.
2. **Strict Semicolon Prohibition:** Semicolons (`;`) are **strictly prohibited**. Always split compound thoughts into separate sentences with periods (`.`).
3. **No Contractions or Omissions:** Never use contractions (_do not_, _cannot_, _is not_). Never omit articles (_a_, _an_, _the_) or demonstratives (_this_, _these_).
4. **Sentence Word Limits:**
   - **Maximum 20 words** for procedural instructions (commands).
   - **Maximum 25 words** for descriptive sentences.
5. **Strict Active Voice & Simple Tenses:** Write in the active voice. Use only Infinitive, Imperative, Simple Present, Simple Past, and Simple Future (_will_).
6. **No Progressive "-ing" Verbs:** Never use "-ing" words as progressive action verbs (`runs`, `was opening`). Use "-ing" words only as technical nouns (`the bearing`) or modifiers (`cooling system`).
7. **Multi-Word Noun Limit:** Multi-word nouns must not exceed **three words** (for example, _APU shutoff valve_).
8. **Paragraph Limits:** Maximum of **one topic** and **six sentences** per paragraph.

## 2. Fast Reference Routing

When crafting text, consult these specialized sub-references:

- Topic | Reference Document | Key Focus Areas
- **All Writing Rules** | [references/rules_summary.md](references/rules_summary.md) | Full rules for Part 1 (Sections 1–9, GR-1 thru GR-8)
- **Recurring Errors & Vocabulary** | [references/dictionary_recurring_errors.md](references/dictionary_recurring_errors.md) | 40+ non-STE words and approved replacements
- **Approved Verbs Index** | [references/approved_verbs.md](references/approved_verbs.md) | Exhaustive list of all approved STE verbs
- **Punctuation & Word Counting** | [references/word_count_and_punctuation.md](references/word_count_and_punctuation.md) | Punctuation limits, units counting as 1 word
- **Transformation Recipes** | [references/transformation_guide.md](references/transformation_guide.md) | Before/after pairs for architecture docs, PRs, and notes
- **Code & Identifier Standards** | [references/code_and_identifier_standards.md](references/code_and_identifier_standards.md) | Identifier names, <=3-word noun clusters, TSDoc comments
- **Agent-First Profile (ADR-001)** | [references/agent_first_representation.md](references/agent_first_representation.md) | Token-optimal syntax for context maps, records, and sidecars

## 3. High-Impact Quick Replacement Matrix

- Non-STE Word / Phrasing | Approved STE Equivalent | Example Revision
- `permitted` _(adj)_ | **PERMITTED** _(adj)_ | "A delay of 5 ms is permitted."
- `check` _(verb)_ | **CHECK** _(noun)_ / **EXAMINE** _(verb)_ | "Do a check of the response payload."
- `make sure that` _(verb)_ | **MAKE SURE** _(verb)_ | "Make sure that the database connection is open."
- `do` / `execute` _(verb)_ | **DO** _(verb)_ | "Do the migration script."
- `turn` _(verb)_ | **TURN** _(verb)_ | "Turn the dial clockwise."
- `must` / `must` _(verb)_ | **MUST** _(verb)_ | "The client must send the authentication token."
- `since` _(as because)_ | **BECAUSE** _(conj)_ | "Because the lock expired, the task aborted."
- `therefore` _(adv)_ | **THUS** _(adv)_ / **AS A RESULT** | "Thus, the transaction rolls back."
- `under` _(for values)_ | **LESS THAN** / **BELOW** | "When latency is less than 50 ms..."
- `using` / `use` _(verb)_ | **USE** _(verb)_ / **WITH** _(prep)_ | "Use the CLI tool to inspect the state."
- `for example,.`, `that is,.`, `and so on.` | **for example**, **that is**, **and so on** | Replace all Latin abbreviations.

## 4. Unified CLI Orchestrator

Audit and auto-remediate all repository Markdown files and source code comments against ASD-STE100 Issue 9 and ADR-001 rules:

```bash
# Audit both documentation and code comments across the entire project
npx stubs tale
npm run tale

# Automatically remediate language, formatting, tables, box frames, and prose semicolons
npx stubs tale --fix
npm run tale:fix

# Audit or format specific target files or directories
npx stubs tale docs/
npx stubs tale --fix src/

# Audit or format direct inline text string
node packages/tale/src/tale.mjs -t "Your text string"
node packages/tale/src/tale.mjs -t "Your text string" --fix

# Output structured JSON report
npx stubs tale --json

# Output compact, token-optimized JSON worklist with exact targets and suggested fixes for AI agents
npx stubs tale --agent
```

## 5. Universal Installation

To install this skill into another repository or globally on your machine:

```bash
# Install directly from remote repository into current project
curl -fsSL https://raw.githubusercontent.com/BicycleButler/stubs/main/packages/tale/skill/scripts/install.sh | bash

# Install locally to a specific target project
bash .agents/skills/tale/scripts/install.sh --project /path/to/project

# Install globally for all repositories (~/.gemini/config/skills/tale)
bash .agents/skills/tale/scripts/install.sh --global
```

## 6. Token-Optimized Agent Remediation Loop

When generating responses, authoring documentation, or writing code comments in this repository:

1. **Write Plain STE:** Follow the Eight Non-Negotiable Rules (short active sentences, no semicolons, no contractions, <=3-word noun clusters).
2. **Auto-Remediate:** Run `npx stubs tale --fix` (or `npm run tale:fix`) to repair language, formatting, safe vocabulary, code comment keywords, and markdown tables automatically.
3. **Inspect Remaining Items with Zero File-Reading Overhead:** If violations remain, run `npx stubs tale --agent`.
   - Each item includes `file`, `line`, `target` (the exact sentence), and `suggestedFix`.
   - Apply `replace_file_content` directly using `target` and `suggestedFix` without reading the whole file with `view_file`.
4. **Verify Compliance:** Run `npx stubs tale` (or `npm run tale`) and confirm zero remaining violations across all scanned files.

## 7. Agent Reasoning & Internal Monologue Standard

When generating internal thoughts or reasoning:

1. **Bullet Points Only:** Use 2 to 4 bullet points per thought block.
2. **Telemetric Cadence:** Report `State`, `Intent`, `Action`, and `Check`.
3. **Zero Conversational Fluff:** Prevent conversational preamble, rhetorical debates, or copying full files into thoughts.
4. **Sentence Limit:** Keep each bullet sentence less than 20 words.

## 8. Code Authoring & Identifier Naming Standard

When authoring code:

1. **Action-First Functions:** Start function names with an approved action verb (for example, `calculateTotal()`, `validateInput()`).
2. **Noun Cluster Cap:** Identifiers and variables must not exceed three words.
3. **Comments in Simple Present Tense:** Write comments in active voice stating _why_ code exists. Prohibit semicolons and contractions in comments.

## 9. Agent-First Profile & Token Optimization (ADR-001)

Enforce across all repository Markdown files and sidecars (excluding only `README.md` and `QUICKSTART.md`):

1. **No Decorative Elements or ASCII Art:** Prohibit emojis, Unicode box-drawing, ASCII box diagrams, and decorative dividers outside frontmatter.
2. **Compact Records:** Multi-column Markdown tables are strictly prohibited. Use single-line pipe-delimited records (`- Col1 | Col2 | Col3`) instead of table rows and alignment dividers (`:--`).
   - Run `npx stubs tale --fix` or `npm run tale:fix` to convert tables automatically.
3. **Single-Occurrence Links:** Use direct path anchors (for example, `[src/auth.ts]`) without duplicate labels.
4. **Strict STE Primacy:** Keep sentences short, active, and fully compliant with ASD-STE100 rules.
5. **Indentation and Spacing:** Use two spaces for indentation and single blank lines between sections.
6. **Decouple Visual Artifacts:** Place Mermaid diagrams in separate files (for example, `visual-map.md`).
