---
title: Query Engine — GraphRAG and Unified Surgical Query
type: sidecar-spec
description: >-
  Retrieves token-budgeted subgraph context packages for natural language
  questions and executes surgical graph queries (shortest path, explain node,
  blast radius) via unified prefix and flag interfaces.
tags:
  - query
  - graphrag
  - blast-radius
  - shortest-path
  - explain
  - topology
module_depth: deep
context_object: QueryEngine
status: spec
version: 2
target_code_file: ./engine.ts
status_flag: clean
exports:
  - QueryEngine
  - QueryOptions
  - QueryResult
  - QuerySubGraphNode
  - QuerySubGraphEdge
  - SurgicalQueryKind
depends_on:
  - ../graph/engine
  - ../graph/topology
  - ../storage
  - ../config/schema
used_by:
  - src/cli/router.ts
  - src/server/mcp.ts
stale_details: null
---

# Query Engine — GraphRAG and Unified Surgical Query

The `QueryEngine` provides a single unified entry point for both broad semantic graph context retrieval (GraphRAG) and targeted surgical queries (symbol explanation, shortest path relational traces, and downstream blast radius impact).

## Surgical Query Modes

In addition to broad token-budgeted subgraph queries, `QueryEngine.query()` supports surgical operations:

1. **Explain Symbol / Node:** `explain: <target>` or `--explain <target>`
2. **Shortest Path:** `path: <source> to <target>` or `--path <source> <target>`
3. **Blast Radius Impact:** `blast: <target>` or `--blast <target> [--depth <n>]`

## Interface Definitions

```typescript
export type SurgicalQueryKind = 'search' | 'explain' | 'path' | 'blast';

export interface QueryOptions {
  budget?: number; // approximate token budget (default: 1500 tokens)
  mode?: 'bfs' | 'dfs'; // traversal mode (default: 'bfs')
  maxDepth?: number; // max hops (default: 2)
  configPath?: string;
  surgical?: {
    kind: SurgicalQueryKind;
    target?: string;
    source?: string;
    depth?: number;
  };
}
```
