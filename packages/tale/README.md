# @wiltermood/tale

ASD-STE100 Issue 9 Simplified Technical English (STE) governance, rules, and linter for AI coding agents.

## Overview

`@wiltermood/tale` enforces concise, unambiguous technical documentation and code comments. It provides:

1. **Rule Engine**: Validates sentence lengths, active voice, approved vocabulary, and ADR-001 structural formatting.
2. **Linter CLI**: `tale-lint` can scan markdown documents and source code comments.
3. **AI Agent Skill**: Ready-to-use `.agents/skills/tale` skill and `.agents/rules/agent-conciseness-and-tale.md` rule.

## Installation

```bash
# Add via unified stubs CLI
npx stubs add tale

# Or install package
npm install --save-dev @wiltermood/tale
```

## Usage

```bash
# Lint markdown files
npx tale-lint

# Lint code comments in src/
npx tale-lint --code src/
```
