---
title: Autonomy Protocol — Domain Context Map
type: domain-context-map
domain: autonomy
parent_map: ../context-map.md
description: Deep-dive context map for the autonomy domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - autonomy
  - agent-optimized
---

# Autonomy Protocol — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The Autonomy Protocol coordinates domain logic, core types, and services for the autonomy subsystem.

## Key Modules & Files
src/concept/engine.ts (Hub) -> deps: none | caps: CreateConceptOptions, CreateConceptResult, ScaffoldResult, ConceptInfo, ConceptEngine, slugify, createConcept, scaffoldFileTreeFromDoc
src/autonomy/protocol.ts -> deps: none | caps: AutonomyLevel, DriftReport, Proposal, ReconciliationResult, AutonomyProtocol, evaluateAction, reconcile, getSidecarHashWithoutSyncState
src/phase/engine.ts.md -> deps: none | caps: PhaseEngine, LifecyclePhase, LIFECYCLE_PHASES, PhaseRequirement, PhaseCheckResult, AdvancePhaseResult, WorkspacePhaseMatrix
src/phase/engine.ts -> deps: src/graph/engine.ts.md, src/parser/okf.ts.md | caps: LifecyclePhase, PhaseRequirement, PhaseCheckResult, AdvancePhaseResult, WorkspacePhaseMatrix, PhaseEngine
src/autonomy/protocol.ts.md -> deps: none | caps: AutonomyLevel, DriftReport, Proposal, ReconciliationResult, AutonomyProtocol
src/concept/engine.ts.md -> deps: none | caps: ConceptEngine, CreateConceptOptions, CreateConceptResult, ScaffoldResult, ConceptInfo
src/concept/tree.ts -> deps: src/graph/engine.ts.md, src/parser/okf.ts.md | caps: VisualTreeOptions, TreeNode, TreeEngine
src/concept/tree.ts.md -> deps: none | caps: TreeEngine, VisualTreeOptions

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through engine.ts, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
