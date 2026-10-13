---
target_code_file: ./index.ts
status_flag: clean
exports:
  - GraphEngine
  - CliRouter
  - PortalServer
  - TemplateEngine
  - AutonomyProtocol
  - SandingEngine
  - MaterializerEngine
  - parseOkfSpec
  - loadConfig
stale_details: null
---

# stubs — Subsystem Index

`stubs` is an architecture-as-code planning and AST dependency framework. It provides physical source code dependency extraction and graph intelligence out of the box. Users can add optional **Open Knowledge Format (OKF)** concept documents (`*.md`) and code sidecars (`*.<ext>.md`).

## Architecture Overview

### Subsystem Interaction Flow
- CLI Entry Point: `src/cli.ts` -> `cli/router.ts`
- Orchestration Engines: `GrillEngine` (`src/grill/`), `MaterializerEngine` (`src/materializer/`), `SandingEngine` (`src/sanding/`)
- Core Graph: `GraphEngine` (`src/graph/`), `AutonomyProtocol` (`src/autonomy/`)
- Foundation Services: `Compiler` (`src/compiler/`), `Parser` (`src/parser/`), `Storage` (`src/storage/`), `Templates` (`src/templates/`), `Server` (`src/server/`)

## Module Status Matrix

- Module Sidecar | Target File | Status | Status Flag
- [./config/schema.ts.md] | `config/schema.ts` | `spec` | `clean`
- [./parser/okf.ts.md] | `parser/okf.ts` | `spec` | `clean`
- [./parser/markdown.ts.md] | `parser/markdown.ts` | `spec` | `clean`
- [./parser/ast.ts.md] | `parser/ast.ts` | `spec` | `clean`
- [./storage/index.ts.md] | `storage/index.ts` | `spec` | `clean`
- [./storage/containment.ts.md] | `storage/containment.ts` | `spec` | `clean`
- [./graph/engine.ts.md] | `graph/engine.ts` | `spec` | `clean`
- [./graph/workspace.ts.md] | `graph/workspace.ts` | `spec` | `clean`
- [./graph/skeleton.ts.md] | `graph/skeleton.ts` | `spec` | `clean`
- [./graph/domain.ts.md] | `graph/domain.ts` | `spec` | `clean`
- [./query/engine.ts.md] | `query/engine.ts` | `spec` | `clean`
- [./grill/engine.ts.md] | `grill/engine.ts` | `spec` | `clean`
- [./materializer/engine.ts.md] | `materializer/engine.ts` | `spec` | `clean`
- [./sanding/engine.ts.md] | `sanding/engine.ts` | `spec` | `clean`
- [./sanding/ast.ts.md] | `sanding/ast.ts` | `spec` | `clean`
- [./autonomy/protocol.ts.md] | `autonomy/protocol.ts` | `spec` | `clean`
- [./compiler/typechecker.ts.md] | `compiler/typechecker.ts` | `spec` | `clean`
- [./templates/engine.ts.md] | `templates/engine.ts` | `spec` | `clean`
- [./concept/engine.ts.md] | `concept/engine.ts` | `spec` | `clean`
- [./concept/tree.ts.md] | `concept/tree.ts` | `spec` | `clean`
- [./phase/engine.ts.md] | `phase/engine.ts` | `spec` | `clean`
- [./cli/router.ts.md] | `cli/router.ts` | `spec` | `clean`
- [./server/portal.ts.md] | `server/portal.ts` | `spec` | `clean`
- [./server/github.ts.md] | `server/github.ts` | `spec` | `clean`
- [./web/index.ts.md] | `web/index.ts` | `spec` | `clean`

## Dependency Layers (Bottom-Up)

### Layer 0 — Foundation

- **`config/schema.ts`** — `StubsConfig` interface and `loadConfig()`. All engines depend on this.

### Layer 1 — Storage Abstraction

- **`storage/index.ts`** — `FileStorageDriver`, `DatabaseDriver`, `NodeFileSystem`, `BetterSqliteDriver`, `WasmSqliteDriver`. Enables dual Node.js/WASM execution.
- **`storage/containment.ts`** — Path containment safety guard.
- **`storage/credentials.ts`** — GitHub PAT credential storage. Global console masking for secret suppression.

### Layer 2 — Parsing

- **`parser/okf.ts`** — OKF sidecar parser. Validates YAML frontmatter and returns `ParsedOkfSpec`.
- **`parser/markdown.ts`** — Extracts and replaces `## Implementation` TypeScript code blocks.
- **`parser/ast.ts`** — Markdown → AST tokenizer (used by materializer).

### Layer 3 — Graph & Database

- **`graph/engine.ts`** — `GraphEngine` manages the SQLite adjacency graph + FTS5 index. Stores all sidecar metadata, dependency edges, and search indices.

### Layer 4 — Engines

- **`grill/engine.ts`** — `GrillEngine` state machine: INIT → PARSING → GENERATING_QUESTIONS → GRILLING → SAVING → DONE.
- **`materializer/engine.ts`** — `MaterializerEngine`: reads sidecar, extracts code, type-checks, writes atomically, updates graph.
- **`sanding/engine.ts`** — `SandingEngine`: bi-directional AST hash reconciliation between `*.ts` and `*.ts.md`.
- **`sanding/ast.ts`** — AST structural hash computation using TypeScript compiler API.
- **`autonomy/protocol.ts`** — `AutonomyProtocol`: 3-tier autonomy gate, 5-phase reconciliation engine, drift detection.
- **`compiler/typechecker.ts`** — In-memory `tsc` type-check runner.
- **`templates/engine.ts`** — `TemplateEngine`: renders Handlebars → EJS template molds for sidecar scaffolding.

### Layer 5 — Interface

- **`cli/router.ts`** — `CliRouter`: routes CLI commands to engines.
- **`server/portal.ts`** — `PortalServer`: Express HTTP + SSE server, ego-graph API, Web Portal UI bundle.
- **`server/github.ts`** — GitHub API integration (PAT auth, branch/file read/write).
- **`web/index.ts`** — Client-side PWA bundle (WASM SQLite, ego-graph visualization).

## Core Concepts

### Dual-File Paradigm

A `.ts` production file can optionally be paired with a `.ts.md` sidecar specification in the same directory. When present, the sidecar is the specification source of truth and the code file is the materialized output. When absent, the code file is treated as a standard source file in the dependency graph. The framework supports  spec-driven and code-only workflows. Sidecars are optional.

### OKF Frontmatter

YAML frontmatter with required fields: `title`, `type`, `description`, `tags`, `status`, `version`, `target_code_file`, `status_flag`. Optional: `depends_on`, `used_by`, `exports`, `decisions`, `user_notes`, `sync_state`.

### 3-Tier Autonomy Matrix

- `strict_gate` — Agent can draft proposals. All writes require explicit human approval.
- `guided_execution` — Agent can scaffold sidecars. Code materialization still requires approval.
- `autonomous` — Agent can materialize code without human approval gates.

### Grill Depth Levels

- `light_probe` — 3 surface questions.
- `standard_drill` — 5–7 design-focused questions.
- `deep_interrogation` — 10+ edge-case and failure-mode questions.

### Code Sanding

Bi-directional synchronization using SHA-256 content hashes and AST structural hashes. When a `*.ts` file is newer than the sidecar, code is sanded back into the spec. When the sidecar is newer, it is materialized into code.

### Status Lifecycle

`skeleton` → `spec` → `grilling` → `partially-materialized` → `materialized` → `implemented`

### Status Flags

`clean` | `dependency-stale` | `template-outdated` | `template-realign-required` | `needs-human-review-resolution` | `typecheck-failed`
