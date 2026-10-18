---
title: Interactive Grill Engine — Domain Context Map
type: domain-context-map
domain: grill
parent_map: ../context-map.md
description: Deep-dive context map for the grill domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - grill
  - agent-optimized
---

# Interactive Grill Engine — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The Interactive Grill Engine coordinates domain logic, core types, and services for the grill subsystem.

## Key Modules & Files
src/grill/engine.ts (Hub) -> deps: none | caps: GrillState, GrillEngineOptions, GrillEngine, getState, transition, grill, generateQuestions, formatDepthName
src/grill/engine.ts.md -> deps: none | caps: GrillState, GrillEngineOptions, GrillEngine

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through engine.ts, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
