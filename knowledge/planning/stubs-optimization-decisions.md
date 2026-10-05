---
title: stubs Standalone Optimization Decisions
type: decision-record
description: Decisions for optimizing stubs as a standalone install that incorporates the benefits of code-graph frameworks without referencing them.
date: 2026-10-05
status: settled
tags:
  - planning
  - architecture
  - decisions
  - optimization
---

# stubs Standalone Optimization — Decision Record

> **Marked:** Decisions refined and settled via architecture review and interactive grilling. Implementation plan order of work is in Section 5.

## Purpose

Establish how **stubs** can be optimized as one standalone install so that its use gives agents maximum efficiency and token reduction in codebases where it is applied — by adopting concepts that graphify-like code graphing provides, but built natively in stubs (zero references to `graphify/` or any external product).

## Verified Constraints

- **No external references:** Nothing implemented may reference graphify. All concepts must be built specifically for stubs.
- **Efficiency gate:** Every change must reduce token use or tool calls, or expand capability without increasing token footprint.
- **Optimize for ideal end state:** Nothing is in production; breaking changes and renames are not a cost.
- **Scope:** One standalone install — stubs should be the only option needed for maximum benefit.

## What This Gets Right

The existing stubs codebase already contains most of the machinery needed:

- `.stubs/graph.sqlite` schema already includes edge confidence tagging and `community_id` / `community_label` columns on sidecars (`src/graph/engine.ts`).
- `src/graph/topology.ts` already implements Louvain modularity community detection (`getCommunities()`) and architectural smell analysis (god nodes, dependency cycles, domain leaks).
- `GraphEngine.assignCommunities()` already exists to persist community assignments to SQLite, but is not yet wired into `stubs scan`.
- `src/graph/extractor.ts` extracts AST graphs using the TypeScript compiler API for JS/TS, and zero-dependency regex parsers for Python, Go, and Rust.
- `src/graph/engine.ts` already implements content-hash caching in `indexCodeWorkspace` and `indexWorkspace`.
- The CLI router already provides `stubs query "<question>"`, `stubs explain`, `stubs path`, and `stubs blast`.

The optimization is therefore mostly **activation, consolidation, and refinement** — not wholesale rebuild.

## Decisions

| ID       | Node                      | Decision                                                                                                                                                                                                                                                                                                                        | Rationale                                                                                                                                             | Reopen Condition                                                                    |
| -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Q1       | Confidence tagging        | Keep binary tagging (DECLARED/EXTRACTED vs. INFERRED); do **not** emit or wire an AMBIGUOUS tier                                                                                                                                                                                                                                | Simpler schema; no migration; AMBIGUOUS never emitted by extractors would be dead overhead                                                            | If an extractor legitimately needs a third, untrustworthy tier                      |
| Q2 / Q10 | Fast incremental scan     | Add filesystem modification time (`mtimeMs` via `stat`) checking to `file_meta` table in `stubs scan`; skip unchanged files before reading file bodies                                                                                                                                                                          | Bypasses disk I/O / file reading entirely; covers both source code files (which have no frontmatter) and markdown sidecars                            | If filesystem mtimes prove unreliable across environments or git checkouts          |
| Q3       | Framework-aware routing   | Build in Graph Engine (e.g. `src/graph/routes.ts` or extending `src/graph/extractor.ts`), leaving `ConceptEngine` dedicated to concept docs and filetree scaffolding. Ship **5** frameworks first (Express, FastAPI, Django, Flask, Gin), then expand                                                                           | Respects architectural boundaries and code cohesion; narrow first slice validates handler-to-route edges before expansion                             | If the first 5 frameworks fail to connect routes to handlers reliably in the graph  |
| Q4 / Q12 | Community analysis        | Wire the existing Louvain detection (`src/graph/topology.ts`) into `stubs scan` via `GraphEngine.assignCommunities()`, persisting `community_id` and labels into SQLite and surfacing in `stubs query`                                                                                                                          | Algorithm and SQLite schema already exist; wiring persistence into scan makes community clusters accessible to queries without recomputing on the fly | If persisted communities diverge significantly on incremental file changes          |
| Q7 / Q13 | Optional extras detection | Stubs currently relies on zero-dependency extractors; add runtime dynamic import (`try-import-and-catch`) detection for optional tree-sitter/native parsers, falling back gracefully to built-in parsers                                                                                                                        | Keeps default zero-dependency install while enabling higher-fidelity parsing when optional grammars are present                                       | If fallback messages create noise or prompt agents into unnecessary troubleshooting |
| Q9 / Q14 | Unified surgical query    | **This is the ROI target.** One unified entry point `stubs query`, supporting prefix syntax (`query "path: A to B"`, `query "explain: A"`, `query "blast: A"`) and explicit flags (`--path`, `--explain`, `--blast`), while keeping existing `stubs explain/path/blast` CLI commands as backward-compatible forwarding wrappers | Directly reduces agent tool calls and token budget; keeps full backward compatibility for existing scripts and agent workflows                        | If unified query routing introduces ambiguity or increases latency                  |
| Q5       | Multi-format docs         | Keep **code-only**; PDFs, images, and videos remain out of scope                                                                                                                                                                                                                                                                | OKF sidecar model is code-centric; binary doc formats would require OCR/transcription dependencies with high token overhead and no clear ROI          | If agents frequently need to trace from code to binary docs in stubs-applied repos  |
| Q6       | Default query             | Make `stubs query` the default first call for agents                                                                                                                                                                                                                                                                            | Eliminates decision overhead; aligns with unified surgical query (Q14)                                                                                | If empty-result fallback costs more than a direct specialized call                  |

