---
title: ADR-001 — Agent-First Documentation and Context Representation Standards
status: accepted
date: 2026-10-12
type: architecture-decision
tags:
  - adr
  - token-optimization
  - agent-efficiency
  - documentation
  - context-representation
---

# ADR-001: Agent-First Documentation & Context Representation Standards

## 1. Context & Problem Statement

AI coding agents spend 60–80% of their operational token budget reading and navigating repository documentation, context maps, and specifications. Conventional software documentation is authored for human visual reading, relying on decorative elements, prose explanations, and complex markdown structures:

- Heavy markdown tables require leading/trailing pipes and alignment divider rows (`| :--- | :--- |`), consuming 20–30% of table tokens on syntax delimiters alone.
- Visual diagrams (Mermaid, ASCII art) consume hundreds of tokens while providing low extraction accuracy for agents.
- Decorative emojis (`🗺️`, `🧩`, `🔥`) cost 2–4 tokens per character due to multi-byte unicode tokenization.
- Conversational prose ("is designed to provide functionality for...") inflates token consumption with zero semantic value.
- Redundant link syntax (`[Name](path/to/Name.ts)`) duplicates symbol names across anchor and path.

When scaling autonomous agent workflows, this overhead inflates context windows, crowds out working memory, and slows down inference turns.

## 2. Decision

All agent-consumed architecture documents, context maps, module sidecars, and system briefs MUST follow an **agent-first, token-optimal syntax**. Human visual documentation (Mermaid, architectural graphics, rendered portals) must be strictly decoupled into separate human-targeted files (e.g. `visual-map.md`, portal dashboards) and explicitly excluded from default agent retrieval prompts.

## 3. Formatting Standards & Rules (Generic Specification)

Any software application adopting this standard must adhere to the following 7 rules for agent-facing files:

### Rule 1: No Decorative Syntax or Multi-Byte Emojis

- **Prohibited:** Emojis, Unicode decorative symbols, box-drawing ASCII art (`┌───┐`), decorative quotes, and horizontal divider rules (`---`, `***`).
- **Permitted:** Standard ASCII characters and functional structural markdown (`#`, `##`, `-`).

### Rule 2: Compact Delimited Records Over Markdown Tables

- **Prohibited:** Multi-column markdown tables with pipe borders and alignment separator rows.
- **Format:** Pipe-delimited key-value single-line records:
  ```text
  <Domain> (Layer <N>): <hub_file_path> -> deps: <dep1>, <dep2> | caps: <cap1>, <cap2>
  ```
- **Rationale:** Reduces syntax overhead by 40–55% per record while maintaining 100% deterministic key-value extraction across all transformer architectures.

### Rule 3: Single-Occurrence Path References

- **Prohibited:** Redundant link labels: `[Auth Service](src/auth/service.ts)`.
- **Format:** Direct file or symbol path anchors: `[src/auth/service.ts]` or bare POSIX paths `src/auth/service.ts`.
- **Rationale:** Cuts 5–8 tokens on every cross-reference by eliminating duplicate string tokens.

### Rule 4: Telegraphic Phrasing (Zero Prose Glue)

- **Prohibited:** Narrative passive filler ("is responsible for the orchestration of", "in order to allow consumers to", "which enables").
- **Format:** Telegraphic noun and imperative verb phrases:
  ```text
  # Prohibited (14 tokens):
  The auth service provides functionality to verify JWT tokens and manage user sessions.

  # Permitted (6 tokens):
  AuthService: verify JWT tokens, manage sessions
  ```

### Rule 5: Strict 2-Space Indentation and Single Line Breaks

- **Prohibited:** Multiple consecutive blank lines (`\n\n\n`) and 4-space indentation.
- **Format:** Exactly one blank line between logical sections; 2 spaces for nested lists.

### Rule 6: Standard Vocabulary Shorthand (No Sub-Word Split Abbreviations)

- **Permitted:** Standard industry single-token shorthand: `auth`, `config`, `deps`, `spec`, `repo`, `init`, `db`, `fs`.
- **Prohibited:** Idiosyncratic or non-standard abbreviations that force tokenizer sub-word splits: `cfg` (splits into `c`+`fg`), `ath` (`a`+`th`), `svce`.
- **Rule:** If unsure, use standard English base words.

### Rule 7: Decouple Visual Documentation

- Visual Mermaid diagrams, sequence flows, and graphical charts must live in dedicated files with names indicating human intent (e.g. `visual-map.md`, `diagrams/`).
- Master agent routing instructions (e.g. `AGENTS.md`) must direct agents to read the dense agent-optimized document and ignore visual files unless explicitly requested by a user.

## 4. Consequences & Token Impact

- **Token Consumption:** Achieves 50–70% reduction in total token footprint across architecture context files.
- **Agent Accuracy:** Improves reasoning and retrieval precision by eliminating syntax noise and maximizing semantic signal density per attention window.
- **Portability:** Completely agnostic of programming language, framework, or model provider.
