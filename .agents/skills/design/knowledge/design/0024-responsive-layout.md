---
title: '0024 - Responsive & Adaptive Layout'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T12:25:00Z'
---

# 0024 - Responsive & Adaptive Layout

## Context

Applications designed only for desktop viewports break on tablets and phones — data tables overflow, multi-column forms become unusable, fixed-position elements overlap device notches, and mobile sticky footers obscure bottom page content. Without unified breakpoint conventions, safe-area inset management, and adaptive action slotting, responsive mobile layouts cause content clipping and underutilized empty bottom bars.

## Decision

Adopt responsive layout standards across all viewports and components:

1. **4 Breakpoints:** `sm` (≥640px), `md` (≥768px), `lg` (≥1024px), `xl` (≥1280px).
2. **Mobile-First:** Base CSS targets the smallest viewport; layout complexity scales upward responsively.
3. **Data Table Viewport Adaptation Standards:**
   - **Desktop (>1024px):** Render a full structured data table with generous row height (48px–64px) and complete column visibility.
   - **Tablet (768px–1024px):** Enforce progressive column hiding. Secondary metadata columns collapse into expandable inline detail rows or drawer summaries while preserving core primary columns.
   - **Mobile (<768px):** Mandatory **Mobile Card Transformation**. Data tables must dismantle grid row structures and re-render each row as a stacked card with clean internal visual hierarchy (Primary title top-left, stacked sub-labels below via Sub-label Stacking). Horizontal scrolling for primary tabular data is forbidden.
4. **Form & Navigation Adaptation:** Multi-column forms transition to single-column below 768px (`md`). Side panels convert to slide-over drawers below 1024px (`lg`). Navigation header collapses utility labels to icons below 640px (`sm`).
5. **Safe Area & Sticky Footer Clearance Handling:**
   - Single Scroll Authority: Page layouts (`PageLayout`, `DetailLayout`) must not introduce nested `overflow-y-auto min-h-screen` containers inside the main app shell (`<main id="main-content">`). `<main>` handles viewport scrolling.
   - Bottom Scroll Clearance: All scrollable containers accommodating mobile sticky bars (`QuickActionBar`, `WizardShell` footer, FAB, dialog footers) must enforce safe-area bottom padding budget: `pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-16` (or `pb-[calc(6rem+env(safe-area-inset-bottom,0px))]` on detail pages).
   - Fixed Footer Safe-Area Offset: Fixed bottom bars must append `pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]` to ensure floating elevation above iOS home indicator bars.
6. **Adaptive Mobile Sticky Footer Slotting (Zero Disabled Slots Rule):**
   - Mobile sticky footers must never present disabled grey buttons or empty slots when entity attributes (phone, coordinates) are missing.
   - Footers must dynamically slot alternative high-value actions in priority order (Call → Email → Log Note; Navigate → Email → Log Activity), guaranteeing 3 active touch targets.
   - Sticky footers use frosted glass styling (`bg-background/80 backdrop-blur-xl border-t shadow-lg z-50`).
7. **Viewport Meta:** `width=device-width, initial-scale=1`.
