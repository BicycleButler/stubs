---
title: Skeleton Stub Engine & AST Body Stripper
type: engine-spec
status: materialized
version: 1.0.0
phase: 4
initiative: token-optimal-intelligence
target_code_file: src/graph/skeleton.ts
status_flag: clean
tags:
  - graph
  - skeleton
  - token-compression
  - ast
  - stubs
depends_on:
  - src/graph/engine.ts
used_by:
  - src/query/engine.ts
exports:
  - SkeletonGenerator
  - SkeletonOptions
  - SkeletonResult
---

# Skeleton Stub Engine & AST Body Stripper

## Purpose & Scope

The **SkeletonGenerator** extracts interface definitions, exported type aliases, enums, class method signatures, and function contracts from source files while stripping implementation bodies into `{ /* ... */ }`. It embeds line-range anchor annotations (`// [L10-L40]`) to direct agents to exact code coordinates without loading thousand-line bodies into context windows, cutting token consumption by 80–90%.

## Key Methods

- `generateSkeleton(filePath, code, options)`: Returns distilled interface stubs across TypeScript, JavaScript, Python, Rust, and Go.
