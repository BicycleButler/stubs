---
title: Sanding & Sync Engine — Domain Context Map
type: domain-context-map
domain: sanding
parent_map: ../context-map.md
description: Deep-dive context map for the sanding domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - sanding
  - agent-optimized
---

# Sanding & Sync Engine — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The Sanding & Sync Engine coordinates domain logic, core types, and services for the sanding subsystem.

## Key Modules & Files
src/sanding/engine.ts (Hub) -> deps: none | caps: SyncResult, sha256, stripSyncStateFromYaml, stripSyncStateFromContent, healCorruptedFrontmatter, stripSidecarHeader, syncFrontmatterDependencies, SandingEngine
src/sanding/ast.ts -> deps: none | caps: getAstStructuralHash, visit, typeCheckCode, InterfaceDriftReport, checkInterfaceDrift
src/sanding/engine.ts.md -> deps: none | caps: SyncResult, SandingEngine, stripSyncStateFromYaml, stripSyncStateFromContent, healCorruptedFrontmatter
src/sanding/ast.ts.md -> deps: none | caps: TypeCheckResult, getAstStructuralHash, typeCheckCode

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through engine.ts, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
