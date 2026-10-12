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
> The `badge.tsx` component, static status pills, colored status dots (`•`), and standalone colored status text are **completely deprecated system-wide**. No new features may consume `badge.tsx` or introduce pill/dot status indicators.

## Decision

### 1 — System-Wide Deprecation

- **Total Ban:** Static status pills, badges, colored dots (`•`), and standalone colored status strings are strictly prohibited across all views, tables, header bars, and cards.
- **Component Deprecation:** `badge.tsx` is marked deprecated. Existing imports must be refactored to Sub-label Stacking or Margin Wash Variant data tier patterns.

### 2 — System-Sanctioned Replacements

All categorical data, entity tiers, lifecycle states, and status metadata must be displayed using the sanctioned **Sub-label Stacking** (sub-label stacking) and **Margin Wash Variant** (left-edge margin wash) patterns. **Full specs are defined in [ADR 0034 §2 — Table Design Standards](0034-table-design-standards.md#2--categorical-data-tier-patterns) — refer there for implementation details.** Do not re-define or diverge from the specs in that ADR.

### 3 — Unread & Notification Indicators

Numeric unread counts or system updates must be represented as plain text numbers or inline typography integrated into item sub-labels, rather than floating colored badges.

## Consequences

- `badge.tsx` and static pill indicators are completely eliminated.
- Resting application views achieve visual harmony through clean typography scale.
- Categorical attributes and status data rely on Sub-label Stacking system-wide.
