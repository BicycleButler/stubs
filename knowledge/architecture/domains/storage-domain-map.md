---
title: Storage Layer — Domain Context Map
type: domain-context-map
domain: storage
parent_map: ../context-map.md
description: Deep-dive context map for the storage domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - storage
  - agent-optimized
---

# Storage Layer — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The Storage Layer coordinates domain logic, core types, and services for the storage subsystem.

## Key Modules & Files
src/storage/index.ts (Hub) -> deps: none | caps: FileStorageDriver, FileSystemDriver, PreparedStatement, DatabaseDriver, NodeFileSystem, readFile, writeFile, readFileBuffer
src/storage/credentials.ts -> deps: none | caps: getMachineUniqueKey, encrypt, decrypt, loadCredentials, saveCredentials, clearBuffer, maskToken, applyGlobalConsoleMasking
src/storage/index.ts.md -> deps: none | caps: FileStorageDriver, FileSystemDriver, DatabaseDriver, PreparedStatement, NodeFileSystem, BetterSqliteDriver, WasmSqliteDriver, VirtualFileSystem
src/storage/credentials.ts.md -> deps: none | caps: getMachineUniqueKey, encrypt, decrypt, saveCredentials, loadCredentials, applyGlobalConsoleMasking
src/storage/containment.ts.md -> deps: none | caps: resolveContainedPath, isSafeRelativePath, validateTargetCodeFile
src/storage/containment.ts -> deps: none | caps: resolveContainedPath, isSafeRelativePath, validateTargetCodeFile

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through index.ts, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
