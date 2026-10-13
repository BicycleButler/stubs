---
title: Token-Optimal Code Intelligence — Architectural Plan & Decision Record
type: initiative-plan
initiative: token-optimal-intelligence
description: Master architectural blueprint to make stubs the category-leading codebase search and navigation platform for AI coding agents, maximizing token efficiency with zero LLM indexing.
status: implemented
phase: sand
date: 2026-10-12
tags:
  - planning
  - graph
  - query
  - token-efficiency
  - tree-sitter
  - monorepo
---

# Token-Optimal Code Intelligence — Architectural Plan & Decision Record

## 1. Goal

Make `stubs` the most efficient tool for agent search. Minimize token usage with zero LLM calls for mapping, indexing, and search.

## 2. Settled Decisions (Outcome of `/grill-me` Review)

- ID | Decision | Details
- **D1** | **Hybrid Multi-Tier Navigation** | 3-level progressive disclosure (`map:` -> `stub:` -> `explain:`) combined with one-shot surgical operations (`path:`, `blast:`, `pkg:`).
- **D2** | **Universal Tree-sitter AST Engine** | Replace regex parsers with deterministic Tree-sitter CST queries across all tier-1 languages (TS/JS, Python, Go, Rust, Java, C/C++) with zero LLM calls and zero compiler dependencies.
- **D3** | **Deterministic Hybrid Search** | SQLite FTS5 (BM25 + trigram) combined with PageRank / graph centrality boost. Sub-millisecond local retrieval prioritizing core entrypoints over private helpers.
- **D4** | **Skeleton-First "Stub" Compression** | Extract interfaces and signatures while stripping function bodies to `...`, linking exact line ranges (`file.ts#L24-L60`), achieving 80–90% token reduction.
- **D5** | **Ultra-Lean MCP Surface** | Expose only 2 tools (`stubs_query` and `stubs_scan`) to keep the MCP schema footprint under 200 tokens per turn, paired with a sub-250-token `AGENTS.md` anchor.
- **D6** | **Centrality-Guided Pruning** | Default 1,000-token budget cap. Prioritizes seed matches, entrypoints, and direct callers/callees. Collapses distant/low-centrality nodes into compact one-line tallies (`+ 8 internal callers`).
- **D7** | **Lazy Auto-Sync on Query** | Check filesystem `mtimeMs` (<30ms) before query execution and re-parse only changed files, guaranteeing 0% graph staleness without requiring manual scans or daemons.
- **D8** | **Best-in-Breed Synthesis** | Unify GitNexus (blast radius & call chains), CodeGraph (fast shortest path), Graphify (Louvain clustering, God Nodes, smell checks, Obsidian export), and Stubs (skeleton stubs, OKF sidecars, lazy mtime auto-sync, FTS5 BM25).
- **D9** | **Workspace-Aware Monorepo Scoping** | Auto-detect monorepo workspaces (pnpm, npm, Cargo, Go, Turborepo, Nx) with package-scoped queries (`query "pkg:web auth"`) to prune 90%+ irrelevant cross-package context.
- **D10** | **Canonical Workspace Alias Resolution** | Resolve `tsconfig.json` paths, `package.json` exports/workspaces, `Cargo.toml` paths, and `go.work` to canonical source files for seamless cross-package blast radius and call paths.
- **D11** | **Agent-First Documentation (ADR-001)** | Enforce token-optimal syntax across all agent-consumed architecture documents, context maps, and query outputs: eliminate decorative markdown tables, multi-byte emojis, ASCII art, and conversational prose. Decouple visual Mermaid diagrams to `visual-map.md`.
- **D12** | **Dynamic Graph Architecture Mapping** | Replace static template scaffolding in `stubs map` with dynamic AST/Louvain graph synthesis. Auto-generate dense ADR-001 context maps (`stubs map --generate`), decouple Mermaid diagrams (`stubs map --visual`), and audit documentation against ADR-001 rules.

## 3. Implementation Phases

1. **Phase 1: Universal Tree-sitter & Workspace Alias Engine** [Complete]
   - [x] Integrate `web-tree-sitter` / polyglot CST extractors for TS/JS, Python, Go, Rust.
   - [x] Upgrade `src/graph/extractor.ts` to execute deterministic CST queries for definitions, references, calls, and imports.
   - [x] Implement monorepo package discovery and canonical alias path resolution in `src/graph/workspace.ts`.

2. **Phase 2: SQLite FTS5 BM25 + PageRank Authority Search** [Complete]
   - [x] Provision SQLite FTS5 table with trigram tokenizer in `src/graph/engine.ts`.
   - [x] Implement PageRank and degree centrality calculation in `src/graph/topology.ts`.
   - [x] Fuse BM25 lexical match scores with PageRank authority weights in `src/query/engine.ts`.

3. **Phase 3: Skeleton "Stub" Generator & Centrality Budget Pruner** [Complete]
   - [x] Implement AST body-stripper in `src/graph/skeleton.ts` producing compact type contracts with line links.
   - [x] Implement centrality-guided pruning algorithm in `src/query/engine.ts` enforcing the 1,000-token default budget.

4. **Phase 4: Lazy Auto-Sync & Lean Agent Tool Surfaces** [Complete]
   - [x] Wire `mtimeMs` check into `src/query/engine.ts` for instant incremental sync.
   - [x] Expose `stubs_query` and `stubs_scan` in `src/server/mcp.ts` with backward compatibility for legacy tool calls.
   - [x] Update `src/cli/router.ts` and automated `AGENTS.md` macro router.

5. **Phase 5: Benchmark & Verification** [Complete]
   - [x] Full test suite: 46 test suites passing (248 tests).
   - [x] ESLint & Prettier: 0 errors, 0 warnings.
   - [x] Measured benchmark verification: documented in [token-optimal-benchmark-2026-10-12.md].

6. **Phase 6: Agent-First Documentation & Dynamic Graph Mapping (`stubs map`)** [Complete]
   - [x] Author generic language-agnostic [../architecture/ADR/ADR-001-agent-first-documentation.md].
   - [x] Decouple human Mermaid visual diagram to `knowledge/architecture/visual-map.md`.
   - [x] Rewrite repository `knowledge/architecture/context-map.md` using ADR-001 dense key-value schema (saving ~75% tokens).
   - [x] Implement dynamic graph-derived context map generation and ADR-001 auditing in `src/cli/router.ts` (`handleMap`).
   - [x] Clean decorative emojis and box-drawing syntax from `src/query/engine.ts` and `src/graph/topology.ts`.
   - [x] Verify test suite (46 suites, 248 tests) and compile CLI bundle (`.agents/skills/stubs/dist/cli.cjs`).
