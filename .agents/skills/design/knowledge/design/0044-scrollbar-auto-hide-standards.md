---
title: '0044 - Dynamic Scrollbar Auto-Hide Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-10T13:00:00Z'
---

# 0044 - Dynamic Scrollbar Auto-Hide Standards

## Context

Across core application domain views and components (Deals Kanban, Split-Pane detail views, Dialogs, Data Tables, and Sidebars), scrollbars often remain permanently visible on screen (especially on Windows / desktop OS environments). Static, always-on scrollbars degrade visual clarity, clutter clean UI surfaces, and violate our refined design system aesthetics.

A system-wide standard is required to mandate overlay scrollbars that are visible **only when actively scrolling** and automatically fade out **300ms** after scrolling activity ends.

## Decision

### 1. Visibility & Persistence Rules

- **Hidden at Rest:** Scrollbars must be completely invisible (`opacity: 0`) when a surface or container is static / idle.
- **Active Scroll Trigger:** Scrollbars transition to visible (`opacity: 1`) strictly during active scroll events (touch, wheel, trackpad, keyboard scroll).
- **300ms Idle Persistence:** When scrolling ceases, the scrollbar must persist for exactly **300ms** before initiating fade-out.
- **Fade Duration:** Scrollbars transition out smoothly with a **150ms–200ms ease-out** transition (complying with [0022-animations-microinteractions.md]).

### 2. Zero-Width Overlay Layout

- Scrollbar tracks must function as zero-width overlays. Showing or hiding the scrollbar must never alter container padding or trigger layout reflow.
- Native `scrollbar-gutter: stable` or static scrollbar track reservations that leave empty gutters when hidden are **strictly prohibited** on content surfaces.

### 3. Component Implementation Standards

#### A. Radix `<ScrollArea />` Primitive (`src/components/ui/scroll-area.tsx`)

- All `<ScrollArea />` instances in the application MUST default to:
  - `type="scroll"`
  - `scrollHideDelay={300}`
- The `<ScrollBar />` thumb style must include `transition-opacity duration-200 ease-out`.

#### B. Native Overflow Containers (`globals.css` & CSS Utilities)

- For native scroll containers, custom scrollbar styling in `globals.css` must use transparent track properties and automatic hide timers.
- Mandated CSS class: `.scrollbar-auto-hide` or global root scrollbar auto-hide behaviors.

### 4. Exceptions & Prohibitions

- **Toolbars:** Toolbar surfaces strictly prohibit all scrollbars (`overflow-x-auto` and `overflow-y-auto` remain banned per [0039-toolbar-header-standards.md]).
- **Hover-Only Triggers Banned:** Scrollbars MUST NOT appear statically on hover alone unless active scroll motion occurs.

## Compliance & Enforcement

- Enforced through `SKILL.md` checklist.
- All new scrollable containers must use `<ScrollArea />` with `type="scroll"` + `scrollHideDelay={300}` or apply `.scrollbar-auto-hide`.
