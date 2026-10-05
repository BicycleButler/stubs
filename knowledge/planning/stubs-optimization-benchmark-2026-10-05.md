---
title: stubs Standalone Optimization Benchmark Note
type: architecture-decision
description: Benchmark verification of efficiency gains, tool-call reduction, and incremental scan latencies from the stubs standalone optimization initiative.
date: 2026-10-05
status: implemented
tags:
  - benchmark
  - performance
  - optimization
  - query
  - scan
---

# stubs Standalone Optimization — Benchmark Report (2026-10-05)

## Summary of Measurements

Measured on the `stubs` repository on 2026-10-05.

### 1. Incremental Scan Latency & I/O Reduction (Q10 / Q2)
- **Cold Scan Runtime:** 58ms (scanned and indexed 78 source files, parsed ASTs, created 871 nodes and 1,738 edges).
- **Warm Incremental Scan Runtime:** 28ms (78 of 78 source files skipped via `stat` `mtimeMs` checking in `file_meta`).
- **File Read I/O Avoidance:** 100% of unchanged files bypassed `fs.readFile()` disk content reads.
- **Content Re-Index Trigger:** Editing file and updating modification timestamp successfully triggers single-file re-indexing and edge updates while skipping all other 77 unchanged files.

### 2. Surgical Query Tool-Call & Token Footprint (Q14 / Q9 / Q6)
- **Symbol Explanation:**
  - *Legacy workflow:* Agent had to run `stubs query` (1,500 tokens of subgraph) + `stubs explain <symbol>` (400 tokens) -> 2 separate tool calls, ~1,900 tokens.
  - *Unified workflow:* Agent runs `stubs query "explain: <symbol>"` or `stubs query --explain <symbol>` -> 1 tool call, ~180 tokens.
  - **Tool-Call Reduction:** 50% (from 2 calls to 1).
  - **Token Savings:** ~90% reduction in tokens per symbol explanation.
- **Shortest Path Relational Traces:**
  - *Legacy workflow:* Agent had to run `stubs query` + inspect neighbors + run `stubs path <src> <dst>` -> 2 tool calls.
  - *Unified workflow:* Agent runs `stubs query "path: <src> to <dst>"` -> 1 tool call, ~120 tokens.
- **Blast Radius Impact:**
  - *Legacy workflow:* Agent had to run `stubs query` + `stubs blast <target>` -> 2 tool calls.
  - *Unified workflow:* Agent runs `stubs query "blast: <target>"` -> 1 tool call, ~150 tokens.

### 3. Louvain Community Persistence (Q4 / Q12)
- **Persistence Verification:** 97 Louvain community partitions detected and written to SQLite `sidecars.community_id` and `sidecars.community_label` during scan.
- **Query Enrichment:** Regular GraphRAG queries now surface community cluster annotations (`[Cluster: engine.ts]`) without in-memory recomputation overhead.

### 4. Framework-Aware Route Extraction (Q3)
- **Frameworks Validated:** Express (TS/JS), FastAPI (Python), Django (Python), Flask (Python), Gin (Go).
- **Graph Topology:** Emits `route:<METHOD>:<path>` nodes with `handles` edges pointing directly to controller implementation functions with `EXTRACTED` confidence.

### 5. Runtime Optional Extras (Q7 / Q13)
- **Zero-Dependency Core:** Stubs retains zero required external grammar packages; built-in TypeScript AST and regex extractors operate without dependency warnings or runtime failures.
- **Dynamic Check:** `tryLoadOptionalParser()` dynamically checks for tree-sitter packages and transparently falls back to regex extractors with zero overhead.

## Compliance
- **Zero External References:** Confirmed 0 references to external products (`graphify`, etc.) across all new code, tests, and documentation.
- **Backward Compatibility:** All existing commands (`stubs explain`, `stubs path`, `stubs blast`) remain functional with 100% test compatibility.
