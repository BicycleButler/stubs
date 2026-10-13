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

---

## 1. The Eight Non-Negotiable STE Rules

1. **One Word, One Meaning, One Part of Speech:** Use approved words only as their specified part of speech. Do not use technical nouns as verbs.
2. **Strict Semicolon Prohibition:** Semicolons (`;`) are **strictly prohibited**. Always split compound thoughts into separate sentences with periods (`.`).
3. **No Contractions or Omissions:** Never use contractions (_do not_, _cannot_, _is not_). Never omit articles (_a_, _an_, _the_) or demonstratives (_this_, _these_).
4. **Sentence Word Limits:**
   - **Maximum 20 words** for procedural instructions (commands).
   - **Maximum 25 words** for descriptive sentences.
5. **Strict Active Voice & Simple Tenses:** Write in the active voice. Use only Infinitive, Imperative, Simple Present, Simple Past, and Simple Future (_will_).
6. **No Progressive "-ing" Verbs:** Never use "-ing" words as progressive action verbs (`is running`, `was opening`). Use "-ing" words only as technical nouns (`the bearing`) or modifiers (`cooling system`).
7. **Multi-Word Noun Limit:** Multi-word nouns must not exceed **three words** (for example, _APU shutoff valve_).
8. **Paragraph Limits:** Maximum of **one topic** and **six sentences** per paragraph.

---

## 2. Fast Reference Routing

When crafting text, consult these specialized sub-references:

| Topic                             | Reference Document                                                                         | Key Focus Areas                                              |
| :-------------------------------- | :----------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **All Writing Rules**             | [references/rules_summary.md](references/rules_summary.md)                                 | Full rules for Part 1 (Sections 1–9, GR-1 thru GR-8)         |
| **Recurring Errors & Vocabulary** | [references/dictionary_recurring_errors.md](references/dictionary_recurring_errors.md)     | 40+ non-STE words and approved replacements                  |
| **Approved Verbs Index**          | [references/approved_verbs.md](references/approved_verbs.md)                               | Exhaustive list of all approved STE verbs                    |
| **Punctuation & Word Counting**   | [references/word_count_and_punctuation.md](references/word_count_and_punctuation.md)       | Punctuation limits, units counting as 1 word                 |
| **Transformation Recipes**        | [references/transformation_guide.md](references/transformation_guide.md)                   | Before/after pairs for architecture docs, PRs, and notes     |
| **Code & Identifier Standards**   | [references/code_and_identifier_standards.md](references/code_and_identifier_standards.md) | Identifier names, <=3-word noun clusters, TSDoc comments     |
| **Agent-First Profile (ADR-001)** | [references/agent_first_representation.md](references/agent_first_representation.md)       | Token-optimal syntax for context maps, records, and sidecars |

---

## 3. High-Impact Quick Replacement Matrix

| Non-STE Word / Phrasing        | Approved STE Equivalent                     | Example Revision                                  |
| :----------------------------- | :------------------------------------------ | :------------------------------------------------ |
| `acceptable` _(adj)_           | **PERMITTED** _(adj)_                       | "A delay of 5 ms is permitted."                   |
| `check` _(verb)_               | **CHECK** _(noun)_ / **EXAMINE** _(verb)_   | "Do a check of the response payload."             |
| `ensure` _(verb)_              | **MAKE SURE** _(verb)_                      | "Make sure that the database connection is open." |
| `perform` / `execute` _(verb)_ | **DO** _(verb)_                             | "Do the migration script."                        |
| `rotate` _(verb)_              | **TURN** _(verb)_                           | "Turn the dial clockwise."                        |
| `should` / `shall` _(verb)_    | **MUST** _(verb)_                           | "The client must send the authentication token."  |
| `since` _(as because)_         | **BECAUSE** _(conj)_                        | "Because the lock expired, the task aborted."     |
| `therefore` _(adv)_            | **THUS** _(adv)_ / **AS A RESULT**          | "Thus, the transaction rolls back."               |
| `under` _(for values)_         | **LESS THAN** / **BELOW**                   | "When latency is less than 50 ms..."              |
| `using` / `utilize` _(verb)_   | **USE** _(verb)_ / **WITH** _(prep)_        | "Use the CLI tool to inspect the state."          |
| `e.g.`, `i.e.`, `etc.`         | **for example**, **that is**, **and so on** | Replace all Latin abbreviations.                  |

