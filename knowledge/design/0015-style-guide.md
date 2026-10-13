---
title: '0015 - Style Guide'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-07-18T17:50:00Z'
---

# 0015 - Style Guide

## Context

The codebase uses inconsistent casing styles across types, schemas, and models. This causes confusion and integration friction. A single casing standard is necessary for property names. User interface labels must display in Title Case.

## Decision

mandate following casing requirements:

1. **Internal Code & Property Casing:** Property names in interfaces, schemas, models, and variables must use lowercase camelCase.
2. **Casing Variants to Convert:** Properties using casing styles (as `snake_case`, `Title Case`, `PascalCase`, and `kebab-case`) considered violations.
3. **Automated Enforcement:**`schema-case-standardizer` tool will used to scan, identify, and automate migration of non-camelCase properties to lowercase `camelCase`.
4. **User Interface (UI) Display:** Display labels and headers in Title Case. Convert camelCase properties to Title Case during rendering.
