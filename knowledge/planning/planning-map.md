---
title: Stubs Framework — Planning Hub & Initiative Map
type: planning-map
description: >-
  Master architectural planning map indexing active initiatives, conceptual
  blueprints, phase statuses, and multi-agent task trackers.
tags:
  - planning
  - roadmap
  - initiatives
  - lifecycle
status: active
version: 1
status_flag: clean
---

# Stubs Framework — Planning Hub & Initiative Map

The `knowledge/planning/` directory is the centralized operational hub for repository planning, conceptual design, initiative roadmaps, and multi-agent task tracking.

## 5-Phase Lifecycle Overview

Every initiative and module in the repository progresses through 5 deterministic phases:

- **5-Phase Lifecycle:** 1. Conceptualize -> 2. Grill -> 3. Spec/Scaffold -> 4. Materialize -> 5. Sand & Audit

- Phase | Purpose | Artifacts Produced | Gate to Next Phase
- **1. Conceptualize** | Problem framing, domain scoping, file tree blueprint | Concept docs (`type: concept-doc`), `filetree` | File tree defined, initiative linked
- **2. Grill** | Interrogate ambiguities, stress-test decisions | Recorded ADRs & decision tables | All open questions resolved
- **3. Spec / Scaffold** | OKF sidecar specs (`*.ts.md`, `*.py.md`), types, APIs | Skeleton sidecars (`status: spec`) | Valid OKF frontmatter & signatures
- **4. Materialize** | Implementation code extraction, compiler typechecking | Materialized source files (`*.ts`, `*.py`) | Clean typecheck & compile pass
- **5. Sand & Audit** | AST structural sync, health checks, drift healing | Clean synced specs and implementation | `status_flag: clean`, zero drift

## Active Initiatives & Task Trackers

- Initiative | Lead / Agents | Current Phase | Task Tracker Link | Target Milestone
- **Framework Lifecycle & Planning Hub Expansion** | AI Agent & Team | **Phase 1: Conceptualize / Plan** | [lifecycle-expansion-plan.md] | v1.1.0
- **stubs Standalone Optimization** | AI Agent & Team | **Phase 5: Sand & Audit** | [stubs-optimization-plan.md] | v1.3.0
- **Token-Optimal Code Intelligence** | AI Agent & Team | **Phase 5: Sand & Audit** | [token-optimal-code-intelligence.md] | v1.4.0

## Conceptual Blueprints & Domain Concepts

- Concept Doc | Scope / Domain | Phase | File Tree Blueprint | Linked Initiative
- [lifecycle-expansion-plan.md] | Core CLI, GraphEngine, Parser, Server | Conceptualize | Defined | Framework Expansion
- [stubs-optimization-plan.md] | QueryEngine, GraphEngine, CLI, Routes | Conceptualize | Defined | stubs Standalone Optimization
- [token-optimal-code-intelligence.md] | Tree-sitter, FTS5, QueryEngine, MCP | Sand | Defined | Token-Optimal Code Intelligence
- [../architecture/context-map.md] | Root Architecture Hierarchy | Spec | Defined | System Core

## Architectural Decision Records (ADRs)

- ADR | Title | Status | Scope
- [../architecture/ADR/ADR-001-agent-first-documentation.md] | Agent-First Documentation & Context Representation Standards | Accepted | Generic / Codebase-Agnostic

## Guidelines for Agents and Developers

1. **Register New Work Here:** When conceptualizing a new feature, create an initiative plan in this directory. Link it above.
2. **Co-locate Subsystem Concepts:** Broad concepts sit in `knowledge/planning/` or `docs/concepts/`. Domain-specific concepts can sit directly in subsystem folders (for example,. `src/auth/concept.md`).
3. **Use Task Checklists:** Maintain task checkboxes (`- [ ]` / `- [x]`) in initiative plans. As work progresses, agents and human contributors check off items and add newly discovered tasks dynamically.
4. **Enforce Gating Rules:** Do not move an artifact to `Materialize` before completing the `Grill` and `Spec/Scaffold` phases.


## Abstract Grilling Deliberation (Standard Drill)

**Date:** 10/24/2026  
**Depth:** standard_drill  

### Q1 [PARADIGM-01] — Core Architectural Paradigm & Interface Boundary

**Core Question:** What fundamental conceptual paradigm should govern "Stubs Framework — Planning Hub & Initiative Map" to provide wide capabilities through a narrow interface?

**Orthogonal Options:**

- **Option A (Declarative Engine)**:
  - *Concept:* Callers submit pure intent or configuration schemas. The engine compiles and executes plans internally.
  - *Interface:* `execute(intent: IntentSchema): Promise<Result>`
  - *Trade-offs:* Maximum caller simplicity and high optimization freedom; internal planner has higher complexity.

- **Option B (Reactive Dataflow Pipeline)**:
  - *Concept:* Data flows through composable unidirectional transform stages with clear boundary invariants.
  - *Interface:* `pipe(source: Stream<In>): Stream<Out>`
  - *Trade-offs:* Excellent stream throughput and auditability; harder to implement bidirectional error recovery.

- **Option C (Autonomous State Machine Runtime)**:
  - *Concept:* State transitions are explicitly encapsulated in a finite state machine that guards invariants.
  - *Interface:* `dispatch(transition: Event): State`
  - *Trade-offs:* Rigid determinism and zero illegal states; requires explicit modeling for each transition.

