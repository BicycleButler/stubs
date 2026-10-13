# `stubs` — Quickstart & Usage Guide

This guide walks you through installing, initializing, and using `stubs` in your projects and AI agent workflows.

---

## Installation & Setup

### 1. Install as Workspace Dependency

To add `stubs` as a development dependency in your project:

```bash
npm install --save-dev github:BicycleButler/stubs
# or: pnpm add -D github:BicycleButler/stubs
```

### 2. Launch Interactive Installer (TUI)

Run `npx stubs` (or invoke directly if installed) to launch the interactive terminal interface:

```bash
npx stubs
```

Select any combination of skills (`tale`, `design`, `stubs`), target destination (local workspace `./.agents` or global `~/.gemini/config`), and optional MCP servers.

### 3. Install Specific Skills (Non-Interactive / CI)

```bash
# Install tale and design into current project
npx stubs add tale design

# Install all skills and configure workspace hooks
npx stubs add all

# Install globally for all repositories
npx stubs add --global all
```

### 4. Register MCP Servers

```bash
# Register an MCP server into .agents/mcp_config.json
npx stubs mcp add stubs
npx stubs mcp add tale
npx stubs mcp add design
```

### 5. Updating `stubs`

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

---

## Core Development Workflows

### Standard 5-Phase Development Workflow

The 5-phase lifecycle coordinates requirements, design invariants, code materialization, and AST sync:

```bash
# 1. Conceptualize: Draft a new concept blueprint or sidecar specification
stubs concept new "User Authentication"
stubs template apply spec --name=auth --target=src/auth.ts

# 2. Grill: Stress-test and grill design invariants before writing code
stubs grill src/auth.ts.md

# 3. Materialize: Extract and typecheck production code directly from spec
stubs materialize src/auth.ts.md

# 4. Sand: Reconcile AST drift automatically whenever code or spec edits occur
stubs sand

# 5. Audit: Audit workspace health, cycles, and God-node hotspots
stubs audit --hotspots --cycles
```

### Domain Mapping (CLI-only)

We provide a CLI-driven workflow that automatically creates domain maps from the codebase:

1. **Install the Stubs CLI** (once per repo):

```bash
pnpm add -D github:BicycleButler/stubs
# or: npm i -D github:BicycleButler/stubs
```

Ensure `pnpm-workspace.yaml` (or root `package.json`) has:

```yaml
allowBuilds:
  stubs@git+https://github.com/BicycleButler/stubs.git#15795266c6ca874580ad0305efaf33396cd5f790: true
```

2. **Run the discovery script** (creates domain maps):

```bash
./scripts/create-domain-maps.sh
```

Writes OKF front-matter + section placeholders to `knowledge/architecture/domains/*.md` using the SQLite graph (`file_path` column), `subsystem-index` type, and adds `description`.

3. **Fill in the descriptive sections** (agent/LLM task):

Edit each `*-domain-map.md` to replace the placeholders for:
- `## Key concepts`
- `## Decisions (locked)`
- `## Open questions (frontier)`
- `## Implementation plan`

Then run the grill to lock decisions and record outcomes:

```bash
npx stubs grill knowledge/architecture/domains/<domain>-domain-map.md
```

4. **Validate** (optional, for index sidecars):

```bash
npx stubs validate knowledge/architecture/domains/*.md
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

---

## Code Intelligence & MCP Integration

### 3-Level Progressive Disclosure Queries (`stubs query`)

Query code intelligence using progressive disclosure:

- **Level 0 Macro Map (`map:`):** Subsystem community partitions (Louvain modularity), God Node coupling hubs, and monorepo packages (~340 tokens).
  ```bash
  stubs query "map:"
  ```
- **Level 1 Skeleton Stub (`stub: <path>`):** Strips function/class bodies to `...`, preserving interfaces, types, docstrings, and line ranges (`file.ts#L10-L45`), saving 85–90% tokens.
  ```bash
  stubs query "stub: src/auth.ts"
  ```
- **Level 2 Surgical Queries:**
  - `explain: <symbol>`: Callers, callees, confidence, and PageRank authority score.
  - `path: <A> to <B>`: Shortest dependency chain between modules.
  - `blast: <target>`: Downstream blast radius impact tree.
  - `pkg:<name> <query>`: Monorepo package-scoped search (pruning 90%+ irrelevant context).
  - `<natural language>`: Hybrid FTS5 BM25 + PageRank GraphRAG with strict 1,000-token budget pruning.

### MCP Server Stdio Integration

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

The MCP surface exposes two high-impact tools (`stubs_query` and `stubs_scan`), keeping prompt schema overhead under 200 tokens per turn while supporting all surgical prefix commands (`map:`, `stub:`, `explain:`, `path:`, `blast:`, `pkg:`). Graph freshness is maintained automatically (<30ms filesystem `mtimeMs` verification before each query).

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
