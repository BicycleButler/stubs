---
title: Abstract Grill Engine — Paradigm Exploration & Deep Module Grilling
type: sidecar-spec
description: >-
  State machine engine that stress-tests abstract concepts, high-level architectures,
  and deep modules using orthogonal conceptual paradigms and hybrid recommendations.
  Transitions through INIT → PARSING → GENERATING_PARADIGMS → GRILLING → SAVING → DONE.
  Supports interactive (readline) and non-interactive execution modes.
tags:
  - grill
  - abstract
  - architecture
  - paradigms
  - deep-modules
module_depth: deep
context_object: AbstractGrillOptions
status: spec
version: 1
target_code_file: ./abstract-engine.ts
status_flag: clean
exports:
  - AbstractGrillState
  - AbstractGrillArchetype
  - AbstractGrillQuestion
  - AbstractGrillOptions
  - AbstractGrillEngine
depends_on:
  - ../../fs
  - ../../path
  - ../../readline
  - ../../js-yaml
  - ../config/schema
  - ../parser/okf
  - ../graph/engine
used_by:
  - src/cli/router.ts
stale_details: null
---

# Abstract Grill Engine — Paradigm Exploration & Deep Module Grilling

The Abstract Grill Engine acts as an architectural stress-testing enforcer. It evaluates abstract concepts, interface-to-depth ratios, and orthogonal paradigms. It records settled decisions and trade-offs into markdown documents and Architecture Decision Records.

## State Machine

```
INIT → PARSING → GENERATING_PARADIGMS → GRILLING → SAVING → DONE
                                                         ↘ ERROR
```

- **INIT:** Entry state. Resolves target file and config path.
- **PARSING:** Reads and parses the target document or sidecar specification.
- **GENERATING_PARADIGMS:** Generates orthogonal paradigm archetypes and depth audits.
- **GRILLING:** Prompts interactively through readline or executes automated evaluation.
- **SAVING:** Records the deliberation log, updates frontmatter, and optionally creates ADRs.
- **DONE:** Terminal success state.
- **ERROR:** Terminal failure state when file resolution or parsing fails.

## Core Engineering Principles

1. **Orthogonal Paradigms:** Presents at least three distinct paradigm archetypes (for example, Declarative Engine, Reactive Dataflow Pipeline, and Autonomous State Machine).
2. **Deep Modules:** Enforces narrow interfaces with wide encapsulated capabilities.
3. **Flexible Recommendations:** Recommendations can be a single option or an explicit hybrid synthesis.
4. **Three-Scenario Generalization:** Evaluates multi-scenario applicability without contract changes.
