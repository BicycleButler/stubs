---
title: Agents Doc Synchronizer — ADR-001 Compliant AGENTS.md Synchronizer
type: sidecar-spec
description: >-
  Synchronizes repository agent instruction files (AGENTS.md / agents.md)
  according to ADR-001 agent-first documentation standards. Preserves all
  human-authored sections, toolchains, and custom directives while keeping Stubs
  planning, architecture context maps, GraphRAG queries, and CLI commands
  up to date within sentinel boundaries.
tags:
  - cli
  - documentation
  - adr-001
  - agents-md
  - synchronization
module_depth: deep
context_object: SyncAgentsDocOptions
status: spec
version: 1
target_code_file: ./agents-doc.ts
status_flag: clean
exports:
  - STUBS_MANAGED_START
  - STUBS_MANAGED_END
  - SyncAgentsDocOptions
  - SyncAgentsDocResult
  - resolveAgentsPath
  - formatAccordingToAdr001
  - auditAdr001Compliance
  - generateStubsInstructionBlock
  - syncAgentsDoc
depends_on:
  - fs
  - path
used_by:
  - src/cli/router.ts
stale_details: null
---

# Agents Doc Synchronizer — ADR-001 Compliant AGENTS.md Synchronizer

## Design & Purpose

Implements non-destructive synchronization of agent instruction documents (`AGENTS.md` / `agents.md`) during `stubs init`, `stubs update`, and `stubs hook install`.

- **ADR-001 Enforcement:** Eliminates decorative emojis and box art, formats dense single-line delimited records, enforces single blank lines and 2-space indentation, and decouples visual Mermaid diagrams.
- **Sentinel Boundaries:** Encapsulates Stubs instructions between `<!-- stubs-instructions-start -->` and `<!-- stubs-instructions-end -->`.
- **Non-Destructive Preservation:** Retains custom toolchains, test frameworks, workflow integrations (e.g. Hermes Contextloop), and user-defined rules.
