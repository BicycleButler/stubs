---
title: Code Graph Extractor — Multi-Language AST & Pattern Extraction
type: sidecar-spec
description: >-
  Extracts symbols, definitions, calls, imports, and framework routes from
  source code and OKF sidecar files into graph nodes and confidence-tagged
  edges. Supports TypeScript compiler AST, zero-dependency regex parsers for
  Python, Go, and Rust, dynamic grammar loader checks, and web framework route
  extraction.
tags:
  - ast
  - extractor
  - typescript
  - python
  - rust
  - go
  - routes
  - confidence
module_depth: deep
context_object: ExtractedGraph
status: spec
version: 2
target_code_file: ./extractor.ts
status_flag: clean
exports:
  - extractFileGraph
  - resolveRelativeImport
  - GraphNode
  - GraphEdge
  - ExtractedGraph
  - EdgeConfidence
depends_on:
  - ../../path
  - ../../typescript
  - ../parser/okf
  - ../parser/markdown
  - ./engine
  - ./routes
used_by:
  - src/graph/engine.ts
  - src/sanding/engine.ts
---

# Code Graph Extractor

Responsible for static code analysis across languages. Analyzes code files and markdown sidecars, generating typed nodes and relational edges with confidence tags (`EXTRACTED`, `DECLARED`, `INFERRED`).
