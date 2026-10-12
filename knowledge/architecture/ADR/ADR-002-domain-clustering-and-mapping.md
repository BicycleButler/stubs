---
title: ADR-002 — Domain Clustering, Sizing Thresholds, and Synchronization Architecture
status: accepted
date: 2026-10-12
type: architecture-decision
tags:
  - adr
  - architecture-mapping
  - domain-clustering
  - graphrag
  - agent-first
---

# ADR-002: Domain Clustering, Sizing Thresholds, and Synchronization Architecture

## 1. Context & Problem Statement

In automated architecture mapping, decomposing a repository into domain maps (`knowledge/architecture/domains/<domain>-domain-map.md`) is a prerequisite for generating the root architecture map (`knowledge/architecture/context-map.md`). However, naive 1:1 mapping between subdirectories and domains causes severe micro-domain explosion:

- Repositories with modular directory layouts produce dozens of single-file micro-domains (e.g. 25 domains for ~80 source files, where 15 domains contain only 1 module).
- Micro-domain sprawl dilutes architectural signal, consumes redundant agent context tokens, and defeats high-level architectural comprehension.
- Conversely, hardcoding language-specific or directory-specific rules breaks portability across polyglot repositories (TypeScript, Python, Go, Rust, monorepos).

A deliberate, general-purpose clustering and synchronization engine is required to cluster modules into a balanced set of cohesive architectural domains (typically 5–10 domains).

## 2. Decision

Stubs implements a multi-signal domain clustering and non-destructive synchronization engine governed by the following 5 invariants:

### Invariant 1: Multi-Signal Hybrid Discovery Precedence

Domain membership is evaluated through a strict 4-tier hierarchy:

1. **Sidecar Frontmatter:** Explicit `domain: <name>` tag in module sidecar (`*.md`).
2. **Configuration Overrides:** Glob pattern rules in `.stubs/config.json` (`architecture.domains`).
3. **Workspace Boundaries:** Monorepo package manifests (`workspaces`, `pnpm-workspace.yaml`, `Cargo.toml`, `go.work`).
4. **Graph & Directory Clustering:** Top-level directory grouping augmented by Louvain community detection.

### Invariant 2: Gravitational Dependency Rollup

To eliminate micro-domains:

- Candidate clusters with fewer than $N$ modules (default `min_domain_size: 3`) are declared micro-clusters.
- Each micro-cluster calculates its total dependency coupling score against all other candidate domains:
  $$\text{Coupling}(M, D) = \sum_{m \in M, d \in D} (\text{edges}(m \to d) + \text{edges}(d \to m))$$
- The micro-cluster automatically rolls into the candidate domain with the highest coupling score.
- If a micro-cluster has zero external edges or no strong affinity, it rolls into an ambient fallback domain (`tools` for utility/harness modules, or `core` for entrypoint/runtime modules).

### Invariant 3: Scope and Ambient Isolation

- Domain mapping scopes strictly to the configured source root (`paths.specs_dir`, default `src/`).
- Standalone test suites (`*.test.*`, `__tests__`), benchmarks, and build scripts are excluded from core domain maps by default.
- Zero-edge orphan files within the source root roll into `core` or `tools` rather than spawning standalone domain maps.

### Invariant 4: Non-Destructive Domain Map Synchronization

When re-running `stubs map --generate` or `stubs map --domains`:

- If an existing domain map contains developer-authored sections (`## Domain Purpose`, `## Design Invariants`, ADR references, custom notes), the generator preserves those custom sections verbatim.
- AST-derived sections (`## Module Inventory`, `## Entry Points`, `## Dependency Coupling`) are updated with fresh graph data.
- The `--force` flag allows clean rewrites when full regeneration is explicitly desired.
- Deprecated or consolidated micro-domain maps are cleanly pruned from `knowledge/architecture/domains/`.

### Invariant 5: Strict ADR-001 Token Optimization

All generated domain maps and `context-map.md` strictly adhere to ADR-001:

- Zero markdown delimiter tables (replaced with dense single-line key-value records).
- Zero emojis and zero decorative horizontal rules.
- Telegraphic phrasing with direct POSIX paths.

## 3. Configuration Schema

Configured in `.stubs/config.json`:

```json
{
  "architecture": {
    "min_domain_size": 3,
    "domains": {
      "tools": [
        "src/lint/**",
        "src/prune/**",
        "src/mock/**",
        "src/changelog/**",
        "src/templates/**"
      ],
      "cli": ["src/cli/**"]
    }
  }
}
```

## 4. Consequences

- Eliminates micro-domain clutter, producing 6–8 cohesive domains for medium-sized repositories.
- Preserves human architectural decisions across automated regeneration runs.
- Guarantees 100% portability across monorepos and polyglot codebases.
