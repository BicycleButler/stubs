# `stubs` — Specification-First AI Software Development

AI has changed how we write code, but it shouldn't change the way we engineer it. `stubs` is an architectural framework, local execution engine, and AI agent protocol for building, maintaining, and evolving complex codebases.

Standard agent prompting often leads to architectural drift, broken types, and token-heavy refactoring loops. `stubs` offers an intermediate **sidecar specification & architecture planning phase**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE DUAL-FILE PARADIGM                           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│    Specification Layer (*.<ext>.md)  │     Executable Source Layer (*.<ext>)│
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Open Knowledge Format (OKF) sidecar│ • Production-ready executable code   │
│ • YAML frontmatter & graph links     │ • Generated/materialized from spec   │
│ • Defines interfaces, ADRs, & types  │ • Header-linked via @sidecar comment │
│ • Holds human notes & directives     │ • Kept in sync via Code Sanding      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## Installation & Updating

### 1. Install via `npx` / `npm` (Recommended)

Install `stubs` into your project workspace or global environment:

```Bash
npm i -D github:Wiltermoodj/stubs && npx stubs init && npx stubs map --scaffold && npx stubs scan && npx stubs tree --graph
```

Alternative (no local node_modules install):

```Bash
npx -y github:Wiltermoodj/stubs install && stubs init && stubs map --scaffold && stubs scan && stubs tree --graph
```

### 2. Standalone Install (curl)

For standalone CI/CD environments or quick setup without npm packages:

```bash
curl -fsSL https://raw.githubusercontent.com/Wiltermoodj/stubs/main/bin/stubs.js -o /usr/local/bin/stubs && chmod +x /usr/local/bin/stubs
```

### Updating `stubs`

Run `update` inside any initialized workspace to refresh CLI binaries, agent skills, template molds, and database schemas:

```bash
stubs update
# Or with npx:
npx stubs update
```

---

## Quickstart Guide

Get your repository initialized, mapped, and indexed in four simple steps:

```bash
# 1. Initialize stubs configuration, agent skills, and templates
npx stubs init

# 2. Scaffold root architecture context map and domain hierarchy
npx stubs map --scaffold

# 3. Scan physical codebase, extract AST symbols, and build dependency graph
npx stubs scan

# 4. Query architectural graph with 3-tier progressive disclosure
npx stubs query "map:"                      # Level 0 Macro Map (clusters & hubs)
npx stubs query "stub: src/auth.ts"          # Level 1 Skeleton Interface Stub (80-90% token savings)
npx stubs query "explain: AuthService"       # Level 2 Symbol Profile & Callers/Callees
npx stubs query "path: router to engine"     # Level 2 Shortest Path Chain
npx stubs query "blast: src/auth.ts"         # Level 2 Downstream Blast Radius

# 5. View visual file tree with architectural status and centrality markers
npx stubs tree --status
```

### Domain-Mapping (CLI‑only)

We provide a CLI‑driven workflow that automatically creates domain maps
from the codebase. The process is:

1️⃣ **Install the Stubs CLI** (once per repo):

```bash
pnpm add -D github:Wiltermoodj/stubs
# or: npm i -D github:Wiltermoodj/stubs
```

Ensure `pnpm-workspace.yaml` (or root `package.json`) has:

```yaml
allowBuilds:
  stubs@git+https://github.com/Wiltermoodj/stubs.git#15795266c6ca874580ad0305efaf33396cd5f790: true
```

2️⃣ **Run the discovery script** (creates domain maps):

```bash
./scripts/create-domain-maps.sh
```

Writes OKF front‑matter + section placeholders to
`knowledge/architecture/domains/*.md` using the SQLite graph
(`file_path` column), `subsystem-index` type, and adds `description`.

3️⃣ **Fill in the descriptive sections** (agent/LLM task):
Edit each `*-domain-map.md` to replace the placeholders for:

- `## Key concepts`
- `## Decisions (locked)`
- `## Open questions (frontier)`
- `## Implementation plan`

Then run the grill to lock decisions and record outcomes:

```bash
npx stubs grill knowledge/architecture/domains/<domain>-domain-map.md
```

4️⃣ **Validate** (optional, for index sidecars):

```bash
npx stubs validate knowledge/architecture/domains/*.md
```

The script is intentionally dependency‑free (only needs `sqlite3` CLI,
already present via the stubs post‑install binary) and works with macOS
bash 3.2. It generates one sidecar per top‑level domain prefix found in the
graph (`apps/*`, `packages/*`).

---

### Standard Development Workflow

```bash
# 1. Draft a new concept blueprint or sidecar specification
stubs concept new "User Authentication"
stubs template apply spec --name=auth --target=src/auth.ts

# 2. Stress-test and grill design invariants before writing code
stubs grill src/auth.ts.md

# 3. Materialize and typecheck production code directly from spec
stubs materialize src/auth.ts.md

# 4. Reconcile AST drift automatically whenever code or spec edits occur
stubs sand

# 5. Audit workspace health, cycles, and God-node hotspots
stubs audit --hotspots --cycles
```

