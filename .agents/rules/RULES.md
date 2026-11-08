---
title: "OmniButler Ecosystem Rules & Progressive Invariants"
type: "rules"
status: "active"
description: "Universal compiler standards, strict system invariants, and progressive domain routing matrix for coding agents across the OmniButler ecosystem."
---

# Repository Rules & Constraints

## 1. Compiler & Linter Standards: Maximum Strictness Mandate
- **Zero Tolerance for `any`:** Never use `any`. Always supply precise types, generic parameters, or `unknown` with runtime validation guards (such as Zod).
- **Prohibited Non-Null Assertions (`!`):** Never bypass nullability checks with `!`. Handle undefined or null states defensively using optional chaining (`?.`), nullish coalescing (`??`), or explicit conditional assertions.
- **Forbidden Diagnostic Suppressions:** Never suppress compiler or linter diagnostics (`// @ts-ignore`, `// @ts-expect-error`, `/* eslint-disable */`). Fix the underlying type signature directly.
- **No Unsafe Type Casts:** Do not perform blind casts (such as `as unknown as TargetType`). Validate payloads using Zod or comprehensive type narrowing guards.

## 2. Canonical Tech Stack & System Invariants
- **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`) accessed strictly through Drizzle ORM (`drizzle-orm`, `drizzle-zod`).
- **Authentication:** Firebase Auth accessed strictly through `@wiltermoodj/auth` with wildcard `__session` cookies and canonical Firebase UIDs (`users.uid`).
- **AST Dependency Graph & Maintenance:** AST dependency graph is maintained in `.stubs/graph.sqlite`. Run `npx stubs run` as the unified pipeline to refresh graph, sync stubs, sand sidecars, lint architecture, and auto-remediate mechanical formatting.

## 3. Domain Guidelines & Progressive Disclosure Routing
Specialized domain rules are decoupled from this file to preserve agent context. Consult these dedicated resources when performing relevant work:

- **UI, UX & Component Design:**
  - For UI component design, token scales, layout structure, and accessibility: see [.agents/skills/design/DESIGN-RULES.md].
  - Detailed design reference and ADR lookup: see [.agents/skills/design/REFERENCE.md].
- **Technical Writing & Documentation (TALE):**
  - Use ASD-STE100 Simplified Technical English rules **strictly when authoring NEW markdown files or NEW code comments**.
  - When editing or refactoring existing markdown documents or comments, do not invoke the `tale` skill; automated fixes are handled by `npx stubs run`.
  - For new authoring standards: see [.agents/skills/tale/SKILL.md].
- **Copy & Microcopy Standards:**
  - In-app telegraphic microcopy and error states: see [knowledge/guidelines/in-app-copy-rules.md].
  - Public marketing copy and marketplace compliance: see [knowledge/guidelines/marketing-copy-guide.md].
