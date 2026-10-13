---
title: Graph Engine — Domain Context Map
type: domain-context-map
domain: graph
parent_map: ../context-map.md
description: Deep-dive context map for the graph domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - graph
  - agent-optimized
---

# Graph Engine — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The **Graph Engine** manages repository-wide dependency relationships, node states, frontmatter metadata, and OKF structural entities. It stores all graph topology in SQLite (`.stubs/graph.sqlite`), allowing fast querying of module statuses, dependencies, and bi-directional edges without rescanning the filesystem on every operation.

## Key Modules & Files
- src/graph/engine.ts (Hub) -> deps: none | caps: normalizePosixPath, resolvePosixPath, fallbackGlob, IndexSummary, SidecarInput, SearchOptions, SearchResult, TaskRow
- src/graph/topology.ts -> deps: none | caps: BlastRadiusNode, BlastRadiusResult, ShortestPathStep, ShortestPathResult, SmellGodNode, SmellCycle, SmellDomainLeak, ArchitecturalSmellsReport
- src/graph/engine.ts.md -> deps: none | caps: GraphEngine, IndexSummary, SidecarInput, SearchOptions, SearchResult, TaskRow, PlannedFileRow, PlanningHubSummary
- src/query/engine.ts -> deps: none | caps: SurgicalQueryKind, QueryOptions, QuerySubGraphNode, QuerySubGraphEdge, MacroMapCommunity, MacroMapResult, QueryResult, QueryEngine
- src/graph/extractor.ts -> deps: none | caps: EdgeConfidence, GraphNode, GraphEdge, ExtractedGraph, resolveRelativeImport, extractFileGraph, tryLoadOptionalParser, extractMarkdownGraph
- src/graph/domain.ts -> deps: none | caps: DomainModuleInfo, DomainInfo, DomainEngine, matchesGlob, extractDomainFromSidecar, deriveDomainForFile, discoverDomains, discoverDomainsFromGraph
- src/graph/workspace.ts -> deps: none | caps: WorkspacePackage, WorkspaceConfig, WorkspaceManager, loadWorkspace, resolveImportPath, getPackageForFile, parseYamlPackagePatterns, parseCargoWorkspaceMembers
- src/graph/skeleton.ts -> deps: none | caps: SkeletonOptions, SkeletonResult, SkeletonGenerator, generateSkeleton, generateTypeScriptSkeleton, extractFunctionHeader, extractClassHeader, extractMemberHeader
- src/query/engine.ts.md -> deps: none | caps: QueryEngine, QueryOptions, QueryResult, QuerySubGraphNode, QuerySubGraphEdge, SurgicalQueryKind, MacroMapResult, MacroMapCommunity
- src/graph/extractor.ts.md -> deps: none | caps: extractFileGraph, resolveRelativeImport, GraphNode, GraphEdge, ExtractedGraph, EdgeConfidence
- src/graph/routes.ts -> deps: none | caps: FrameworkKind, ExtractedRoute, ExtractedRouteGraph, extractFrameworkRoutes
- src/graph/routes.ts.md -> deps: none | caps: extractFrameworkRoutes, ExtractedRoute, FrameworkKind
- src/graph/plugins/base.ts -> deps: none | caps: SearchPlugin, BaseSearchPlugin
- src/graph/wasmEngine.ts -> deps: none | caps: WasmGraphEngineOptions, WasmGraphEngine
- src/graph/plugins/level2.ts -> deps: none | caps: Level2SearchPlugin
- src/graph/plugins/level3.ts -> deps: none | caps: Level3SearchPlugin
- src/graph/skeleton.ts.md -> deps: none | caps: internal
- src/graph/workspace.ts.md -> deps: none | caps: internal
- src/graph/domain.ts.md -> deps: none | caps: internal

## Domain Invariants
- SQLite databases are opened with WAL (Write-Ahead Logging) mode enabled for concurrent read/write support.
- All node paths stored in the graph must be relative to the repository root for portability.