---

## Interactive Web Portal & PWA

Launch the local interactive dashboard to visually explore dependencies, inspect architecture health, and collaborate with agents:

```bash
stubs serve --port=3000
```

- **Interactive 1-Hop Ego Graph:** Visual graph explorer powered by SQLite and WebAssembly.
- **Real-Time Synchronization:** Live Server-Sent Events (SSE) stream workspace edits as they occur.
- **Human Directive Channel:** Submit real-time agent directives and steering constraints directly from the browser.
- **Offline PWA Support:** Touch-friendly Progressive Web App installable on desktop and mobile.

_(Note: `stubs serve` runs directly out-of-the-box in any project. Static web bundle compilation via `npm run build:web` and GitHub Pages deployment via `npm run deploy:pages` are internal development actions for `stubs` source contributors.)_

---

## CLI Command Reference

| Command                               | Description                                                                                                                      |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| **`query`** `[query]`                 | **Primary Intelligence Entrypoint:** Progressive disclosure & GraphRAG (`map:`, `stub:`, `explain:`, `path:`, `blast:`, `pkg:`). |
| **`mcp`**                             | Starts JSON-RPC 2.0 Model Context Protocol stdio server for IDE agents (`stubs_query`, `stubs_scan`).                            |
| **`init`**                            | Initializes `.stubs/config.json`, template molds, and agent skill configurations.                                                |
| **`scan`**, **`index`** `[dir]`       | Scans source code, extracts AST symbols/imports, and populates the SQLite graph.                                                 |
| **`map`** `[--scaffold]`              | Scaffolds or validates architectural context maps (`knowledge/architecture/context-map.md`).                                     |
| **`tree`** `[--status\|--graph]`      | Visualizes ASCII/Unicode file tree annotated with lifecycle phase and node degree centrality.                                    |
| **`export`** `<obsidian\|wiki>`       | Exports architecture graph to an Obsidian Vault (with `[[wikilinks]]`) or Wikipedia-style portal.                                |
| **`concept`** `<action>`              | Manages concept blueprints (`new <title>`, `scaffold <doc>`, `list`).                                                            |
| **`phase`** `<action>`                | Manages 5-phase lifecycle (`status [file]`, `check <file>`, `advance <file> [phase]`).                                           |
| **`grill`** `<file>`                  | Runs interactive or automated (`--non-interactive`) design stress-testing on specifications.                                     |
| **`materialize`** `<file>`            | Extracts, typechecks, and generates executable source code from sidecar specs.                                                   |
| **`sand`**, **`sync`** `[file]`       | Bi-directionally synchronizes AST hashes and frontmatter between code and specs.                                                 |
| **`context`** `<file>`                | Generates token-optimized, tiered agent context briefing slices (`--depth`, `--json`).                                           |
| **`impact`** / **`blast`** `<target>` | Analyzes upstream and downstream dependency blast radius and risk scoring.                                                       |
| **`lint-arch`**                       | Lints architecture rules against layer hierarchy, cyclic dependency bans, and manifest parity.                                   |
| **`mock`** `<file>`                   | Generates spec-driven test suites and mock scaffolding (`--framework`, `--output`).                                              |
| **`diagram`** `[target]`              | Generates Mermaid architecture and sequence diagrams (`--type`, `--sync`).                                                       |
| **`prune`** `[--fix\|--zombies]`      | Identifies and prunes phantom specs, untracked source code, and zombie exports.                                                  |
| **`changelog`** `[--since]`           | Generates semantic architectural changelogs from git history and spec changes.                                                   |
| **`path`** `<src>` `<dest>`           | Finds the shortest dependency or call chain between two files or symbols.                                                        |
| **`audit`** `[--hotspots\|--cycles]`  | Audits workspace health, circular dependencies, unlinked files, and God nodes.                                                   |
| **`template`** `<action>`             | Manages template molds (`list`, `render <name> <data>`).                                                                         |
| **`serve`** `[--port=3000]`           | Starts the local Web Portal and Event Bridge server for real-time visual exploration.                                            |
| **`auth login`**                      | Authenticates GitHub credentials and stores Personal Access Tokens (PATs).                                                       |
| **`update`**, **`upgrade`**           | Updates installed agent skills, template molds, dependencies, and SQLite schemas.                                                |

---

## Token-Optimal Code Intelligence & MCP Integration

`stubs` includes a category-leading zero-LLM architecture and code intelligence engine designed specifically to minimize AI agent token consumption during codebase navigation and refactoring (saving 80–90% of exploration tokens):

### 1. 3-Level Progressive Disclosure (`stubs query`)

Instead of flooding agent context windows with full file contents:

