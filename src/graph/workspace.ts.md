---
title: Workspace Engine & Monorepo Package Scoping
type: engine-spec
status: materialized
version: 1.0.0
phase: 4
initiative: token-optimal-intelligence
target_code_file: src/graph/workspace.ts
status_flag: clean
tags:
  - graph
  - workspace
  - monorepo
  - package-scoping
  - aliases
depends_on:
  - src/storage/index.ts
  - src/graph/engine.ts
used_by:
  - src/graph/extractor.ts
  - src/query/engine.ts
exports:
  - WorkspaceManager
  - WorkspacePackage
  - WorkspaceConfig
---

# Workspace Engine & Monorepo Package Scoping

## Purpose & Scope

The **WorkspaceManager** automatically detects multi-package monorepo workspaces (`pnpm-workspace.yaml`, `package.json` workspaces, `Cargo.toml` workspaces, `go.work`) and parses path aliases (`tsconfig.json` `compilerOptions.paths`). It resolves cross-package module specifiers directly to canonical file paths so graph traversals and blast radius analyses cross package boundaries seamlessly.

## Key Methods

- `loadWorkspace()`: Discovers packages and loads all alias mapping tables.
- `resolveImportPath(importSpecifier, importerFilePath, config)`: Translates package specifiers (for example,. `@stubs/core`) to target canonical file paths.
- `getPackageForFile(filePath, config)`: Finds the owning package domain for the specified source file.
