---
title: Core Entrypoints & Runtime — Domain Context Map
type: domain-context-map
domain: core
parent_map: ../context-map.md
description: Deep-dive context map for the core domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - core
  - agent-optimized
---

# Core Entrypoints & Runtime — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The Core Entrypoints & Routing coordinates domain logic, core types, and services for the core subsystem.

## Key Modules & Files
- src/context/engine.ts (Hub) -> deps: none | caps: ContextOptions, Tier0TargetContext, Tier1DependencyContext, Tier1DependentContext, Tier2BoundaryContext, ContextPackage, ContextEngine, generateContextPackage
- src/INDEX.md -> deps: none | caps: GraphEngine, CliRouter, PortalServer, TemplateEngine, AutonomyProtocol, SandingEngine, MaterializerEngine, parseOkfSpec
- src/context/engine.ts.md -> deps: none | caps: ContextEngine, ContextPackage, ContextOptions, Tier0TargetContext, Tier1DependencyContext, Tier1DependentContext, Tier2BoundaryContext
- src/config/schema.ts.md -> deps: none | caps: StubsConfig, DEFAULT_CONFIG, loadConfig
- src/jwt.ts.md -> deps: none | caps: AuthContext, JwtPayload, signToken, verifyToken
- src/jwt.ts -> deps: none | caps: AuthContext, JwtPayload, signToken, verifyToken
- src/config/schema.ts -> deps: none | caps: StubsConfig, loadConfig, sanitizeConfig
- src/cli.ts -> deps: src/cli/router.ts.md | caps: primary
- src/index.ts -> deps: none | caps: internal

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through INDEX.md, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
