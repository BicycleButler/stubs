---
title: CLI & Router — Domain Context Map
type: domain-context-map
domain: cli
parent_map: ../context-map.md
description: Deep-dive context map for the cli domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - cli
  - agent-optimized
---

# CLI & Router — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The CLI & Router coordinates domain logic, core types, and services for the cli subsystem.

## Key Modules & Files
src/cli/router.ts (Hub) -> deps: src/query/engine.ts.md | caps: CliContext, CliRouter, route, parseArgs, printHelp, handleInit, printVersion, handleGrill
src/cli/agents-doc.ts -> deps: none | caps: SyncAgentsDocOptions, SyncAgentsDocResult, resolveAgentsPath, formatAccordingToAdr001, auditAdr001Compliance, generateStubsInstructionBlock, syncAgentsDoc
src/cli/router.ts.md -> deps: none | caps: CliContext, CliRouter
src/cli/auth.ts -> deps: none | caps: askTokenMasked, handleLogin

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through router.ts, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
