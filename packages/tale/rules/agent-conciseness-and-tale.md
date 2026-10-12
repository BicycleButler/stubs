---
title: Agent Conciseness and Language Consistency Protocol
type: governance
status: active
version: 1
tags:
  - communication
  - ste
  - conciseness
  - standards
last_updated: '2026-09-14'
---

# Agent Conciseness and Language Consistency Protocol

All AI coding agents MUST obey this protocol across four operational domains: internal thoughts, user communication, code authoring, and documentation.

---

## 1. Internal Monologue & Reasoning Protocol ("Talking to Yourself")

When generating internal thoughts or reasoning before actions:

1. **Bullet Points Only:** Use 2 to 4 bullet points per thought block.
2. **Telemetric Structure:**
   - **State:** Current factual state or finding.
   - **Intent:** Immediate objective.
   - **Action:** Next tool call or code modification.
   - **Check:** Verification method.
3. **No Conversational Fluff:** Do not write polite phrases, philosophical debates, or hypothetical musings.
4. **No Full-File Echos:** Do not copy full file contents or large diff blocks into thoughts.
5. **Sentence Length:** Keep each bullet sentence less than 20 words.

---

## 2. User-Facing Response Protocol ("How You Respond")

When crafting responses to the user:

1. **Action-First Communication:** State the result or next step in the first sentence.
2. **No Polite Padding:** Prohibit filler words and preamble (for example: "Sure!", "Certainly!", "I would be happy to help you with that!").
3. **Clickable Links:** Always provide clickable markdown links with `file:///` URLs for all modified files, references, and code symbols.
4. **No Artifact Echoes:** When creating or updating an artifact, do not write the artifact contents in chat. Direct the user to the artifact.
5. **Bulleted Takeaways:** Use concise bulleted lists for findings and changes.

---

## 3. Code & Comment Language Protocol ("How You Write Code")

When writing TypeScript or JavaScript code:

1. **Function Names:** Use an action-first verb and noun combination (for example: `calculateSubtotal()`, not `subtotalCalculations()`).
2. **Multi-Word Noun Cap:** Multi-word nouns and variable names must not exceed three words (for example: `cartItemPrice`, not `cartItemOriginalRetailPrice`).
3. **Code Comments:**
   - Write all code comments and TSDoc summaries in the **Simple Present Tense** and active voice.
   - State _why_ the code exists, not _what_ the syntax does.
   - Semicolons (`;`) are strictly prohibited in comments. Split thoughts into separate sentences.
   - Contractions (such as `don't` or `can't`) are strictly prohibited in comments.
   - Use approved vocabulary from ASD-STE100 (for example: use `make sure that` instead of `ensure`).

---

## 4. Documentation & Specifications ("How You Write Files")

When authoring markdown files, ADRs, and commit messages:

1. **Procedural Instructions:** Maximum 20 words per sentence. Write steps in the imperative mood. Put conditions first.
2. **Descriptive Explanations:** Maximum 25 words per sentence. Group related ideas into paragraphs with a maximum of 6 sentences.
3. **No Semicolons or Contractions:** Always use periods (`.`) and full words (`do not`, `is not`).
4. **Controlled Vocabulary:** Consult `.agents/skills/tale/SKILL.md` and replace non-STE terms.
5. **Verification:** Run `npm run lint:tale` on modified markdown files before ending tasks.

---

## 5. Agent-First Architecture & Context Records (ADR-001)

When authoring architecture records, context maps, or module sidecars:

1. **No Decorative Syntax:** Prohibit emojis, Unicode icons, and ASCII art.
2. **Compact Records:** Use single-line pipe-delimited records instead of Markdown tables.
3. **Direct File Anchors:** Use single-occurrence path anchors (for example, `[src/auth.ts]`) without duplicate labels.
4. **Decouple Visual Diagrams:** Place Mermaid diagrams in separate files (such as `visual-map.md`).
5. **Strict Spacing:** Use two spaces for indentation and single blank lines between sections.
