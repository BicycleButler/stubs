---
title: 'ADR 0049: Drag-and-Drop, Kanban & Reordering Interactions'
type: 'adr'
status: 'in-progress'
description: 'TODO Draft proposal: Visual states, ghost cards, insertion lines, and accessible keyboard reordering for Kanban boards and list sortables.'
date: '2026-08-20'
---

# ADR 0049: Drag-and-Drop, Kanban & Reordering Interactions

> [!NOTE]
> **TODO / RFC Draft:** This document is in draft status within `knowledge/in-progress/` and serves as a discussion proposal for future revision and adoption. The specifications below represent proposed guidelines for review, not yet active design system enforcement rules.

---

## Context

Interactive boards (e.g. Deals pipeline stages, task lists, column reordering) rely heavily on drag-and-drop (DnD) interactions.

Without clear guidelines:

1. Dragged elements lack consistent elevation or tilt feedback.
2. Drop targets lack clear insertion indicators, causing accidental placements.
3. Keyboard-only and assistive technology users cannot reorder items.
4. Auto-scrolling on container edges is jumpy or broken.

---

## Proposed Guidelines & Architectural Standards

### 1 — Drag States & Visual Elevation

```
┌───────────────────────────────────────┐
│ Deal: Acme Global Expansion           │  ◄── Dragging Card:
│ Value: $45,000                        │      - Elevated to `shadow-xl`
│ Contact: Sarah Connor                 │      - Slight rotation: `rotate-[1.5deg]`
└───────────────────────────────────────┘      - Cursor: `cursor-grabbing`
═════════════════════════════════════════  ◄── Insertion Indicator Line (`h-1 bg-primary`)
┌ - - - - - - - - - - - - - - - - - - - ┐
│ [ Ghost placeholder: opacity-40 ]     │  ◄── Original Slot:
└ - - - - - - - - - - - - - - - - - - - ┘      - `border-2 border-dashed border-muted-foreground/30`
```

- **Resting Affordance:** Draggable cards/rows must show a drag handle icon (`GripVertical className="text-muted-foreground/40 hover:text-foreground cursor-grab"`).
- **Active Drag State:**
  - Elevation: Rises to `shadow-xl` and scale `scale-[1.02]`.
  - Subtle Tilt: `rotate-[1.5deg]` to communicate physical detachment.
  - Ghost Slot: The origin slot displays a dashed neutral border (`border-2 border-dashed border-border/60 bg-muted/20`).
- **Drop Target / Insertion Line:**
  - Highlight the exact insertion position with a `h-1 bg-primary rounded-full` indicator bar.
  - Column highlight: Subtle background wash (`bg-muted/40 transition-colors duration-150`).

---

### 2 — Accessible Keyboard Reordering (A11y Pattern)

Every draggable item must support keyboard-driven movement:

1. **Focus:** Tab to the drag handle button (`aria-label="Reorder [Item Name], position 2 of 5"`).
2. **Grab:** Press `Space` or `Enter` to initiate drag mode. Screen reader announces: `"Grabbed [Item Name]. Current position 2 of 5. Use arrow keys to move."`
3. **Move:** Press `ArrowUp` / `ArrowDown` (or `ArrowLeft` / `ArrowRight` on Kanban columns) to shift position. Live region updates: `"Moved to position 3 of 5."`
4. **Drop:** Press `Space` or `Enter` to commit. Screen reader announces: `"Dropped [Item Name] at position 3 of 5."`
5. **Cancel:** Press `Escape` to revert item to original position.

---

### 3 — Container Edge Auto-Scrolling

- **Trigger Zone:** Within **48px** of the top/bottom/left/right boundary of a scrollable board container.
- **Scroll Acceleration:** Smooth acceleration based on cursor proximity (from 5px/frame up to 25px/frame).
- **Auto-Hide Scrollbars:** Must integrate with ADR 0044 auto-hide scrollbar behavior.

---

## Anti-Patterns & Prohibitions

1. **No Drag-Only Interfaces:** An interface must never require drag-and-drop as the sole way to accomplish a task. Always provide a fallback (e.g. a "Move to..." menu option in the row/card overflow trigger).
2. **No Layout Jumps on Drop:** Transition cards into their new position with a quick 150ms `ease-out` translation.
3. **No Unbounded Dropzones:** Drop targets must have distinct visual boundaries.

---

## Open Questions for Discussion

- Should drag handles be visible at all times or appear only on hover/focus?
- On touch devices, should drag-and-drop require a long-press (e.g. 250ms) to distinguish dragging from scrolling?
