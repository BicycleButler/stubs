---
title: 'ADR 0047: Batch Selection & Bulk Data Operations'
type: 'adr'
status: 'in-progress'
description: 'TODO Draft proposal: Standards for multi-row selection, floating batch action bars, bulk edits, batch deletion, and select-all datasets.'
date: '2026-08-20'
---

# ADR 0047: Batch Selection & Bulk Data Operations

> [!NOTE]
> **TODO / RFC Draft:** This document is in draft status within `knowledge/in-progress/` and serves as a discussion proposal for future revision and adoption. The specifications below represent proposed guidelines for review, not yet active design system enforcement rules.

## Context

Enterprise and productivity applications routinely require users to manipulate multiple records simultaneously (for example,. archiving 20 deals, reassigning 50 contacts, or exporting selected financial rows).

Without formal guidelines:

1. Batch operations introduce ad-hoc toolbars that collide with page headers (ADR 0039).
2. Users lack clarity regarding whether "Select All" applies only to the visible page (for example,. 25 rows) or the entire remote dataset (for example,. 4,200 records).
3. Indeterminate checkbox states and destructive bulk operations risk catastrophic accidental data loss.

## Proposed Guidelines & Architectural Standards

### 1 — Selection Model & Checkbox States

- Master Selection: [-] Select all 25 rows on this page (or Select all 1,420)
- Row 1: [x] Acorn Logistics — Deal #1092
- Row 2: [ ] Apex Innovations — Deal #1093
- Row 3: [x] Blue Horizon Corp — Deal #1094

- **Row Checkbox:** Leftmost column (`w-12 text-center`).
- **Header Master Checkbox:**
  - `Checked`: All items on current page are selected.
  - `Indeterminate` (`[-]`): Some, but not all, items on current page are selected.
  - `Unchecked`: Zero items selected.
- **Dataset Scope Banner:** When all page rows are selected, display an inline notification banner:
  > _"All 25 items on this page are selected. [Select all 1,420 items in Organizations]"_

### 2 — Floating Batch Action Bar

When `selectedCount > 0`, mount a fixed floating action bar:

- Floating Action Bar: [12 Selected] | Assign Rep | Export | Archive | [x] Clear

- **Position & Z-Index:** Fixed bottom-center `bottom-6 left-1/2 -translate-x-1/2`, with z-index layer `z-50` (or `z-60` above mobile footers).
- **Surface Elevation:** `shadow-lg`, background `bg-background/95 backdrop-blur-md border border-border/60 rounded-full px-4 py-2 flex items-center gap-3`.
- **Anatomy:**
  1. **Count Indicator:** `<span className="text-xs font-semibold px-2 py-1 bg-muted rounded-full">12 Selected</span>`
  2. **Separator:** Vertical neutral divider `h-4 w-px bg-border/60`.
  3. **Action Triggers:** Ghost or secondary outline buttons with icon+text (for example,. `<Tag /> Add Tag`, `<Download /> Export`).
  4. **Destructive Trigger:** Ghost button with hover-gated destructive color (ADR 0036).
  5. **Deselect All Anchor:** Icon button `<X />` (`aria-label="Clear selection"`, tooltip `"Deselect all (Esc)"`).

### 3 — Bulk Destructive & High-Risk Confirmation

- **Hard Bulk Delete / Archive:** Must open an `AlertDialog` (ADR 0032).
- **Confirmation Anatomy:**
  - Dialog title must state exact quantity: `"Delete 12 selected contacts?"`
  - Dialog body must summarize irreversible impacts.
  - For selections exceeding a high threshold (for example,. `> 100 items`), require typing the entity name or quantity to confirm.

### 4 — Keyboard Shortcuts

- `Shift + Click`: Range selection between last active row and clicked row.
- `Cmd/Ctrl + A` (when table is focused): Select all rows on current page.
- `Escape`: Clear current selection.

## Anti-Patterns & Prohibitions

1. **No Static Pushdown Toolbars:** Do not push the entire table down when selection occurs. Use the floating overlay action bar to eliminate layout shifts.
2. **No Ambiguous Bulk Delete:** Never do bulk deletions without showing the exact count of affected records.
3. **No Selection Persistence Leaks:** Leaving a page or changing filters must prompt to clear selection. Reset automatically unless designed as a multi-page cart.

## Open Questions for Discussion

- Must bulk action bars appear at the bottom-center or replace the standard 52px page toolbar at the top?
- How must optimistic background progress be surfaced when processing 1,000+ bulk updates?