**Dropped nodes:** AMBIGUOUS tier (Q1), standalone file-watcher sync daemon (Q2), all-17-frameworks-at-once (Q3), parallel community output file (Q4), installer-side optional extras (Q7), doc-format graph integration (Q5).

## Order of Work

1. **Q14 — Unified surgical query (Q9)** — The measurable-efficiency prize; unlocks `stubs query` as default (Q6), supporting both prefix strings and CLI flags with backward-compatible forwarding.
2. **Q10 — Fast incremental scan via filesystem mtimes (Q2/Q10)** — Instant skip for unchanged source files and sidecars without reading disk bodies.
3. **Q4 — Wire Louvain community persistence (Q4/Q12)** — Connect `GraphTopology.getCommunities()` to `GraphEngine.assignCommunities()` in `stubs scan` and expose community IDs in query results.
4. **Q3 — Framework-aware route extraction** — Implement route-to-handler graph edges under `src/graph/routes.ts` for Express, FastAPI, Django, Flask, and Gin.
5. **Q13 / Q7 — Runtime optional-extras detection** — Runtime detection for optional AST grammars with transparent fallback to built-in regex extractors.
6. **Q5** — Remain dropped; revisit only if traced demand emerges.

Security-critical item first: none of these changes touch authentication, authorization, or tenant boundaries; the highest blast radius is Q14 (CLI command parsing) which should be regression-tested against existing `stubs explain`/`stubs path`/`stubs blast` outputs.

## Non-Negotiables

- **No graphify references anywhere** — not in code, comments, imports, error messages, or telemetry. Every concept is stubs-native.
- **Measurement before adoption** — every efficiency claim (token savings, tool-call reduction, reindex time) is measured on a real repo and recorded in a dated benchmark note before the feature ships.
- **Token floor** — if any change increases average tokens per agent session, it is reverted regardless of capability gained.
- **Backward-compatible CLI** — unified `stubs query` must not break existing `stubs explain/path/blast` usage.
- **Schema discipline** — `community_id` uses the existing `.stubs/graph.sqlite` schema; no new top-level graph files.

## Audit Trail

- Source of intent: agent-vs-graphify comparison task, 2026-10-05.
- Codebase validation & refinement: verified against `src/graph/engine.ts`, `src/graph/topology.ts`, `src/graph/extractor.ts`, `src/concept/engine.ts`, `src/cli/router.ts`.
- Refinements settled via `/grill-me` review on 2026-10-05:
  1. Framework routing assigned to Graph Engine (`src/graph/routes.ts`), preserving `ConceptEngine` cohesion.
  2. Louvain & `community_id` recognized as already implemented; task refocused on wiring persistence into `stubs scan`.
  3. Incremental scan refined to use `stat` mtime caching in `file_meta` table.
  4. Grammar loaders clarified as dynamic optional imports over existing zero-dependency parsers.
  5. Unified query supports both prefix parsing and flags with backward-compatible aliases.
