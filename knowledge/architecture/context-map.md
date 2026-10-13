---
title: Project Architecture Context Map
type: context-map
description: High-level architectural map of core domains, subsystem responsibilities, and dependency flows.
tags:
  - architecture
  - context-map
  - agent-optimized
---

# Architecture Context Map

## Routing & Entrypoints
- Entry (Layer 0): src/context/engine.ts -> domain: core
- Entry (Layer 0): src/INDEX.md -> domain: core
- Entry (Layer 0): src/context/engine.ts.md -> domain: core

## Subsystem Matrix
- Graph Engine (L1): src/graph/engine.ts -> deps: none | caps: normalizePosixPath, resolvePosixPath, fallbackGlob, IndexSummary
- Verification & Tool Suite (L2): src/prune/engine.ts -> deps: none | caps: PruneIssueType, PruneIssue, PruneAuditSummary, PruneAuditResult
- Core Entrypoints & Runtime (L3): src/context/engine.ts -> deps: cli | caps: ContextOptions, Tier0TargetContext, Tier1DependencyContext, Tier1DependentContext
- Server & Live Portal (L4): src/web/shims.ts -> deps: storage | caps: sha256, rightRotate, Hash, update
- Autonomy Protocol (L5): src/phase/engine.ts.md -> deps: core, graph, parser, sanding | caps: PhaseEngine, LifecyclePhase, LIFECYCLE_PHASES, PhaseRequirement
- Parser Engine (L6): src/parser/okf.ts.md -> deps: none | caps: OkfFrontmatter, ParsedOkfSpec, FileTreeEntry, isCodeSidecar
- Storage Layer (L7): src/storage/index.ts -> deps: none | caps: FileStorageDriver, FileSystemDriver, PreparedStatement, DatabaseDriver
- CLI & Router (L8): src/cli/router.ts -> deps: none | caps: CliContext, CliRouter, route, parseArgs
- Sanding & Sync Engine (L9): src/sanding/engine.ts -> deps: storage | caps: SyncResult, sha256, stripSyncStateFromYaml, stripSyncStateFromContent
- Interactive Grill Engine (L10): src/grill/engine.ts -> deps: core, graph, parser | caps: GrillState, GrillEngineOptions, GrillEngine, GrillState
- Materializer Engine (L11): src/materializer/engine.ts -> deps: core, graph, parser, storage | caps: MaterializeResult, stringifyOkfSpec, MaterializerEngine, MaterializerEngine

## Domain Maps & Specs
- graph: knowledge/architecture/domains/graph-domain-map.md (hub: src/graph/engine.ts)
- tools: knowledge/architecture/domains/tools-domain-map.md (hub: src/prune/engine.ts)
- core: knowledge/architecture/domains/core-domain-map.md (hub: src/context/engine.ts)
- server: knowledge/architecture/domains/server-domain-map.md (hub: src/web/shims.ts)
- autonomy: knowledge/architecture/domains/autonomy-domain-map.md (hub: src/phase/engine.ts.md)
- parser: knowledge/architecture/domains/parser-domain-map.md (hub: src/parser/okf.ts.md)
- storage: knowledge/architecture/domains/storage-domain-map.md (hub: src/storage/index.ts)
- cli: knowledge/architecture/domains/cli-domain-map.md (hub: src/cli/router.ts)
- sanding: knowledge/architecture/domains/sanding-domain-map.md (hub: src/sanding/engine.ts)
- grill: knowledge/architecture/domains/grill-domain-map.md (hub: src/grill/engine.ts)
- materializer: knowledge/architecture/domains/materializer-domain-map.md (hub: src/materializer/engine.ts)

## Boundary Invariants
- Downward dependencies only: consumers depend on lower layers, never higher layers.
- Cross-domain calls must target the domain canonical hub module, never internal private helpers.
- Repo-level architectural decisions recorded in knowledge/architecture/ADR/. Module nuances recorded in domain maps and sidecars.

## Visual Architecture Map
Human visual Mermaid diagrams: knowledge/architecture/visual-map.md (agents: do not read unless requested)
