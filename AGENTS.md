# stubs — Agent Instructions

Agent conventions and tooling rules for `stubs` repository.

<!-- stubs-instructions-start -->

## Planning Hub & 5-Phase Lifecycle

Planning hub index: knowledge/planning/planning-map.md
Lifecycle phases:

1. Conceptualize: problem framing, filetree blueprint (`stubs concept`)
2. Grill: stress-test decisions & ADRs (`stubs grill`)
3. Spec / Scaffold: OKF sidecar definitions & types (`stubs concept scaffold`)
4. Materialize: extract executable code (`stubs materialize`)
5. Sand & Audit: AST drift sync & health check (`stubs sand`, `stubs phase check`)

## Architecture Context Maps — Read First

Agent entry point: knowledge/architecture/context-map.md (human visual map: knowledge/architecture/visual-map.md,  agents ignore unless requested).
Repo ADRs: knowledge/architecture/ADR/ (ADR-001 agent-first format, ADR-002 domain clustering).
Subsystem index: src/INDEX.md.
Module specs: co-located `*.ts.md` sidecars in `src/`.

### Domain Context Maps

Domain-specific maps in knowledge/architecture/domains/:

- autonomy: knowledge/architecture/domains/autonomy-domain-map.md
- cli: knowledge/architecture/domains/cli-domain-map.md
- core: knowledge/architecture/domains/core-domain-map.md
- graph: knowledge/architecture/domains/graph-domain-map.md
- grill: knowledge/architecture/domains/grill-domain-map.md
- materializer: knowledge/architecture/domains/materializer-domain-map.md
- parser: knowledge/architecture/domains/parser-domain-map.md
- sanding: knowledge/architecture/domains/sanding-domain-map.md
- server: knowledge/architecture/domains/server-domain-map.md
- storage: knowledge/architecture/domains/storage-domain-map.md
- tools: knowledge/architecture/domains/tools-domain-map.md

## Architecture Graph & GraphRAG Intelligence

AST dependency graph in `.stubs/graph.sqlite` with Louvain community detection, PageRank centrality, FTS5 BM25 hybrid search.

- Querying GraphRAG: `npx stubs query "<query>"` (preferred single call, 3-tier progressive disclosure):
  - `npx stubs query "map:"`: Level 0 Macro Map (subsystem communities, hubs, domains)
  - `npx stubs query "stub: <target>"`: Level 1 Interface Skeleton Stubs (stripped signatures, types, line links)
  - `npx stubs query "explain: <target>"`: Level 2 Symbol Profile (callers, callees, PageRank)
  - `npx stubs query "path: <A> to <B>"`: Level 2 Shortest dependency path chain
  - `npx stubs query "blast: <target>"`: Level 2 Downstream impact radius and dependents
  - `npx stubs query "pkg:<package> <query>"`: Monorepo package-scoped query
  - `npx stubs query "<concept>"`: Multi-hop token-budgeted GraphRAG context retrieval
- Model Context Protocol (MCP): connect through standard JSON-RPC 2.0 stdio:
  ```json
  {
    "mcpServers": {
      "stubs": {
        "command": "node",
        "args": [".agents/skills/stubs/dist/cli.cjs", "mcp"]
      }
    }
  }
  ```
  (or `"command": "npx", "args": ["@bicyclebutler/stubs", "mcp"]`). Ultra-lean suite exposes `stubs_query` and `stubs_scan`.
- Monorepo & workspace boundary resolution:
  - Discovers package boundaries through `package.json` (`workspaces`), `pnpm-workspace.yaml`, `Cargo.toml` (`[workspace]`), `go.work`.
  - Path aliases in `tsconfig.json` (`compilerOptions.paths`) and package exports map directly to canonical source files.
  - Monorepo query prefix: `pkg:<package>` (for example,. `npx stubs query "pkg:billing invoice"`).
- Automatic graph maintenance: auto-checks file mtime (<30ms) for 0% staleness. Refresh manually through `npx stubs scan`.

## CLI Commands

- Primary Consolidated Pipeline: `npx stubs run` (runs scan, map generation, sidecar sanding, arch lint, and TALE governance in one pass. Use `--check` for read-only audit)
- Scan & Index Code Graph: `npx stubs scan`
- Query GraphRAG Subgraph: `npx stubs query "<question>"`
- Unified Surgical Query: `npx stubs query "explain: <target>"` | `path: <A> to <B>` | `blast: <target>`
- Architecture Mapping: `npx stubs map --generate` (refreshes prerequisite domain maps + root context-map.md)
- Domain Maps Only: `npx stubs map --domains` | `npx stubs map --domain <name>`
- Visual Diagram: `npx stubs map --visual`
- Export Knowledge Graph: `npx stubs export <obsidian|wiki> [--out <dir>]`
- Start MCP Stdio Server: `npx stubs mcp`
- Install Assistant Rules: `npx stubs hook install`
- Audit ASD-STE100 Compliance: `npx stubs tale` (or `npm run tale`)
- Auto-Remediate Prose & Formatting: `npx stubs tale --fix` (or `npm run tale:fix`)

### ASD-STE100 Technical English & Formatting (Tale)

The repository enforces ASD-STE100 Issue 9 Simplified Technical English for documentation (*.md) and code comments (*.ts, *.js, and so on).

- Audit Language & Formatting: `npx stubs tale` (or `npm run tale` / `npm run lint:tale`) — audits Markdown files and code comments across the workspace.
- Auto-Remediate Violations: `npx stubs tale --fix` (or `npm run tale:fix` / `npm run format:tale`) — fixes prose semicolons, contractions, Latin abbreviations, and safe vocabulary without changing executable code.
- File Scope & Exclusions: automatically skips build and test artifacts (`dist`, `node_modules`, `coverage`, `.stubs`), `.gitignore` paths, and strictly ignores `README.md` and `QUICKSTART.md`.

<!-- stubs-instructions-end -->

## Monorepo Workspaces & Toolchain

The repository is organized as an npm workspaces monorepo:

- `packages/cli` (`@bicyclebutler/stubs`): Unified interactive CLI & TUI orchestrator.
- `packages/core` (`@bicyclebutler/stubs-core`): Graph engine, parser, and sidecar compiler.
- `packages/tale` (`@bicyclebutler/tale`): ASD-STE100 technical English linter & skill.
- `packages/design` (`@bicyclebutler/design`): UI/UX design tokens, ADRs, and compliance scripts.

- Package manager: npm workspaces (npx for binaries)
- Build Project: `npm run build`
- Build CLI: `npm run build:cli`
- Build Core: `npm run build:core`
- Run Tests: `npm test`
- Lint Code: `npm run lint`
- Audit TALE: `npm run tale` (or `npm run lint:tale`)
- Remediate TALE: `npm run tale:fix` (or `npm run format:tale`)
- Format Code: `npm run format`

## stubs CLI Binary

Binary entry point: `bin/stubs.js` (delegates to `packages/cli/dist/index.cjs`). Invoke through `npx stubs <command>`.

Known CLI bug status: B1 sand path resolution (RESOLVED), B2 non-interactive grill (RESOLVED), B3 materialize parser (RESOLVED).
