---
title: Improving stubs — Doc Accuracy & AI Agent Integration
type: concept-doc
description: >-
  Grill-driven concept document addressing two improvement tracks: (1) fixing
  false claims about mandatory 1:1 sidecar pairing, and (2) deepening AI agent
  integration beyond passive hook rules toward active graph-driven agentic loops.
tags:
  - concept
  - documentation
  - ai-agents
  - sidecar
  - roadmap
status: spec
version: 1
---

# Improving `stubs` — Two Focus Areas

## 1. Documentation Accuracy: Sidecar Optionality

### Problem Statement & Context

The docs in `knowledge/ARCHITECTURE.md` (line 11) and `src/INDEX.md` (line 150)
claim:

> "Every `.ts` production file is paired 1:1 with a `.ts.md` sidecar"

This is **false**. On disk in this very repo, 11 of 44 `.ts` source files have
no sidecar (e.g., `src/cli.ts`, `src/index.ts`, `src/server/mcp.ts`,
`src/graph/wasmEngine.ts`, `src/web/shims.ts`). The code itself acknowledges
"code-only workspaces" at `src/cli/router.ts:752`:

```
ℹ No sidecars with target_code_file found under "src". Code-only workspace is up to date.
```

### Options

**A. Correct docs to say sidecars are optional, with a "coverage ratio" metric**
Then document the *actual* behavior: sidecars are optional per project; the
framework supports three modes:
- Full sidecar coverage (spec → code dual-file workflow)
- Partial coverage (some modules have sidecars, others are code-only)
- No sidecars at all (code-only graph indexing, `stubs query`, `stubs explain`, `stubs blast`)

**B. Enforce the 1:1 rule programmatically** (i.e., make docs match code by adding
a lint rule / audit check that flags unpaired files)
This would break existing code-only usage and would be a regression for
developers who just want the graph/AI benefits without writing sidecars.

➡️ **Recommended: A** — Sidecars are an opt-in specification layer. The graph
engine, MCP server, and AI agent hooks all work without sidecars. The docs
should reflect this accurately and explain when sidecars add value (materialization,
sanding reconciliation, grill-driven design, mock scaffolding, architectural linting).

### Falsifier

If the framework truly required 1:1 pairing, then `stubs scan` on a code-only
repo would fail or warn. It does not — it silently indexes code-only files and
reports "Code-only workspace is up to date."

### Related Decisions

- `router.ts` line 752 explicitly handles the no-sidecar case gracefully
- `extractor.ts` indexes both `.ts` files and `.md` sidecars independently
- `handleDiffArch` (line 2802) iterates over `getAllSidecars()` — it only checks
  sidecars that exist, not all code files

---

## 2. AI Agent Integration: From Reactive Hooks to Proactive Agentic Loops

### Problem Statement & Context

The current AI agent integration is limited to **passive hook rules**:

1. **IDE rules** (`.cursor/rules/stubs.mdc`, `CLAUDE.md`, `AGENTS.md`) that tell
   agents to "run `npx stubs query` before reading files" — a *suggestion*, not
   an enforcement.

2. **MCP server** (`src/server/mcp.ts`) exposing 9 tools (`stubs_query`,
   `stubs_explain`, `stubs_blast`, `stubs_path`, `stubs_communities`,
   `stubs_plan_order`, `stubs_blast_guard`, `stubs_tiered_context`,
   `stubs_lint_arch`) — but these are *consumed by* agents, not embedded *in*
   the agent loop itself.

3. **Git hooks** that auto-run `stubs scan` on file changes — keeps the graph
   fresh but doesn't drive agent behavior.

The core gap: `stubs` provides excellent *intelligence* (GraphRAG, blast radius,
topological ordering) but doesn't *integrate* that intelligence into an agent's
decision-making loop. An AI agent using `stubs` still has to manually call
`stubs query`, `stubs impact`, etc. — the framework can't prevent the agent from
making a risky edit or guide it on edit ordering.

### Options

**A. Enhance the MCP server with "pre-action guardrails"**
Add MCP tools that agents explicitly call *before* making edits:
- `stubs_pre_flight(target)` — checks blast radius, cycles, layer violations,
  and returns a risk assessment + recommended edit order