---

## 4. Automated CLI Linter

Validate markdown files, directories, text strings, or code comments against ASD-STE100 Issue 9 rules with zero third-party dependencies:

```bash
# Validate all markdown documentation across current repository (default)
node .agents/skills/tale/scripts/tale-lint.mjs

# Automatically fix safe violations (contractions, Latin terms, ensure -> make sure that)
node .agents/skills/tale/scripts/tale-lint.mjs --fix
node .agents/skills/tale/scripts/tale-lint.mjs --fix docs/

# Validate markdown documentation files or directories
node .agents/skills/tale/scripts/tale-lint.mjs knowledge/architecture/CONTEXT-MAP.md
node .agents/skills/tale/scripts/tale-lint.mjs knowledge/architecture/

# Validate code comments and docstrings in TypeScript/JavaScript files
node .agents/skills/tale/scripts/tale-lint.mjs src/modules/shopify-sync/
node .agents/skills/tale/scripts/tale-lint.mjs --code src/

# Validate both documentation and code comments
node .agents/skills/tale/scripts/tale-lint.mjs --all src/ docs/

# Validate a text or comment snippet directly
node .agents/skills/tale/scripts/tale-lint.mjs --text "Make sure that the register records positive integer cents."
node .agents/skills/tale/scripts/tale-lint.mjs --text "// Make sure that the database connection is open."

# Output structured JSON report
node .agents/skills/tale/scripts/tale-lint.mjs knowledge/architecture/ --json
```

---

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

---

## 6. Agent Execution Loop

When generating responses or authoring documentation in this repository:

1. **Analyze:** Check sentence word lengths (<=20 / <=25), scan for semicolons, scan for unapproved words or passive voice.
2. **Replace:** Convert unapproved terms using [references/dictionary_recurring_errors.md](references/dictionary_recurring_errors.md) and [references/approved_verbs.md](references/approved_verbs.md).
3. **Refactor:** Convert passive structures to active voice, put conditions first for instructions, and split compound sentences into single-topic sentences.
4. **Verify:** Run `node .agents/skills/tale/scripts/tale-lint.mjs <file>` on authored markdown files or code comments.

---

## 7. Agent Reasoning & Internal Monologue Standard

When generating internal thoughts or reasoning:

1. **Bullet Points Only:** Use 2 to 4 bullet points per thought block.
2. **Telemetric Cadence:** Report `State`, `Intent`, `Action`, and `Check`.
3. **Zero Conversational Fluff:** Prevent conversational preamble, rhetorical debates, or copying full files into thoughts.
4. **Sentence Limit:** Keep each bullet sentence less than 20 words.

---

## 8. Code Authoring & Identifier Naming Standard

When authoring code:

1. **Action-First Functions:** Start function names with an approved action verb (for example, `calculateTotal()`, `validateInput()`).
2. **Noun Cluster Cap:** Identifiers and variables must not exceed three words.
3. **Comments in Simple Present Tense:** Write comments in active voice stating _why_ code exists. Prohibit semicolons and contractions in comments.

---

## 9. Agent-First Profile & Token Optimization (ADR-001)

When authoring architecture records, context maps, and module sidecars:

1. **No Decorative Elements:** Prohibit emojis, Unicode symbols, and ASCII art.
2. **Compact Records:** Use single-line pipe-delimited records instead of multi-column Markdown tables.
3. **Single-Occurrence Links:** Use direct path anchors (for example, `[src/auth.ts]`) without duplicate labels.
4. **Strict STE Primacy:** Keep sentences short, active, and fully compliant with ASD-STE100 rules.
5. **Indentation and Spacing:** Use two spaces for indentation and single blank lines between sections.
6. **Decouple Visual Artifacts:** Place Mermaid diagrams in separate files (for example, `visual-map.md`).
