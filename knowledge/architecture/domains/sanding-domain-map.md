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

The **Sanding Engine** is responsible for bi-directional synchronization between sidecar specs (`*.<ext>.md`) and actual source code files (`*.ts`, `*.py`, `*.go`, etc.). It uses AST structural hashing (ignoring trivial whitespace/comment changes) to detect changes, heal frontmatter hashes, and cleanly synchronize code edits back into sidecar specs or vice versa.

---

## Key Modules & Files

src/sanding/engine.ts (Hub) -> deps: src/storage/containment.ts.md | caps: SyncResult, sha256, stripSyncStateFromYaml, stripSyncStateFromContent, healCorruptedFrontmatter, stripSidecarHeader, syncFrontmatterDependencies, SandingEngine
src/sanding/engine.ts.md -> deps: none | caps: SyncResult, SandingEngine, stripSyncStateFromYaml, stripSyncStateFromContent, healCorruptedFrontmatter
src/sanding/ast.ts -> deps: none | caps: getAstStructuralHash, visit, typeCheckCode, InterfaceDriftReport, checkInterfaceDrift
src/sanding/ast.ts.md -> deps: none | caps: TypeCheckResult, getAstStructuralHash, typeCheckCode

## Domain Invariants

- Two files with differing whitespace/comments but identical AST structures produce identical AST structural hashes (`ast_hash`).
- Conflicts are raised only when both the sidecar and the code file have changed with conflicting structural AST differences.
