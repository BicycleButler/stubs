---
title: '0024 - Responsive & Adaptive Layout'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T12:25:00Z'
---

# 0024 - Responsive & Adaptive Layout

## Context

Desktop layouts fail on mobile screens. Tables overflow, multi-column forms degrade, and fixed footers obscure content. Without unified breakpoint conventions, safe-area inset management, and adaptive action slotting, responsive mobile layouts cause content clipping and underutilized empty bottom bars.

## Decision

Adopt responsive layout standards across all viewports and components:

1. **4 Breakpoints:** `sm` (≥640px), `md` (≥768px), `lg` (≥1024px), `xl` (≥1280px).
2. **Mobile-First:** Base CSS targets the smallest viewport. Layout complexity scales upward responsively.
3. **Data Table Viewport Adaptation Standards:**
   - **Desktop (>1024px):** Render a full structured data table with generous row height (48px–64px) and complete column visibility.
   - **Tablet (768px–1024px):** Enforce progressive column hiding. Secondary metadata columns collapse into expandable inline detail rows or drawer summaries while preserving core primary columns.
   - **Mobile (<768px):** Mandatory **Mobile Card Transformation**. Data tables must dismantle grid rows and render stacked cards with internal visual hierarchy on mobile screens. Horizontal scrolling for primary tabular data is forbidden.
4. **Form & Navigation Adaptation:** Multi-column forms transition to single-column below 768px (`md`). Side panels convert to slide-over drawers below 1024px (`lg`). Navigation header collapses utility labels to icons below 640px (`sm`).
5. **Safe Area & Sticky Footer Clearance Handling:**
   - Single Scroll Authority: Page layouts must not introduce nested scrolling containers. The primary element handles viewport scrolling.
   - Bottom Scroll Clearance: All scrollable containers accommodating mobile sticky bars (`QuickActionBar`, `WizardShell` footer, FAB, dialog footers) must enforce safe-area bottom padding budget: `pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-16` (or `pb-[calc(6rem+env(safe-area-inset-bottom,0px))]` on detail pages).
   - Fixed Footer Safe-Area Offset: Fixed bottom bars must append safe area padding above home indicator bars.
6. **Adaptive Mobile Sticky Footer Slotting (Zero Disabled Slots Rule):**
   - Mobile sticky footers must never present disabled buttons or empty slots when entity attributes do not exist.
   - Footers must slot alternative high-value actions in priority order. This guarantees 3 active touch targets.
   - Sticky footers use frosted glass styling (`bg-background/80 backdrop-blur-xl border-t shadow-lg z-50`).
7. **Viewport Meta:** `width=device-width, initial-scale=1`.
