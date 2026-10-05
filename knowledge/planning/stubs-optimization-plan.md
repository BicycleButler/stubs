---
title: stubs Standalone Optimization Implementation Plan
type: initiative-plan
description: Multi-agent implementation plan and task tracker for optimizing stubs as a standalone install with unified surgical querying, mtime incremental scanning, community persistence, framework routing, and optional grammar detection.
tags:
  - planning
  - optimization
  - graph
  - query
  - cli
  - task-tracker
phase: sand
status: implemented
version: 1
status_flag: clean
initiative: stubs-standalone-optimization
---

# stubs Standalone Optimization — Implementation Plan

## Executive Summary

This document provides the executable implementation roadmap and multi-agent task tracker for optimizing `stubs` as a single, self-contained architecture-as-code and code-graph engine. Grounded in the settled decision record ([stubs-optimization-decisions.md](file:///Users/lappier/code/projects/stubs/knowledge/planning/stubs-optimization-decisions.md)), this plan executes five high-ROI enhancements designed to maximize agent efficiency, eliminate redundant tool invocations, and minimize token usage during code exploration and maintenance.

### Primary Goals

1. **Unified Surgical Query (Q14 / Q9):** Turn `stubs query` into the single default entry point for all graph intelligence queries (general concept search, shortest paths, symbol explanations, and blast radius analysis) via both prefix syntax and flags, preserving legacy commands via forwarding wrappers.
2. **Fast Incremental Scan (Q10 / Q2):** Skip unchanged source files and markdown sidecars prior to reading disk bodies by caching filesystem modification timestamps (`mtimeMs`) in the SQLite `file_meta` table.
3. **Persisted Louvain Community Clusters (Q4 / Q12):** Wire the existing Louvain modularity algorithm in `TopologyEngine` to SQLite persistence via `GraphEngine.assignCommunities()`, exposing community partitions in queries without recomputing on the fly.
4. **Framework-Aware Routing (Q3):** Introduce route-to-handler AST extraction for 5 major frameworks (Express, FastAPI, Django, Flask, Gin) in `src/graph/routes.ts`, establishing explicit graph edges between HTTP endpoints and controller implementations.
5. **Runtime Optional Extras Detection (Q7 / Q13):** Add dynamic import detection (`try-import-and-catch`) for optional high-fidelity parsers (e.g. tree-sitter grammars), gracefully falling back to built-in zero-dependency extractors.

---

## Planned Architecture & File Tree Blueprint

```filetree
knowledge/
  planning/
    planning-map.md                     # [MODIFY] Register stubs-standalone-optimization initiative
    stubs-optimization-decisions.md     # [SETTLED] Recorded architectural ADRs & decision matrix
    stubs-optimization-plan.md          # [NEW] This initiative implementation plan & task tracker
src/
  query/
    engine.ts                           # [MODIFY] Add surgical dispatch (path, explain, blast, prefixes) to QueryEngine
    engine.ts.md                        # [MODIFY] Sidecar spec for QueryEngine
  cli/
    router.ts                           # [MODIFY] Unified stubs query routing + legacy command forwarding
    router.ts.md                        # [MODIFY] Sidecar spec for CliRouter
  graph/
    engine.ts                           # [MODIFY] mtimeMs checking in indexCodeWorkspace/indexWorkspace; wire assignCommunities
    engine.ts.md                        # [MODIFY] Sidecar spec for GraphEngine
    routes.ts                           # [NEW] Framework route-to-handler extractor (Express, FastAPI, Django, Flask, Gin)
    routes.ts.md                        # [NEW] Sidecar spec for RouteExtractor
    extractor.ts                        # [MODIFY] Integrate route extractor and dynamic grammar loader checks
    extractor.ts.md                     # [MODIFY] Sidecar spec for CodeGraphExtractor
tests/
  query-surgical.test.ts                # [NEW] Unit & integration tests for unified surgical querying
  scan-incremental.test.ts              # [NEW] Unit tests for mtime-based incremental scan skips
  community-persistence.test.ts         # [NEW] Integration tests for community_id SQLite persistence & query exposure
  framework-routes.test.ts              # [NEW] Tests for Express, FastAPI, Django, Flask, and Gin route extraction
  optional-extras.test.ts               # [NEW] Tests for dynamic grammar loading and graceful fallback
```

---

## Phase-by-Phase Execution & Multi-Agent Task Tracker

### Phase 1: Conceptualize & Requirements Alignment (Complete)

- [x] Conduct codebase audit comparing `stubs-optimization-decisions.md` against actual implementation (`src/graph/`, `src/concept/`, `src/query/`, `src/cli/`).
- [x] Identify architectural discrepancies:
  - Framework routing belongs in Graph Engine, not `ConceptEngine`.
  - Louvain community detection and SQLite `community_id` column already exist; persistence needs wiring into `stubs scan`.
  - Stubs currently has zero tree-sitter dependencies; optional extras must be dynamic import checks over built-in extractors.
  - Incremental scanning requires OS `mtimeMs` checking in `file_meta` to skip reading file contents.
- [x] Resolve all 5 decision branches via interactive grilling session (`/grill-me`).
- [x] Update and settle [stubs-optimization-decisions.md](file:///Users/lappier/code/projects/stubs/knowledge/planning/stubs-optimization-decisions.md).

---

### Phase 2: Grill & Stress-Testing (Complete)

- [x] Stress-test Q14 CLI routing: ensure `stubs query` accepts natural prefix queries (`path: A to B`), explicit flags (`--path A B`), and legacy standalone invocations (`stubs path A B`) return identical outputs.
- [x] Stress-test Q10 mtime invalidation: ensure file content hash is calculated and verified if mtime changes, while unchanged mtimes completely avoid file read I/O.
- [x] Stress-test Q4 community persistence: ensure Louvain partition IDs do not corrupt existing sidecar records and remain resilient during partial/incremental scans.
- [x] Stress-test Q3 routing boundaries: keep `src/graph/routes.ts` modular and decoupled from `src/concept/engine.ts`.
- [x] Stress-test Q7/Q13 fallback paths: ensure missing optional packages emit clean, non-disruptive log notes without throwing runtime errors or prompting agent loops.

---

### Phase 3: Spec & Sidecar Contracts (`*.md`) (Complete)

- [x] **Contract 3.1: Query Engine Sidecar** (`src/query/engine.ts.md`)
  - Specify `QueryEngine.query()` surgical extensions: `explainTarget`, `shortestPath { source, target }`, `blastTarget { target, depth }`.
  - Document query prefix parsing (`"path: <src> to <dst>"`, `"explain: <sym>"`, `"blast: <sym>"`).
- [x] **Contract 3.2: CLI Router Sidecar** (`src/cli/router.ts.md`)
  - Specify argument parsing for `stubs query` flags (`--path`, `--explain`, `--blast`).
  - Document legacy command deprecation/forwarding paths (`stubs explain`, `stubs path`, `stubs blast` delegate to unified query engine).
- [x] **Contract 3.3: Graph Engine Sidecar** (`src/graph/engine.ts.md`)
  - Specify `file_meta` schema addition: `mtime_ms INTEGER`.
  - Document `indexCodeWorkspace` and `indexWorkspace` stat-based fast path.
  - Document post-scan Louvain invocation: `topology.getCommunities()` -> `graphEngine.assignCommunities()`.
- [x] **Contract 3.4: Framework Route Extractor Sidecar** (`src/graph/routes.ts.md`)
  - Specify route node and edge contracts (`kind: 'route'`, relation: `'handles'`, confidence: `'EXTRACTED'`).
  - Document pattern matching rules for Express, FastAPI, Django, Flask, and Gin.
- [x] **Contract 3.5: Code Extractor Sidecar** (`src/graph/extractor.ts.md`)
  - Specify integration hook for `extractFrameworkRoutes()`.
  - Specify dynamic grammar loader contract `loadOptionalParser(grammarName)`.

---

### Phase 4: Materialization (Executable Implementation) (Complete)

#### Step 4.1 — Unified Surgical Query (Q14 / Q9 / Q6)

_Target Files: `src/query/engine.ts`, `src/cli/router.ts`, `tests/query-surgical.test.ts`_

- [x] Enhance `QueryEngine` to parse surgical query prefixes:
  - `path: <source> to <target>` -> invokes `TopologyEngine.findShortestPath()`.
  - `explain: <target>` -> invokes `TopologyEngine.explainNode()`.
  - `blast: <target>` -> invokes `TopologyEngine.calculateBlastRadius()`.
- [x] Add explicit surgical options to `QueryOptions`:
  - `path?: { source: string; target: string }`
  - `explain?: string`
  - `blast?: { target: string; depth?: number }`
- [x] Update `handleQuery` in `src/cli/router.ts`:
  - Support CLI flags `--path <src> <dest>`, `--explain <target>`, `--blast <target> [--depth <n>]`.
  - Format output consistently with legacy command formatting for terminal/agent readability and `--json` consistency.
- [x] Rewire `handleExplain`, `handlePath`, and `handleBlast` in `src/cli/router.ts` to delegate to `queryEngine.query()`.
- [x] Create unit and integration test suite `tests/query-surgical.test.ts`.

#### Step 4.2 — Fast Incremental Scan via Filesystem mtime (Q10 / Q2)

_Target Files: `src/graph/engine.ts`, `tests/scan-incremental.test.ts`_

- [x] Update database schema initialization in `GraphEngine.initialize()`:
  - Ensure `file_meta` table contains `mtime_ms INTEGER` column (with migration check if existing DB lacks column).
- [x] Update `GraphEngine.indexCodeWorkspace()`:
  - Fetch existing `(file_path, file_hash, mtime_ms)` from `file_meta`.
  - Call `fsDriver.stat(filePath)` to inspect `mtimeMs`.
  - If `!options.force && cachedMeta?.mtime_ms === stat.mtimeMs`, immediately increment `summary.skipped++` without reading file content.
  - If mtime changed or missing, read content, verify content hash, and update `file_meta` with `(file_path, file_hash, stat.mtimeMs)`.
- [x] Update `GraphEngine.indexWorkspace()`:
  - Apply the same `mtimeMs` stat check for markdown sidecar files.
- [x] Create unit tests in `tests/scan-incremental.test.ts` validating skip counts and re-index triggers on file touch/edit.

#### Step 4.3 — Persist Louvain Communities & Expose in Query (Q4 / Q12)

_Target Files: `src/graph/engine.ts`, `src/cli/router.ts`, `src/query/engine.ts`, `tests/community-persistence.test.ts`_

- [x] In `src/cli/router.ts` (`handleScan`):
  - After code and sidecar indexing completes, instantiate `TopologyEngine` from current graph nodes and edges.
  - Run `const communityRes = topology.getCommunities()`.
  - Call `await graphEngine.assignCommunities(communityRes.communities)`.
- [x] In `src/query/engine.ts`:
  - When returning `QueryResult`, enrich matched nodes with their persisted `community_id` and `community_label`.
- [x] In `src/cli/router.ts` (`handleQuery`):
  - Display community cluster metadata in the formatted summary output.
- [x] Create test in `tests/community-persistence.test.ts` confirming `sidecars.community_id` is populated in `.stubs/graph.sqlite` after scan.

#### Step 4.4 — Framework-Aware Route Extraction (Q3)

_Target Files: `src/graph/routes.ts`, `src/graph/extractor.ts`, `tests/framework-routes.test.ts`_

- [x] Create `src/graph/routes.ts` implementing `extractFrameworkRoutes(filePath, content)`:
  - **Express (TS/JS):** Detect `app.get()`, `app.post()`, `router.route()`, etc. Map route path + HTTP method to handler function/method.
  - **FastAPI (Python):** Detect `@app.get()`, `@router.post()`, etc. Map path + method to decorated async/sync handler function.
  - **Django (Python):** Detect `path('pattern', view_func)` and `re_path()` in `urls.py`. Map route pattern to handler view.
  - **Flask (Python):** Detect `@app.route()`, `@blueprint.route()`. Map path + methods to decorated handler function.
  - **Gin (Go):** Detect `r.GET()`, `group.POST()`. Map route path + method to handler function identifier.
- [x] Emit GraphNodes with `kind: 'route'` (ID: `route:<METHOD>:<path>`, e.g., `route:GET:/api/bikes`).
- [x] Emit GraphEdges with `relation: 'handles'` from route node to handler function node (`confidence: 'EXTRACTED'`).
- [x] Wire `extractFrameworkRoutes` into `extractFileGraph` in `src/graph/extractor.ts`.
- [x] Create test suite in `tests/framework-routes.test.ts` with test fixtures for all 5 frameworks.

#### Step 4.5 — Runtime Dynamic Grammar Loader & Graceful Fallback (Q7 / Q13)

_Target Files: `src/graph/extractor.ts`, `tests/optional-extras.test.ts`_

- [x] Implement `tryLoadOptionalParser(parserModule: string)` helper in `src/graph/extractor.ts`.
- [x] Wrap non-TS language dispatch: if an optional AST parser is available in the environment, utilize it; otherwise fall back cleanly to regex pattern extractors.
- [x] Emit an aggregated, single-line scan summary note (e.g. `ℹ Using built-in regex extractors for Python/Go/Rust`) without throwing warnings.
- [x] Create tests in `tests/optional-extras.test.ts` verifying fallback behavior when optional modules are not installed.

---

### Phase 5: Sand, Test & Benchmark (Complete)

- [x] **Full Test Suite:** Run `npm test` ensuring 100% pass across existing and new test suites.
- [x] **Linter & Formatting:** Run `npm run lint` and `npm run format`.
- [x] **Build Validation:** Run `npm run build` and ensure `.agents/skills/stubs/dist/cli.cjs` bundles cleanly.
- [x] **AST Drift Sync:** Run `npx stubs sand` across modified sidecars in `src/`.
- [x] **Phase Gate Check:** Run `npx stubs phase check` to ensure clean lifecycle compliance.
- [x] **Benchmark Verification:**
  - Measure scan runtime on cold vs incremental runs.
  - Measure token reduction of `stubs query "explain: <target>"` vs legacy multiple tool calls.
  - Document results in a dated benchmark note in `knowledge/planning/`.

---

## Non-Negotiables & Validation Gates

1. **Zero External References:** Absolute prohibition of external framework/product names (`graphify`, etc.) across code, docs, templates, comments, and tests.
2. **Backward Compatibility:** All existing commands (`stubs explain`, `stubs path`, `stubs blast`) MUST continue to work with identical output shapes and exit codes.
3. **Token Floor Rule:** Every change must either reduce agent token consumption or expand capability without increasing average tokens per query.
4. **Schema Discipline:** All graph additions (`community_id`, `mtime_ms`) strictly reside in `.stubs/graph.sqlite`; no secondary database files.
5. **No Broken Builds:** All edits must maintain zero TypeScript compiler errors and clean ESLint checks.
