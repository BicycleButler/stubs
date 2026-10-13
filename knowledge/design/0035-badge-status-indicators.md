---
title: '0035 - System Ban on Badges & Categorical Status Hierarchy'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T05:45:00Z'
---

# 0035 - System Ban on Badges & Categorical Status Hierarchy

## Context

Legacy UI patterns relied on static status pills, colored dot indicators (`•`), standalone colored status strings, and `badge.tsx` variants. These components created visual noise, caused color clutter on resting screens, and violated human-perceived contrast consistency.

> [!CAUTION]
>
> ### Total Deprecation Notice
>
> The `badge.tsx` component, static status pills, colored status dots (`•`), and standalone colored status text are **completely deprecated system-wide**. No new features can consume `badge.tsx` or introduce pill/dot status indicators.

## Decision

### 1 — System-Wide Deprecation

- **Total Ban:** Status pills, badges, colored dots, and static colored strings are prohibited across all views.
- **Component Deprecation:** `badge.tsx` is marked deprecated. Existing imports must be refactored to Sub-label Stacking or Margin Wash Variant data tier patterns.

### 2 — System-Sanctioned Replacements

Display categorical data using sub-label stacking and margin wash patterns. Full specifications are in [0034-table-design-standards.md].

### 3 — Unread & Notification Indicators

Numeric unread counts or system updates must be represented as plain text numbers or inline typography integrated into item sub-labels, rather than floating colored badges.

## Consequences

- `badge.tsx` and static pill indicators are completely eliminated.
- Resting application views achieve visual harmony through clean typography scale.
- Categorical attributes and status data rely on Sub-label Stacking system-wide.
