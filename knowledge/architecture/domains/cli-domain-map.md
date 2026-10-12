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

The **CLI & Router** domain serves as the primary command-line interface for humans and AI agents. It handles all argument parsing, config loading, and routes commands (`init`, `grill`, `materialize`, `sand`, `audit`, `map`, `serve`, `auth`, `install`) downward to their respective subsystem engines.

---

## Key Modules & Files

src/cli/router.ts (Hub) -> deps: none | caps: CliContext, CliRouter, route, parseArgs, printHelp, handleInit, printVersion, handleGrill
src/cli/router.ts.md -> deps: none | caps: CliContext, CliRouter
src/cli/auth.ts -> deps: none | caps: askTokenMasked, handleLogin

## Domain Invariants

- `CliRouter` pulls all CLI argument complexity downward and returns exit code integers (`0` for success, `1` for error).
- All paths are resolved dynamically relative to `process.cwd()`.