- `stubs_validate_edit(proposed_changes)` — validates a proposed diff against
  architecture rules before the agent writes it

**B. Hook into the autonomy protocol**
The `AutonomyProtocol` (`src/autonomy/protocol.ts`) already has a 3-tier
autonomy matrix. Extend it so that when an AI agent is configured at
`guided_execution` or `strict_gate`, the MCP server can *intercept* and
*approve/reject* proposed code changes based on graph analysis.

**C. Build a Hermes sub-agent that operates *through* stubs**
Create a dedicated agent persona that always routes through `stubs query` for
context gathering, `stubs blast` for impact analysis, and `stubs phase` for
lifecycle gating — making the graph a *hard prerequisite* for action, not
a suggestion.

➡️ **Recommended: A (CLI variant) + C** — Add a `stubs pre-flight` CLI command (A, CLI-based
not MCP) that agents invoke as a pre-edit gate, and package it into a Hermes skill/sub-agent
workflow (C) that makes graph consultation mandatory before code changes. The CLI approach
avoids MCP token overhead — scripts do not cost tokens and always deliver consistent results.

### Falsifier

The current `stubs hook install` rule says "Before reading multiple raw source
files... run `npx stubs query`." This is advisory. If it were truly integrated,
bypassing the graph would either (a) be impossible within the agent framework,
or (b) cause an explicit warning/error that blocks the action.

### Open Questions

1. Should `stubs` expose its graph analysis as a *service* that agents query
   via a standardized protocol (e.g., extending MCP), or should it embed agent
   logic directly?

2. What's the right autonomy level for the agent — should `stubs` gate code edits
   based on blast radius, or just inform?

3. Should the web portal integrate a "live agent session" view showing graph
   queries and blast radius as the agent works?

---

## Implementation Status

### Phase 1: ✅ Documentation fixes complete

Corrected false "every .ts file has a sidecar" claims in:
- `knowledge/ARCHITECTURE.md` — replaced mandatory "paired 1:1" with three-mode framework (full/partial/code-only)
- `src/INDEX.md` — replaced mandatory pairing claim with optional sidecar text
- `knowledge/architecture/context-map.md` — replaced "Specification as Single Source of Truth" with "Optional Specification Layer"
- `src/web/index.ts` — changed "All TypeScript files in the codebase have corresponding sidecar specifications!" to "No TypeScript files without sidecars found in workspace."

### Phase 2: ✅ MCP pre-flight tool implemented, then reverted to CLI per user directive

**Initial approach:** Added two new MCP tools to `src/server/mcp.ts` (`stubs_pre_flight`,
`stubs_autonomy_check`) with 5 tests in `tests/mcp-server.test.ts`. TypeScript compiled
cleanly, all 11 MCP tests passed.

**User directive:** *"I do not want the mCP server. I want CLI and script."* — reverted
MCP changes via `git checkout`.

**Final approach:** Replaced MCP tools with a CLI command `stubs pre-flight` (alias `stubs preflight`)
that combines all pre-flight checks into a single CLI entry point:

- **Blast Guard** — `topology.checkBlastGuard(target, threshold, depth)` for risk assessment
- **Tiered Agent Context** — `topology.getTieredAgentContext(target)` for L0/L1/L2 agent briefing (via `--context` flag)
- **Topological Edit Order** — `topology.getTopologicalEditOrder(files, direction)` for recommended edit sequence (via `--order <files...>`)
- **Autonomy Gate** — `protocol.evaluateAction('materialize_code')` checking the 3-tier autonomy matrix

Options: `--guard <level>`, `--depth <N>`, `--context`, `--order <files...>`, `--json`
Exit codes: `0` = all safe, `1` = error, `2` = blast guard or autonomy check failed (blocked)

Tests added to `tests/cli.test.ts`: 3 new tests (no target error, JSON pre-flight with context,
pre-flight with topological edit order). All 24 CLI tests pass. TypeScript compiles cleanly.
Full test suite: 236 passed, 1 pre-existing failure (`graph_optimizations.test.ts` — fails on
stashed/unchanged code too, unrelated to our changes).

### Phase 3: ⏳ Pending — Hermes agent-integration sub-skill

### Phase 4: ⏳ Pending — Integrate pre-flight check into `stubs hook install`
