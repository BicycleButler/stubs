---
title: Materializer Engine — Code Extraction & Atomic Write
type: sidecar-spec
description: >-
  Extracts TypeScript implementation code blocks from OKF sidecar
  specifications, runs in-memory type-checking, writes the code atomically to
  the target .ts file, computes SHA-256 hashes, updates sync_state frontmatter,
  and syncs the graph database. The canonical path from sidecar spec to
  executable source code.
tags:
  - materializer
  - code-generation
  - typecheck
  - atomic-write
  - graph
module_depth: deep
status: spec
version: 1
target_code_file: ./engine.ts
status_flag: clean
exports:
  - MaterializerEngine
  - MaterializeResult
  - stringifyOkfSpec
depends_on:
  - ../../fs
  - ../../path
  - ../../crypto
  - ../../js-yaml
  - ../parser/okf
  - ../parser/ast
  - ../compiler/typechecker
  - ../graph/engine
  - ../storage/containment
used_by:
  - src/cli/router.ts
stale_details: null
---

# Materializer Engine — Code Extraction & Atomic Write

The Materializer is the canonical sidecar-to-code bridge. It orchestrates parsing, extraction, type-checking, hashing, atomic file writing, and graph synchronization in a single transactional flow.

## Materialization Flow

1. Read sidecar file content.
2. `parseOkfSpec()`: Validate frontmatter.
3. `parseMarkdown()` and `extractImplementationCode()`: Extract code string.
4. `typeCheckVirtualFile(targetPath, code)`: Return TypeCheckResult.
5. `writeAtomic(targetPath, code)`: Write to temporary file, then rename atomically.
6. Compute SHA-256 hash of code and sidecar content.
7. Update frontmatter `sync_state` and set `status='materialized'`.
8. Write updated sidecar back to disk.
9. `graphEngine.indexFile(sidecarPath)`: Re-index in dependency graph.

## Key Types

```typescript
interface MaterializeResult {
  success: boolean;
  error?: string;
  diagnostics?: string[]; // TypeScript compiler diagnostics on typecheck-failed
}

function stringifyOkfSpec(frontmatter: OkfFrontmatter, body: string): string;
// Reconstructs the full ---YAML---\nbody file content
```

## Atomic Write Pattern

Uses a `tempPath = targetPath + '.tmp-{timestamp}-{random}'` pattern with `fs.rename()`. This makes sure that the target file is never left in a partial state if the process crashes during a write.

## Key Design Decisions

- Type-check failure does not abort. The sidecar `status_flag` updates to `typecheck-failed`. Diagnostics return in `MaterializeResult.diagnostics` for callers to surface.
- `resolveContainedPath()` is called before each file write. This prevents directory traversal through malicious `target_code_file` frontmatter values.
- `stringifyOkfSpec()` is exported to allow other engines (sanding) to reconstruct sidecar file content without duplicating the YAML serialization logic.
- GraphEngine is initialized lazily on first `materialize()` call — not at construction — to keep construction cheap.
