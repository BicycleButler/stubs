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
The Graph Engine coordinates domain logic, core types, and services for the graph subsystem.

## Key Modules & Files
src/graph/engine.ts (Hub) -> deps: none | caps: normalizePosixPath, resolvePosixPath, fallbackGlob, IndexSummary, SidecarInput, SearchOptions, SearchResult, TaskRow
src/graph/topology.ts -> deps: none | caps: BlastRadiusNode, BlastRadiusResult, ShortestPathStep, ShortestPathResult, SmellGodNode, SmellCycle, SmellDomainLeak, ArchitecturalSmellsReport
src/query/engine.ts -> deps: none | caps: SurgicalQueryKind, QueryOptions, QuerySubGraphNode, QuerySubGraphEdge, MacroMapCommunity, MacroMapResult, QueryResult, QueryEngine
src/graph/engine.ts.md -> deps: none | caps: GraphEngine, IndexSummary, SidecarInput, SearchOptions, SearchResult, TaskRow, PlannedFileRow, PlanningHubSummary
src/graph/domain.ts -> deps: none | caps: DomainModuleInfo, DomainInfo, DomainEngine, matchesGlob, extractDomainFromSidecar, deriveDomainForFile, discoverDomains, discoverDomainsFromGraph
src/graph/extractor.ts -> deps: none | caps: EdgeConfidence, GraphNode, GraphEdge, ExtractedGraph, resolveRelativeImport, extractFileGraph, tryLoadOptionalParser, extractMarkdownGraph
src/graph/workspace.ts -> deps: none | caps: WorkspacePackage, WorkspaceConfig, WorkspaceManager, loadWorkspace, resolveImportPath, getPackageForFile, parseYamlPackagePatterns, parseCargoWorkspaceMembers
src/graph/skeleton.ts -> deps: none | caps: SkeletonOptions, SkeletonResult, SkeletonGenerator, generateSkeleton, generateTypeScriptSkeleton, extractFunctionHeader, extractClassHeader, extractMemberHeader
src/query/engine.ts.md -> deps: none | caps: QueryEngine, QueryOptions, QueryResult, QuerySubGraphNode, QuerySubGraphEdge, SurgicalQueryKind, MacroMapResult, MacroMapCommunity
src/graph/extractor.ts.md -> deps: none | caps: extractFileGraph, resolveRelativeImport, GraphNode, GraphEdge, ExtractedGraph, EdgeConfidence
src/graph/routes.ts -> deps: none | caps: FrameworkKind, ExtractedRoute, ExtractedRouteGraph, extractFrameworkRoutes
src/graph/plugins/level2.ts -> deps: none | caps: Level2SearchPlugin, generateEmbedding, search, generateMockEmbedding
src/graph/routes.ts.md -> deps: none | caps: extractFrameworkRoutes, ExtractedRoute, FrameworkKind
src/graph/plugins/base.ts -> deps: none | caps: SearchPlugin, BaseSearchPlugin
src/graph/wasmEngine.ts -> deps: none | caps: WasmGraphEngineOptions, WasmGraphEngine
src/graph/plugins/level3.ts -> deps: none | caps: Level3SearchPlugin
src/graph/skeleton.ts.md -> deps: none | caps: internal
src/graph/domain.ts.md -> deps: none | caps: internal
src/graph/workspace.ts.md -> deps: none | caps: internal

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through engine.ts, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