**Recommendation:** Hybrid Synthesis: Declarative Schema Interface + Autonomous State Machine Core (hybrid)
- **Rationale:** A declarative public contract gives the caller a narrow interface, while the internal state machine provides wide capability and strict invariant safety.
- **Hybrid Synthesis:** Expose a single declarative `execute(intent)` entry point. Internally compile intent into explicit state machine transitions.
- **Falsifier:** If the caller must control the exact sequencing of internal steps in real time, a pipeline or builder is necessary.

**Depth & Reusability Audit:**
- *Interface Surface:* Single declarative entry point with zero leaky internal methods.
- *Encapsulated Capability:* Handles validation, lifecycle state transitions, error isolation, and persistence internally.
- *Three-Scenario Fit:* 1. Direct programmatic invocation 2. Batch workflow orchestration 3. Headless CI runner.

**Settled Resolution:** Adopt Hybrid: Hybrid Synthesis: Declarative Schema Interface + Autonomous State Machine Core. A declarative public contract gives the caller a narrow interface, while the internal state machine provides wide capability and strict invariant safety. Details: Expose a single declarative `execute(intent)` entry point. Internally compile intent into explicit state machine transitions.

### Q2 [DEPTH-02] — Information Hiding & Storage Decoupling

**Core Question:** How does "Stubs Framework — Planning Hub & Initiative Map" hide internal data storage, transport protocols, and sequencing from consumers?

**Orthogonal Options:**

- **Option A (Opaque Handle / Capability Broker)**:
  - *Concept:* Callers receive opaque session or resource handles without access to underlying storage or buffers.
  - *Interface:* `acquireSession(config): SessionHandle`
  - *Trade-offs:* Completely hides storage and network substrates; requires handle lifecycle cleanup.

- **Option B (Repository / Data Gateway Protocol)**:
  - *Concept:* Decouples caller contracts from storage through a strict abstract repository protocol.
  - *Interface:* `find(filter: QueryFilter): Promise<DomainEntity>`
  - *Trade-offs:* Easy to mock and swap substrates; can produce shallow abstraction wrappers if queries leak.

- **Option C (Event-Sourced Projection Engine)**:
  - *Concept:* State changes are written as immutable append-only events, and queries read read-optimized projections.
  - *Interface:* `record(event: DomainEvent): void`
  - *Trade-offs:* Total historical auditability and zero write contention; eventual consistency overhead.

**Recommendation:** Option A: Opaque Handle / Capability Broker (single)
- **Rationale:** Hides all internal state and engine dependencies behind a narrow capability token, guaranteeing storage decoupling.
- **Falsifier:** If callers require direct low-level raw SQL query access, an opaque handle is overly restrictive.

**Depth & Reusability Audit:**
- *Interface Surface:* Opaque handle with minimal verb methods.
- *Encapsulated Capability:* Hides whether data lives in memory, SQLite, or network sockets.
- *Three-Scenario Fit:* 1. Local in-memory testing 2. Single-node SQLite operation 3. Remote client session.

**Settled Resolution:** Adopt Option A: Opaque Handle / Capability Broker. Hides all internal state and engine dependencies behind a narrow capability token, guaranteeing storage decoupling.

### Q3 [GENERALIZATION-03] — Three-Scenario Generalization Test

**Core Question:** How does "Stubs Framework — Planning Hub & Initiative Map" resolve classes of problems across multiple distinct domains without modifying its public contract?

**Orthogonal Options:**

- **Option A (Algebraic Core Primitives)**:
  - *Concept:* Reduces system operations to 2-3 irreducible mathematical primitives (e.g. read, write, transform).
  - *Interface:* `apply(op: PrimitiveOperation): OperationResult`
  - *Trade-offs:* Infinitely reusable and mathematically sound; steep learning curve for callers.

- **Option B (Pluggable Middleware Extension Bus)**:
  - *Concept:* Keeps the core kernel minimal while delegating scenario-specific logic to pipeline interceptors.
  - *Interface:* `use(plugin: Middleware): void`
  - *Trade-offs:* Highly extensible across scenarios; order-dependent middleware chains can introduce subtle bugs.

- **Option C (Context-Specialized Strategy Dispatcher)**:
  - *Concept:* Exposes a unified contract that selects internal strategy implementations via ambient context.
  - *Interface:* `resolveStrategy(ctx: Context): StrategyExecution`
  - *Trade-offs:* Clean separation of operational modes; strategy combinatorial explosion if uncontrolled.

**Recommendation:** Hybrid Synthesis: Algebraic Core with Context-Aware Middleware Hooks (hybrid)
- **Rationale:** A small algebraic core provides mathematical reusability, while middleware hooks allow custom domain integrations.
- **Hybrid Synthesis:** Core operations stay invariant. Scenario variations attach as pre/post middleware hooks without modifying the core.
- **Falsifier:** If plugin order creates non-deterministic side effects, a monolithic declarative engine is required.

**Depth & Reusability Audit:**
- *Interface Surface:* Core interface exposes only primitive dispatch and plugin registration.
- *Encapsulated Capability:* Orchestrates plugin execution order, context propagation, and error containment.
- *Three-Scenario Fit:* 1. Command-line single executions 2. Interactive user sessions 3. Server daemon background tasks.

**Settled Resolution:** Adopt Hybrid: Hybrid Synthesis: Algebraic Core with Context-Aware Middleware Hooks. A small algebraic core provides mathematical reusability, while middleware hooks allow custom domain integrations. Details: Core operations stay invariant. Scenario variations attach as pre/post middleware hooks without modifying the core.

