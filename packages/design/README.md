# @wiltermood/design

Codebase-agnostic UI/UX design guidelines, token scales, and automated compliance tools for AI coding agents.

## Overview

`@wiltermood/design` establishes a consistent, high-polish visual and interaction foundation. It provides:

1. **Design Tokens & Invariants**: Rules for spacing, typography scale, surface elevations, and color contracts.
2. **Audit & Remediation Tools**: Automated scripts for scanning and remediating UI violations (static colors, badges, accessibility).
3. **AI Agent Skill**: Ready-to-use `.agents/skills/design` skill and `.agents/rules/design-rules.md` workspace rule.

## Installation

```bash
# Add via unified stubs CLI
npx stubs add design

# Or install package
npm install --save-dev @wiltermood/design
```

## Running Audits

```bash
# Audit design system compliance
npm run audit

# Run automated remediation
npm run remediate
```
