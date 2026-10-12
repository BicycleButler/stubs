---
title: Verification & Tool Suite — Domain Context Map
type: domain-context-map
domain: tools
parent_map: ../context-map.md
description: Deep-dive context map for the tools domain, subsystem responsibilities, and internal modules.
tags:
  - domain-map
  - tools
  - agent-optimized
---

# Verification & Tool Suite — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities

The Verification & Tool Suite coordinates domain logic, core types, and services for the tools subsystem.

## Key Modules & Files

src/prune/engine.ts (Hub) -> deps: none | caps: PruneIssueType, PruneIssue, PruneAuditSummary, PruneAuditResult, PruneOptions, PruneFixResult, PruneEngine, scanFiles
src/mock/engine.ts -> deps: none | caps: TestFramework, MockOptions, MockedTestCase, MockedSymbolSuite, MockScaffoldResult, classifyExportedSymbols, MockEngine, generateTestScaffold
src/changelog/engine.ts -> deps: none | caps: AdrChange, ExportChange, PhaseTransition, SpecDiff, ChangelogSummary, ArchitecturalChangelog, ChangelogOptions, ChangelogEngine
src/changelog/engine.ts.md -> deps: none | caps: ChangelogEngine, ChangelogOptions, ArchitecturalChangelog, ChangelogSummary, SpecDiff, AdrChange, ExportChange, PhaseTransition
src/lint/engine.ts.md -> deps: none | caps: ArchLintEngine, ArchLintOptions, ArchLintResult, ArchLintSummary, ArchViolation, ArchRuleType, LAYER_DEFINITIONS, getModuleLayer
src/lint/engine.ts -> deps: none | caps: ArchRuleType, ArchViolation, ArchLintOptions, ArchLintSummary, ArchLintResult, getModuleLayer, ArchLintEngine
src/mock/engine.ts.md -> deps: none | caps: MockEngine, MockOptions, MockScaffoldResult, MockedTestCase, MockedSymbolSuite, TestFramework
src/prune/engine.ts.md -> deps: none | caps: PruneEngine, PruneOptions, PruneAuditResult, PruneIssue, PruneIssueType, PruneFixResult
src/export/engine.ts -> deps: none | caps: ExportOptions, ExportResult, ExportEngine, toObsidian, toWiki
src/diagram/engine.ts -> deps: none | caps: DiagramType, DiagramOptions, DiagramResult, DiagramEngine
src/impact/engine.ts -> deps: none | caps: ImpactOptions, AffectedModuleInfo, ImpactAnalysisResult, ImpactEngine
src/diagram/engine.ts.md -> deps: none | caps: DiagramEngine, DiagramOptions, DiagramResult, DiagramType
src/impact/engine.ts.md -> deps: none | caps: ImpactEngine, ImpactOptions, ImpactAnalysisResult, AffectedModuleInfo
src/templates/engine.ts -> deps: none | caps: translateHandlebarsToEjs, compileTemplate, TemplateEngine
src/templates/engine.ts.md -> deps: none | caps: TemplateEngine, compileTemplate, translateHandlebarsToEjs
src/templates/molds/planning-map.md.tpl -> deps: none | caps: internal

## Domain Invariants

- Downward dependencies only: cross-domain calls must target canonical domain hubs.
- External consumers must interface through engine.ts, never private internal helpers.
- State changes must adhere to lifecycle and containment invariants.
