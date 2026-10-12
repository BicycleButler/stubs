---
title: 'Design Principles Index'
type: 'index'
description: 'Index of all design system ADRs governing UI/UX principles'
status: 'active'
last_updated: '2026-08-08T06:15:00Z'
---

# Design Principles

Architectural Decision Records governing visual design, interaction patterns, and UI/UX standards for any UI project. All design ADRs are **Accepted** and enforced by the `design-guidelines` agent skill.

> **Agent note:** Read `SKILL.md` for the compiled enforcement checklist. Read individual ADRs for full rationale and detailed rules.

## Code & Naming Standards

- [0015 - Style Guide](0015-style-guide.md) — `camelCase` in code; `Title Case` in UI display

## Visual Foundations

- [0017 - Layout & Structure Standards](0017-layout-structure.md) — F-pattern, sidebar spec, z-index scale, whitespace-over-borders grouping
- [0018 - Spacing & Scaling System](0018-spacing-scaling.md) — 4px grid, 7-token scale, content widths, border radius tokens
- [0019 - Typography Standards](0019-typography.md) — 2 families, Golden Ratio modular scale (max 6 tiers, max 24px), 4 weights
- [0020 - Color System Architecture](0020-color-system.md) — OKLCH modeling, 3-seed derivation, Tier 2 semantic tokens, chart hue stepping, Zero Static Alert Colors
- [0021 - Iconography & Imagery Standards](0021-iconography-imagery.md) — Lucide, 5 icon sizes, avatar immutable container rule
- [0041 - Elevation & Surface Tier System](0041-surface-tier-system.md) — 5-tier shadow scale tokens, `surface` prop (raised/flat/flush/inset), `ContainerPanel` primitive, modal backdrop, dark mode ring supplements

## Interaction & Motion

- [0022 - Animations, Motion & Transition Standards](0022-animations-microinteractions.md) — No linear easing, 200–500ms budget, tooltip delay tiers, async state visuals (skeleton-first), route transitions, section mounts, stagger, forbidden patterns
- [0044 - Dynamic Scrollbar Auto-Hide Standards](0044-scrollbar-auto-hide-standards.md) — Scrollbars hidden at rest, visible only on active scroll, 300ms idle persistence before 150ms fade out, zero-width overlay layout contract

## Layout & Navigation

- [0024 - Responsive & Adaptive Layout](0024-responsive-layout.md) — Desktop >1024px, tablet 768–1024px, mobile <768px card transformation
- [0037 - Navigation Header Bar](0037-navigation-header-bar.md) — 3-zone layout, frosted glass, breadcrumb placement
- [0039 - Page Toolbar & Section Header Standards](0039-toolbar-header-standards.md) — 52px single-row toolbar, icon-only borderless buttons (200–300ms tooltip tier), zone division, filter consolidation
- [0040 - Split Pane Detail Cards Dynamic Layout](0040-split-pane-detail-cards.md) — Dynamic CSS Grid Inspector Pane layout, priority rankings by entity
- [0028 - Theming & Dark Mode](0028-theming-dark-mode.md) — Theme token contract, z-index lightness hierarchy (4%–6% dark gap), system preference
- [0045 - Mobile Sticky Footer & FAB Architecture](0045-mobile-sticky-footer-and-fab-patterns.md) — App-wide interaction paradigm consistency, 1–3 slot layout contract, safe-area scroll buffers.

## Components

- [0029 - Button Hierarchy & States](0029-button-hierarchy-states.md) — Variant decision rule, text-slide exception, loading state, keyboard focus
- [0043 - Button Text vs Icon Rules](0043-button-text-vs-icon-rules.md) — Surface presence principle, text pairing taxonomy, Primary CTA criteria, step-by-step heuristic
- [0032 - Modal & Dialog Standards](0032-modal-dialog-standards.md) — AlertDialog vs Dialog vs Sheet, size tiers, header/footer anatomy, nesting ban
- [0033 - Toast & Notification Rules](0033-toast-notification-rules.md) — Auto-dismiss durations, undo toast, max 3 concurrent, toast vs. bell boundary
- [0034 - Table Design Standards](0034-table-design-standards.md) — Structural cleanliness (no badges/grid lines), Sub-label Stacking/Margin Wash Variant patterns, numeric right-alignment, density toggle
- [0035 - System Ban on Badges & Categorical Status Hierarchy](0035-badge-status-indicators.md) — Total deprecation of `badge.tsx`, pills, dots; Sub-label Stacking/Margin Wash Variant replacements
- [0036 - Semantic Color at Rest & Destructive Action Confirmation](0036-destructive-action-confirmation.md) — Zero semantic color on resting surfaces, menu-gated entry points, AlertDialog anatomy

## Forms & Data

- [0025 - Forms & Input Design](0025-forms-inputs.md) — Dynamic validation, labels above inputs, AI-assisted input patterns (prompt canvases, execution trails)
- [0026 - Data Visualization Standards](0026-data-visualization.md) — Labeled axes, tabular alt, OKLCH palette (defers to ADR 0020 §6)
- [0042 - Multi-Step Wizards & Complex Workflow Standards](0042-multi-step-wizards.md) — Facebook 3-zone layout (tree sidebar / canvas / live preview), draft auto-save, click-to-validate Next button, accordion review step

## Accessibility

- [0023 - Accessibility Standards](0023-accessibility.md) — WCAG 2.1 AA, focus rings, keyboard nav, ARIA, 44px touch targets

## Content & Copy

- [0030 - Content Formatting Standards](0030-content-formatting.md) — Dates (relative/absolute rules), currency, numbers, unknowns (`—`), phone, address
- [0031 - UX Copy & Microcopy Standards](0031-ux-copy-microcopy.md) — Tone, verb-first button labels, error structure, empty states, forbidden phrases

---

## Cross-References to Architecture ADRs

- [ADR 0011 — Optimistic UI Merging](../architecture/adr/0011-optimistic-ui-merging.md) — data-layer merge strategy; ADR 0022 governs the visual layer
- [ADR 0012 — Human-in-the-Loop AI](../architecture/adr/0012-human-in-the-loop-ai-enrichment.md) — ReviewQueue; referenced by ADR 0022

---

> **Corpus:** 26 active ADRs (0015–0043, excluding deprecated 0016, merged 0027→0041, merged 0038→0022).
