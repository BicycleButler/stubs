---
title: 'ADR 0045: Mobile Sticky Footer and FAB Architecture Standards'
type: 'adr'
status: 'active'
description: 'App-wide mobile action paradigm standards, 1-3 slot sticky footer layout contracts, and safe-area scroll buffers.'
date: '2026-08-10'
---

# ADR 0045: Mobile Sticky Footer and FAB Architecture Standards

## Context

Mobile web and hybrid applications frequently require persistent access to high-frequency actions (for example,., creating items, filtering datasets, invoking voice or AI assistants, or initiating communications).

Historically, applications mix two competing interaction paradigms:

1. **Floating Action Buttons (FABs)**: Unanchored circular buttons hovering over content in a screen corner.
2. **Sticky Footer Bars**: Docked horizontal toolbars pinned to the bottom of the viewport.

Mixing  paradigms within the same application creates severe usability defects:

- **UI Collisions**: Floating FABs hover directly over bottom table rows, pagination controls, or docked footer bars.
- **Safe-Area Bugs**: Hardcoded bottom CSS offsets ignore device notch and safe-area inset environment variables (`env(safe-area-inset-bottom)`).
- **Inconsistent UX**: Users face unpredictable action locations when switching between list views, detail views, and workflow pages.

## Decision

We establish an application-wide interaction paradigm consistency rule and define strict architectural standards for mobile bottom actions.

### 1. Application-Wide Paradigm Consistency

An application **MUST** select a single mobile bottom interaction paradigm across the entire application:

- **Sticky Footer Paradigm (Default for multi-action & data-dense apps)**: Selected when views require 1–3 contextual or primary actions (for example,., search/filter, primary CTA, global assistant trigger).
- **FAB Paradigm**: Selected only for minimal applications where each view requires strictly one singular floating action and zero secondary tools.

> **Rule:** Mixing FABs and Sticky Footers on different screens of the same application is strictly prohibited. Once an application selects the Sticky Footer paradigm, all page-level FABs are deprecated on mobile viewports.

### 2. Sticky Footer Slot Contract (1–3 Slots)

Sticky Footers must adapt dynamically between 1 and 3 slots based on the specific functional needs of the view:

- Layout | Slot Configuration | Use Cases
- **1-Slot (Single Primary)** | Full-width primary CTA button | Form submissions, single-action workflows, simple creation flows
- **2-Slot (Dual Action)** | Left: Secondary/Context CTA · Right: Primary CTA | Detail pages (for example,., Call / Log Note), confirmation bars (for example,., Cancel / Save)
- **3-Slot (Tri-Action Standard)** | Left: Context · Center: Primary CTA · Right: Assistant | Primary list views with search and creation

### 3. Mandatory Bottom Scroll Buffer

Each viewport that renders a mobile sticky footer must enforce a bottom scroll padding buffer on the scrollable content container:

```css
/* Make sure that content can scroll completely clear of docked bottom bars */
padding-bottom: calc(var(--sticky-footer-height, 4rem) + env(safe-area-inset-bottom, 0px));
```

This guarantees that table rows, card list items, and form fields can scroll clear of the sticky footer with zero text or control occlusion.

### 4. Safe-Area & Backdrop Standard

Every sticky footer must satisfy the following technical layout contract:

- **Positioning**: `fixed bottom-0 left-0 right-0 z-40`
- **Safe Area**: `pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]`
- **Visual Styling**: Translucent background with backdrop blur (`bg-background/85 backdrop-blur-xl`), subtle top stroke (`border-t border-border`), and top shadow elevation.
- **Responsive Display**: `flex md:hidden` (auto-hides on desktop viewports where header/top toolbars handle actions).

### 5. Z-Index Layer Hierarchy (ADR 0017 Alignment)

- `z-30`: Sticky table headers / in-page sticky tabs
- `z-40`: Mobile Sticky Footer bar
- `z-50`: Global floating toasts / snackbars
- `z-60`: Sliding drawers (for example,., Copilot Drawer, Inspector Drawer)
- `z-70`+: Modals & Alert dialogs

## Consequences

### Positive

- **Predictable Mobile UX**: Users encounter consistent action placement across all screens.
- **Zero Content Obstruction**: Safe bottom scroll buffers prevent elements from being hidden under footers.
- **Clean AI/Voice Integration**: Global tools sit cleanly inside the 3rd slot of the sticky footer rather than floating over text.

### Negative

- Requires developer discipline to apply bottom scroll clearance padding (`pb-24`) to page layout containers.
