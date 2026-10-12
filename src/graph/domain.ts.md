---
title: Domain Engine — Domain Discovery & Context Map Generator
type: engine-spec
status: materialized
version: 1.0.0
phase: 4
initiative: token-optimal-intelligence
target_code_file: src/graph/domain.ts
status_flag: clean
tags:
  - graph
  - domain
  - architecture
  - context-map
  - adr-001
depends_on:
  - src/graph/engine.ts
used_by:
  - src/cli/router.ts
exports:
  - DomainEngine
  - DomainInfo
  - DomainModuleInfo
---

# Domain Engine — Domain Discovery & Context Map Generator

## Purpose & Scope

The **DomainEngine** discovers architectural subsystem domains across codebases and generates agent-first domain context maps (`knowledge/architecture/domains/<domain>-domain-map.md`) adhering to ADR-001. It enforces the invariant that domain maps are the prerequisite foundation synthesized into the root architecture map (`knowledge/architecture/context-map.md`).

## Key Methods

- `discoverDomains()`: Partitions AST nodes and files into domain clusters, identifying hubs, exported capabilities, and cross-domain dependencies.
- `generateDomainMap(domain, domainsDir, options)`: Formats and writes an individual domain map using ADR-001 compact records.
- `generateAllDomainMaps(domainsDir, options)`: Creates/refreshes all discovered domain maps.
- `generateContextMap(domains, rootMapFile, options)`: Synthesizes the root context map from the prerequisite domain maps.
