---
title: 'Stubs Lite & Tiered Add-on Architecture Blueprint'
type: concept-doc
description: Architectural design and decomposition strategy for a lightweight, zero-dependency Stubs Core skill and progressive add-on extension system.
status: approved
tags:
  - architecture
  - skills
  - stubs-core
  - lightweight
  - distribution
version: '1.0.0'
---

# Stubs Lite & Tiered Add-on Architecture Blueprint

## 1. Problem Framing & Motivation

The full `stubs` repository provides an end-to-end framework. It features an Express web portal, in-memory compiler, AST parsers, SQLite database, and lifecycle engines.

When deploying `stubs` into external applications or third-party repositories:

- Installing full server dependencies introduces bloat when developers only require headless CLI automation and GraphRAG context.
- Target repositories require a **lightweight skill bundle**. It installs instantly through a single command, with zero native compilation dependencies (`node-gyp`).

## 2. Tiered System Architecture

Visual diagram decoupled per ADR-001: [knowledge/planning/visual-stubs-lite-skill-blueprint.md].

- Host Project: Target host application, config, skills, and `< 2MB` CLI binary.
- Tier 1: Stubs Core headless engine (Parser, SQLite Graph, Topology, Materializer, Sander, Concept, GraphRAG).
- Tier 2: Progressive Add-ons installed on demand (Portal, Compiler, MCP).

## 3. Subsystem Breakdown

### 3.1 Tier 1: Stubs Core (Headless Skill)

- **Zero Runtime Dependencies:** Bundled as a standalone CJS file (`dist/cli.cjs`, ~1.8 MB) using `esbuild`. Uses embedded WebAssembly SQLite and YAML parser.
- **Graph & Intelligence:** Retains full AST symbol extraction, Louvain community clusters, PageRank centrality, caller/callee traversal, and token-budgeted GraphRAG querying (`query`, `explain`, `blast`).
- **Lifecycle Engines:** Includes `concept` (scaffolding blueprints), `materialize` (sidecar extraction), `sand` (bi-directional AST hash sync), `lint` (architectural layer validation), and `map` (context map auditing).

### 3.2 Tier 2: Progressive Extensions

- **`@stubs/portal`:** Provides `stubs serve` / `stubs portal` with the live Express server, Server-Sent Events, PWA browser client, and GitHub API bridge.
- **`@stubs/compiler`:** Provides deep in-memory typechecking through TypeScript's programmatic compiler API.
- **`@stubs/mcp`:** Provides a standardized Model Context Protocol JSON-RPC stdio server for IDE agent integration.

## 4. Operational Workflows

### 4.1 Initialization (`npx stubs init`)

1. Generates minimal `.stubs/config.json`.
2. Populates `.agents/skills/stubs/` with the lean root `SKILL.md`, sub-skills directory, and the standalone `dist/cli.cjs` binary.
3. Automatically executes an initial `stubs scan` to index the project.

### 4.2 Progressive Add-on Installation (`stubs add <addon>`)

- Installs requested extension package locally or triggers ephemeral invocation (for example,. `npx @stubs/portal`).

### 4.3 Version-Locked Safe Updates (`stubs update`)

- Fetches the latest core binary and sub-skills.
- Atomically replaces `.agents/skills/stubs/dist/cli.cjs` and core sub-skills.
- Automatically applies incremental schema migrations to `.stubs/graph.sqlite`.
- **Never** overwrites user-defined templates (`.stubs/templates/`) or custom configuration in `.stubs/config.json`.

## 5. Agent Skill Structure (Progressive Disclosure)

- **Root `SKILL.md` (< 100 lines):** Functions as the master decision matrix and routing table. Outlines the 5-phase lifecycle and maps agent intentions directly to specific sub-skills and CLI commands.
- **Sub-skills (`sub-skills/<domain>/SKILL.md`):** Deep-dive execution playbooks loaded on demand for specific tasks:
  - `conceptualizing`: Problem framing & blueprints
  - `context-mapping`: Context map scaffolding and audit
  - `context`: Token-optimized GraphRAG briefs (`explain`, `query`, `blast`)
  - `grilling`: Spec stress testing & frontier decision trees
  - `materialization`: Sidecar code extraction
  - `sanding`: Structural drift reconciliation
