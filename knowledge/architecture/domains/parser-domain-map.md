---
title: Parser Engine — Domain Context Map
type: domain-context-map
domain: parser
parent_map: ../context-map.md
description: Deep-dive context map for the parser domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - parser
  - agent-optimized
---

# Parser Engine — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
The Parser Engine coordinates domain logic, core types, and services for the parser subsystem.

## Key Modules & Files
- src/parser/okf.ts.md (Hub) -> deps: none | caps: OkfFrontmatter, ParsedOkfSpec, FileTreeEntry, isCodeSidecar, extractFileTreeBlocks, parseFileTreeEntries, extractMarkdownChecklists, parseOkfSpec
- src/parser/okf.ts -> deps: none | caps: OkfFrontmatter, ParsedOkfSpec, FileTreeEntry, isCodeSidecar, extractFileTreeBlocks, parseFileTreeEntries, extractMarkdownChecklists, parseOkfSpec
- src/parser/ast.ts.md -> deps: none | caps: MarkdownBlock, parseMarkdown, extractImplementationCode, extractDistilledSignatures, extractExportedSymbolNames
- src/parser/ast.ts -> deps: none | caps: MarkdownBlock, parseMarkdown, extractImplementationCode, extractDistilledSignatures, extractExportedSymbolNames
- src/compiler/typechecker.ts -> deps: none | caps: TypeCheckResult, CachedConfig, getParsedConfig, typeCheckVirtualFile
- src/compiler/typechecker.ts.md -> deps: none | caps: TypeCheckResult, typeCheckVirtualFile
- src/parser/markdown.ts.md -> deps: none | caps: extractImplementationCode, replaceImplementationCode
- src/parser/markdown.ts -> deps: none | caps: extractImplementationCode, replaceImplementationCode

## Domain Invariants
- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through okf.ts.md, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
