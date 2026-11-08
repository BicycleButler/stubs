# stubs — Agent Instructions

Agent conventions and tooling rules for `stubs` repository.

<!-- stubs-instructions-start -->
## Architecture Context Maps — Read First

Agent entry point: knowledge/architecture/context-map.md
Repo ADRs: knowledge/architecture/ADR/
Module specs: co-located `*.ts.md` sidecars in `src/`.

## Architecture Graph & GraphRAG Intelligence

AST dependency graph in `.stubs/graph.sqlite`. Query via `npx stubs query "<query>"`:
- `map:`: Level 0 Macro Map (subsystem communities, hubs, domains)
- `stub: <target>`: Level 1 Interface Skeleton Stubs (stripped signatures, types, line links)
- `explain: <target>`: Level 2 Symbol Profile (callers, callees, PageRank)
- `path: <A> to <B>`: Shortest dependency path chain
- `blast: <target>`: Downstream impact radius and dependents
- `pkg:<package> <query>`: Monorepo package-scoped query
- **Automatic Graph Maintenance:** Auto-checks file mtime (<30ms). Refresh and synchronize via `npx stubs run`.

## Core CLI Commands

- **Unified Repository Pipeline:** `npx stubs run` (runs scan, map, sand, lint-arch & automated tale remediation)
- **GraphRAG Surgical Query:** `npx stubs query "explain: <target>"` | `path: <A> to <B>` | `blast: <target>`
- **Architecture Mapping:** `npx stubs map --generate` (refreshes prerequisite domain maps + root context-map.md)
- **Spec & Architecture Grilling:** `npx stubs grill <file.md>` | `npx stubs abstract-grill <file.md>`
- **Export Knowledge Graph:** `npx stubs export <obsidian|wiki> [--out <dir>]`
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
