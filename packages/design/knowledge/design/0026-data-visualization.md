---
title: '0026 - Data Visualization Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-07-18T18:35:00Z'
---

# 0026 - Data Visualization Standards

## Context

Charts without labeled axes, insufficient color contrast, or missing tabular alternatives inaccessible and misleading. Chart tooltips obscure data points or charts do not reflow on mobile viewports degrade analytical experience.

## Decision

1. **Chart Color Palette:** Follow [0020-color-system.md] — OKLCH hue stepping at 25°–30° with locked Lightness and Chroma. WCAG AA contrast required. Color vision deficiency distinguishability required (minimum 5 colors, maximum 8 per series).
2. **Mandatory Labeling:** Title, labeled axes (with units), legend (multi-series), gridlines at readable intervals.
3. **Tooltips:** Hover (desktop) and tap (mobile). Show exact value, series name, and unit. Follow cursor without obscuring data.
4. **Responsive Reflow:** Below `md` — simplify to key metrics or tabular summary. Legends move below chart. Min height 200px.
5. **Accessibility:** Tabular data alternative for every chart. `aria-label` on chart containers describing trend.
