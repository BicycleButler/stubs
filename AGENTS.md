# stubs — Agent Instructions

Agent conventions and tooling rules for `stubs` repository.

<!-- stubs-instructions-start -->
## Architecture Context Maps — Read First

Agent entry point: knowledge/architecture/context-map.md
Repo ADRs: knowledge/architecture/ADR/
Module specs: co-located `*.ts.md` sidecars in `src/`.

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
  (or `"command": "npx", "args": ["stubs", "mcp"]`). Ultra-lean suite exposes `stubs_query` and `stubs_scan`.
- Monorepo & workspace boundary resolution:
  - Discovers package boundaries through `package.json` (`workspaces`), `pnpm-workspace.yaml`, `Cargo.toml` (`[workspace]`), `go.work`.
  - Path aliases in `tsconfig.json` (`compilerOptions.paths`) and package exports map directly to canonical source files.
  - Monorepo query prefix: `pkg:<package>` (for example, `npx stubs query "pkg:billing invoice"`).
- Automatic graph maintenance: auto-checks file mtime (<30ms) for 0% staleness. Refresh manually through `npx stubs scan`.

## CLI Commands

- Scan & Index Code Graph: `npx stubs scan`
- Query GraphRAG Subgraph: `npx stubs query "<question>"`
- Unified Surgical Query: `npx stubs query "explain: <target>"` | `path: <A> to <B>` | `blast: <target>`
- Concrete Spec Grilling: `npx stubs grill <file.md>`
- Abstract Architecture Grilling: `npx stubs abstract-grill <file.md>`
- Architecture Mapping: `npx stubs map --generate` (refreshes prerequisite domain maps + root context-map.md)
- Domain Maps Only: `npx stubs map --domains` | `npx stubs map --domain <name>`
- Export Knowledge Graph: `npx stubs export <obsidian|wiki> [--out <dir>]`
- Start MCP Stdio Server: `npx stubs mcp`
- Install Assistant Rules: `npx stubs hook install`
- Audit ASD-STE100 Compliance: `npx stubs tale`
- Auto-Remediate Prose & Formatting: `npx stubs tale --fix`
<!-- stubs-instructions-end -->

## Monorepo Workspaces & Toolchain

The repository is organized as an npm workspaces monorepo:

- `packages/cli` (`@bicyclebutler/stubs`): Unified interactive CLI & TUI orchestrator.
- `packages/core` (`@bicyclebutler/stubs-core`): Graph engine, parser, and sidecar compiler.
- `packages/tale` (`@bicyclebutler/tale`): ASD-STE100 technical English linter & skill.

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
