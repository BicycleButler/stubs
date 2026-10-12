---
title: 'ADR 0046: Tabs, Segmented Controls & Secondary Navigation Standards'
type: 'adr'
status: 'in-progress'
description: 'TODO Draft proposal: Interaction standards for tabs, segmented controls, active indicators, tablist keyboard navigation, and responsive overflow.'
date: '2026-08-20'
---

# ADR 0046: Tabs, Segmented Controls & Secondary Navigation Standards

> [!NOTE]
> **TODO / RFC Draft:** This document is in draft status within `knowledge/in-progress/` and serves as a discussion proposal for future revision and adoption. The specifications below represent proposed guidelines for review, not yet active design system enforcement rules.

---

## Context

Web applications frequently require switching between sub-views, filtering content domains, or organizing complex detail panes without triggering full-page route reloads.

Currently, applications inconsistently mix underline tabs, button pill groups, full segmented controls, and secondary sub-navigation links. Furthermore:

1. Keyboard accessibility (WAI-ARIA `tablist` / `tab` / `tabpanel`) is frequently neglected.
2. Layout shifts occur when switching between tabs of unequal height.
3. Tab counts often tempt developers to reintroduce deprecated pill badges (violating ADR 0035).
4. On narrow mobile viewports, multi-tab headers wrap uncontrollably or overflow off-screen without scroll indicators.

---

## Proposed Guidelines & Architectural Standards

### 1 — Taxonomy & Usage Decision Matrix

| Control Type            | Visual Metaphor                                                                                      | Primary Use Case                                                               | Sizing & Placement                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| **Underline Tabs**      | Flat text with animated bottom indicator line (`h-0.5 bg-primary`)                                   | Page-level or section-level view switching (e.g. Overview, Activity, Settings) | Contained within section header; full width or auto-width |
| **Segmented Control**   | Inset pill track (`bg-muted/50 p-1 rounded-lg`) with sliding active card (`bg-background shadow-xs`) | High-frequency view mode toggling (e.g. Grid vs List, Month vs Week vs Day)    | Max 4–5 short options; fixed height 32px or 36px          |
| **Pill / Filter Chips** | Independent clickable chips with border and subtle background                                        | Multi-select or single-select filtering (e.g. Categories, Tags)                | Used within filter toolbars (ADR 0039); wraps or scrolls  |

---

### 2 — Underline Tabs Specification

```
┌────────────────────────────────────────────────────────────┐
│  Overview    Activity (12)    Documents    Settings        │
│ ──────────                                                 │
└────────────────────────────────────────────────────────────┘
```

- **Container:** Borderless at rest; subtle bottom separator `border-b border-border/40`.
- **Tab Item:** `text-sm font-medium`, resting state `text-muted-foreground hover:text-foreground transition-colors duration-150`.
- **Active State:** `text-foreground font-semibold`. The active indicator is an absolute positioned bottom bar `h-[2px] bg-primary rounded-full` transitioning via CSS transform / `framer-motion` layoutId.
- **Tab Counts (ADR 0035 Compliance):** Counts must be appended as neutral text within the label, e.g. `Activity (12)` or `<span className="text-xs text-muted-foreground/70 ml-1.5 font-normal">12</span>`. Static colored badge pills remain strictly forbidden.

---

### 3 — Segmented Control Specification

```
┌──────────────────────────────────────┐
│ [  List View  ]   Grid View   Kanban │
└──────────────────────────────────────┘
```

- **Track:** `inline-flex items-center bg-muted/60 p-1 rounded-lg h-9 border border-border/20`.
- **Item:** `px-3 py-1 text-xs font-medium rounded-md transition-all duration-200`.
- **Active Segment:** `bg-background text-foreground shadow-xs font-semibold`.
- **Icons:** When paired with text, use 16px Lucide icons on the leading side (`gap-1.5`). Icon-only segmented controls must provide `aria-label`s and 200–300ms tooltip delay tiers.

---

### 4 — Keyboard Navigation & Accessibility (WAI-ARIA)

- **Container:** `role="tablist"` with `aria-orientation="horizontal"`.
- **Tab Triggers:** `role="tab"`, `aria-selected="true|false"`, `aria-controls="panel-id"`, `id="tab-id"`.
- **Panels:** `role="tabpanel"`, `id="panel-id"`, `aria-labelledby="tab-id"`, `tabIndex={0}`.
- **Keyboard Interaction:**
  - `ArrowLeft` / `ArrowRight`: Moves focus to previous/next tab (with optional automatic activation).
  - `Home` / `End`: Jumps to first / last tab.
  - `Enter` / `Space`: Activates the focused tab (if manual activation is configured).

---

### 5 — Mobile & Responsive Adaptation

- **Horizontal Scroll with Fade Masks:** On viewports `< 640px` (`sm`), tablists must not wrap to multi-line. Instead, enable horizontal scrolling (`overflow-x-auto no-scrollbar`) with progressive edge fade masks:
  ```css
  mask-image: linear-gradient(
    to right,
    transparent,
    black 16px,
    black calc(100% - 16px),
    transparent
  );
  ```
- **Segmented Control Collapse:** If a segmented control exceeds available width on mobile, it must collapse into a standard `<Select>` dropdown trigger.

---

## Anti-Patterns & Prohibitions

1. **No Multi-Row Tab Wrapping:** Tabs must never wrap to multiple vertical lines; wrapping causes severe visual clutter and layout jumping.
2. **No Colored Pill Badges on Tabs:** Never embed `<Badge>` or colored status dots inside tab triggers.
3. **No Unstyled Tab Transitions:** Tab content panel switching should use a subtle opacity fade (150ms `ease-out`) to prevent jarring content flashes.

---

## Open Questions for Discussion

- Should tab panel heights be locked to the tallest panel, or animate height dynamically during tab transitions?
- Should tabs update URL query parameters (`?tab=activity`) by default for all top-level entity views?