- **Level 0 Macro Map (`map:`):** Subsystem community partitions (Louvain modularity), God Node coupling hubs, and monorepo packages (~340 tokens).
- **Level 1 Skeleton Stub (`stub: <path>`):** Strips function/class bodies to `...`, preserving interfaces, types, docstrings, and line ranges (`file.ts#L10-L45`), saving 85–90% tokens.
- **Level 2 Surgical Queries:**
  - `explain: <symbol>`: Callers, callees, confidence, and PageRank authority score.
  - `path: <A> to <B>`: Shortest dependency chain between modules.
  - `blast: <target>`: Downstream blast radius impact tree.
  - `pkg:<name> <query>`: Monorepo package-scoped search (pruning 90%+ irrelevant context).
  - `<natural language>`: Hybrid FTS5 BM25 + PageRank GraphRAG with strict 1,000-token budget pruning.

### 2. Universal Model Context Protocol (MCP) Stdio Server

Connect any agent harness or environment via standard JSON-RPC 2.0 stdio:

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

_(Or `"command": "npx", "args": ["stubs", "mcp"]`)_

The ultra-lean MCP surface exposes two high-impact tools (`stubs_query` and `stubs_scan`), keeping prompt schema overhead under 200 tokens per turn while supporting all surgical prefix commands (`map:`, `stub:`, `explain:`, `path:`, `blast:`, `pkg:`). Graph freshness is maintained automatically (<30ms filesystem `mtimeMs` verification before each query).

### 3. Monorepo & Multi-Package Boundary Resolution

`stubs` auto-detects monorepo layouts with zero manual configuration:

- **Package Discovery:** Recognizes package manifests across `package.json` (`workspaces`), `pnpm-workspace.yaml`, `Cargo.toml` (`[workspace]`), and `go.work`.
- **Alias Resolution:** Resolves TypeScript `compilerOptions.paths` and `package.json` exports to canonical source file paths, keeping graph edges intact across packages.
- **Package Scoping:** Agents use `stubs query "pkg:<package> <query>"` (e.g. `pkg:billing invoice`) to restrict seed search, BFS/DFS expansions, and shortest paths to that package root, eliminating 90%+ irrelevant cross-package context.

---

## Sub-Skills Reference

For agent orchestration, specialized sub-skills live under `.agents/skills/stubs/sub-skills/`:

| Sub-Skill                                                                       | Purpose                                                                                    |
| :------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------- |
| **[auditing](.agents/skills/stubs/sub-skills/auditing/SKILL.md)**               | Workspace health checks, cycle detection, and God-node hotspot analysis.                   |
| **[changelog](.agents/skills/stubs/sub-skills/changelog/SKILL.md)**             | Semantic architectural changelog generation and spec diff tracking.                        |
| **[conceptualizing](.agents/skills/stubs/sub-skills/conceptualizing/SKILL.md)** | Problem framing, requirements gathering, and blueprint generation.                         |
| **[context](.agents/skills/stubs/sub-skills/context/SKILL.md)**                 | Token-optimized tiered context slices and LLM briefing generation.                         |
| **[context-mapping](.agents/skills/stubs/sub-skills/context-mapping/SKILL.md)** | Hierarchical context maps (`context-map.md`) & domain index management.                    |
| **[diagram](.agents/skills/stubs/sub-skills/diagram/SKILL.md)**                 | Mermaid diagram generation for dependency flows and sequence interactions.                 |
| **[grilling](.agents/skills/stubs/sub-skills/grilling/SKILL.md)**               | Interactive and automated spec stress-testing and architectural inquiry.                   |
| **[lint](.agents/skills/stubs/sub-skills/lint/SKILL.md)**                       | Architecture invariant verification, layer hierarchy checking, and drift linting.          |
| **[materialization](.agents/skills/stubs/sub-skills/materialization/SKILL.md)** | Sidecar code extraction, in-memory TypeScript typechecking, and code generation.           |
| **[mock](.agents/skills/stubs/sub-skills/mock/SKILL.md)**                       | Spec-driven test suite generation and typed mock harness generation.                       |
| **[pruning](.agents/skills/stubs/sub-skills/pruning/SKILL.md)**                 | Detection and cleanup of orphaned specs, untracked source files, and zombie exports.       |
| **[sanding](.agents/skills/stubs/sub-skills/sanding/SKILL.md)**                 | AST structural hashing, frontmatter auto-healing, and bi-directional drift reconciliation. |

---

## Architectural Principles

- **Deep Modules:** Simple public interfaces that conceal rich internal logic.
- **Context Objects:** Group session, environment, and user state into unified parameters (`AuthContext`, `CliContext`) to prevent parameter explosion.
- **Define Errors Out of Existence:** Prefer explicit `Result<T, E>` returns and idempotent APIs over disruptive runtime exceptions.
- **Self-Healing Frontmatter:** Guarantees that manual edit collisions or missing YAML fields never crash the parser; auto-reconciles on write.
- **Zero-Model Local Core:** Deterministic parsing, graph indexing, AST hashing, and typechecking execute locally with zero API keys and 0 token overhead.
