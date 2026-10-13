---
title: '0034 - Table Design Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T05:45:00Z'
---

# 0034 - Table Design Standards

## Context

`DataTable` handles tabular data display. Outdated paradigms create visual clutter and impair scannability. Dedicated status columns, pill badges, colored dots, and unaligned numbers clutter the view.

## Decision

### 1 — Structural Cleanliness (Ban on Badges, Dots & Heavy Grid Lines)

- **Zero Badges, Pills, or Dots:** Dedicated status columns, pill badges, and colored dots are prohibited system-wide.
- **No Heavy Grid Lines:** Vertical cell borders are forbidden. Table cells rely on generous horizontal spacing and subtle row divider strokes (`border-b border-border/40`).

### 2 — Categorical Data Tier Patterns

All categorical attributes, record tiers, and status information must be displayed using one of two approved system patterns:

#### Sub-label Stacking (System Standard — Default)

- **Sub-label Stacking Inside a Single Cell:** Primary text sits on the top line. Secondary metadata, tier names, and IDs sit stacked on the bottom line within the exact same primary cell.
- **Typography & Opacity Hierarchy:**
  - **Top Line:** Primary Identifier / Name in `font-medium text-foreground`.
  - **Bottom Line:** Muted Tier Name $\cdot$ Secondary ID at **50%–60% opacity** (`text-muted-foreground/60 text-xs`).

```
[ Primary Record Name                             ]
[ Gold Tier · ID: #84920                          ]
```

#### Margin Wash Variant (Enhanced Flare Variant — Option)

- **Left-Edge Margin Wash:** Reserved for high-contrast or brand-flair requirements.
- **Visual Spec:** A subtle left-edge margin gradient wash ($\approx$6%–12% opacity linear gradient fading out completely within the first 20%–30% container width) applied to the record row or primary cell.

### 3 — Numeric Right-Alignment

- **Mandatory Right-Alignment:** All metrics, amounts, percentages, counts, and dates must be right-aligned (`text-right`) to align decimal places vertically.
- **Left-Alignment:** Text strings, names, and stacked Sub-label Stacking labels are left-aligned (`text-left`).
- **Column Header Alignment:** Headers must align with their column data (right-align numeric headers, left-align text headers).

### 4 — Density Toggle Specs

Tables must support a user density toggle:

- **Comfortable Density (Default):** 16px cell padding (`py-4 px-4`), 64px row height (`h-16`). Designed for general overview and browsing.
- **Compact Density:** 8px cell padding (`py-2 px-3`), 48px row height (`h-12`). Designed for financial data grids and high-density operational workflows.

### 5 — Inline & Menu-Gated Row Actions

- Row actions use neutral `ghost` icon buttons.
- **Canonical source for color-at-rest and destructive entry point rules:** [0036-destructive-action-confirmation.md]. Summary: destructive row actions must never appear as persistent red buttons. They must be tucked inside an overflow menu (`MoreHorizontal` ghost icon). Red accent highlights manifest only when hovering over the destructive item inside the open menu.

### 6 — Responsive Table Adaptations

**Canonical source:** [0024-responsive-layout.md] defines the full Desktop / Tablet / Mobile table adaptation spec. Summary:

- **Desktop (>1024px):** Full structured table.
- **Tablet (768px–1024px):** Progressive column hiding. Secondary columns collapse into expandable detail rows.
- **Mobile (<768px):** Mandatory Mobile Card Transformation — grid structures dismantle into stacked cards with Sub-label Stacking.

## Consequences

- Data tables are clean, scannable, and free of noisy badges, dots, and grid lines.
- Numeric alignment enables effortless visual comparison of figures across rows.
- Sub-label Stacking compresses primary data and secondary status into a single readable column.
- Menu-gated destructive actions prevent accidental record deletion.
