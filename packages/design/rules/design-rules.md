---
title: 'Design System Rules & Agent Routing Matrix'
type: 'rules'
status: 'active'
description: 'Lightweight context map, token scale summary, and routing matrix for AI agents implementing UI/UX design standards and running automated compliance scripts.'
---

# UI/UX Design System Rules & Agent Routing Matrix

This document provides a fast, token-efficient routing matrix and decision guide for AI coding agents to implement, review, and remediate UI/UX code across each project.

For complete rationale and detailed architecture specifications, consult [SKILL.md], [REFERENCE.md], and the [knowledge/design/] ADR corpus.

## 1. Fast Component Routing Matrix

Use this matrix to locate the exact ADR and reference section when building or editing specific UI components:

- Component / Domain | Core Architectural Rule | Primary ADR | Detailed Guide
- **Buttons & CTAs** | Max 1 primary CTA per surface. Variant matches risk. Persistent utilities are icon-only. Primary toolbar CTA is icon+text | [knowledge/design/0029-button-hierarchy-states.md] / [knowledge/design/0043-button-text-against-icon-rules.md] | [REFERENCE.md#source-reference-map]
- **Modals & Dialogs** | `AlertDialog` for destructive/high-stakes. Standard `Dialog` for forms.`Sheet` for context. Cancel on left, Confirm right | [knowledge/design/0032-modal-dialog-standards.md] | [REFERENCE.md#dialog-type-for-an-action]
- **Forms & Inputs** | Labels strictly above inputs. Blur-triggered validation. Fieldset grouping with `space-8` | [knowledge/design/0025-forms-inputs.md] | [REFERENCE.md#forms-quick-rules]
- **Tables & Grids** | Text left-aligned, numeric right-aligned. Concept C sub-label stacking. Zero badges, pills, or gridlines | [knowledge/design/0034-table-design-standards.md] | [REFERENCE.md#source-reference-map]
- **Cards & Elevation** | Use 5-tier shadow scale (`shadow-xs`→`shadow-xl`). Cards are borderless at rest. Use `surface` prop | [knowledge/design/0041-surface-tier-system.md] | [REFERENCE.md#shadow--elevation-tiers]
- **Navigation & Header** | 3 zones only (search / empty / utility+avatar). Fixed `h-16`. Zero navigation links in header bar | [knowledge/design/0037-navigation-header-bar.md] | [REFERENCE.md#toolbar--header-principles]
- **Page Toolbars** | Max 52px single-row across all viewports. 7-stage priority collapse. Persistent `MoreVertical` anchor. 200–300ms tooltip delay | [knowledge/design/0039-toolbar-header-standards.md] | [REFERENCE.md#toolbar--header-principles]
- **Status / Badges** | **Total ban** on `badge.tsx`, colored status dots, and pills. Use Concept C sub-label stacking or Concept A margin wash | [knowledge/design/0035-badge-status-indicators.md] | [REFERENCE.md#source-reference-map]
- **Alert Colors at Rest** | Zero semantic colors (`destructive`, `success`, `warning`) on resting surfaces. Permitted only in toasts, open dialogs, validation, or active hover | [knowledge/design/0020-color-system.md] / [knowledge/design/0036-destructive-action-confirmation.md] | [REFERENCE.md#color-architecture]
- **Toasts & Alerts** | Success auto-dismisses in 4s. Error toasts persist. Max 3 concurrent. Undo toast for soft deletes. Toast ≠ bell notification | [knowledge/design/0033-toast-notification-rules.md] | [REFERENCE.md#source-reference-map]
- **Charts & Data Viz** | Labeled axes with units. Accessible OKLCH palette (≥30° hue delta). Mandatory screen-reader tabular alternative | [knowledge/design/0026-data-visualization.md] | [REFERENCE.md#data-visualization-rules]
- **Multi-Step Wizards** | 3-zone layout (sidebar tree / canvas / live preview). Auto-save drafts.`Next` button never disabled (click-to-validate) | [knowledge/design/0042-multi-step-wizards.md] | [REFERENCE.md#source-reference-map]
- **Mobile Footer / FAB** | Single app-wide bottom paradigm. 1–3 slot layout contract. Safe-area bottom scroll buffer `pb-[calc(4rem+env(safe-area-inset-bottom))]` | [knowledge/design/0045-mobile-sticky-footer-and-fab-patterns.md] | [REFERENCE.md#mobile-bottom-actions]
- **Scrollbars** | Hidden at rest. Visible only on active scrolling. 300ms idle persistence before 150ms fade-out. Zero-width overlay layout | [knowledge/design/0044-scrollbar-auto-hide-standards.md] | [REFERENCE.md#scrollbar-auto-hide]
- **Typography & Copy** | 6-tier modular scale capped at 24px (`text-2xl`) in app UI. Title Case in UI, camelCase in code. Verb-first labels. Em-dash (`—`) for unknowns | [knowledge/design/0015-style-guide.md] / [knowledge/design/0019-typography.md] / [knowledge/design/0030-content-formatting.md] / [knowledge/design/0031-ux-copy-microcopy.md] | [REFERENCE.md#typography-scale]

## 2. Universal Token Scales

### Spacing Scale ([knowledge/design/0018-spacing-scaling.md])

- `space-1` (4px) · `space-2` (8px) · `space-3` (12px) · `space-4` (16px) · `space-6` (24px) · `space-8` (32px) · `space-12` (48px)
- **Constraint:** Arbitrary pixel values (for example,. `p-[13px]`, `gap-[7px]`) are strictly forbidden.

### Typography Scale ([knowledge/design/0019-typography.md])

- `xs` (12px) · `sm` (14px) · `base` (16px) · `lg` (18px) · `xl` (20px) · `2xl` (24px)
- **Weights:** 400 (body), 500 (labels), 600 (headings), 700 (hero/CTA only)
- **Constraint:** Application UI font size is strictly capped at 24px (`text-2xl`). Sizes above 24px are reserved for marketing landing pages.

### Elevation & Shadows ([knowledge/design/0041-surface-tier-system.md])

- `shadow-xs` (resting cards)
- `shadow-sm` (raised / hover states)
- `shadow-md` (floating elements / dropdown menus / popovers)
- `shadow-lg` (dialog overlays / modal windows / sheets)
- `shadow-xl` (top-level overlays / toast notifications)

### Z-Index Layers ([knowledge/design/0017-layout-structure.md])

- Base: `0` · Dropdowns: `40` · Sticky: `50` · FABs: `60` · Drawers: `70` · Modals: `80` · Toasts: `100`

### Animation & Motion ([knowledge/design/0022-animations-microinteractions.md])

- **Duration Budget:** Micro (100ms), Standard (200ms), Emphasis (300ms), Complex (500ms). Max cap is 500ms.
- **Easing:** Entering (`ease-out`), Leaving (`ease-in`), Repositioning (`cubic-bezier(0.4, 0, 0.2, 1)`).
- **Prohibitions:** `linear` easing and `transition: all` are strictly banned.
- **Tooltip Delay Tiers:** Toolbar icon buttons (200–300ms), Dropdowns/Popovers (700–1000ms), Standalone icons/Avatars (1000ms).

### Breakpoints ([knowledge/design/0024-responsive-layout.md])

- `base` (0–639px, mobile single-column) · `sm` (640px) · `md` (768px, tables convert to cards) · `lg` (1024px, 2-column) · `xl` (1280px, full grid)

## 3. Top 8 Zero-Tolerance Compliance Invariants

1. **Zero Semantic Alert Colors at Rest:** Never style resting UI containers or text with `text-red-*`, `bg-destructive`, `text-emerald-*`, or `bg-warning`. Use neutral tokens (`text-muted-foreground`, `bg-muted/40`) with hover-gated semantic accents.
2. **Total Badge & Pill Ban:** Never import `Badge` or render pill/dot badges. Replace status indicators with Concept C sub-label stacking (`<span className="text-xs font-medium text-muted-foreground/70">`) or Concept A margin wash.
3. **Single Primary CTA:** Never render more than 1 primary action button on a single surface or toolbar.
4. **No Linear Easing / No `transition: all`:** Always specify target transition properties and use standard easing curves.
5. **No Resting Container Borders:** Cards and panels are elevated through the 5-tier shadow scale (`shadow-xs` to `shadow-xl`) and are borderless at rest.
6. **Application Font Cap (24px):** `text-3xl` through `text-9xl` are forbidden in functional application views.
7. **Em-Dash Fallbacks:** Missing, null, or undefined data values must display as `—` (em-dash), never `"N/A"`, `"-"`, `"None"`, or `"Unknown"`.
8. **Accessible Touch Targets:** Interactive icon buttons must maintain a minimum 44×44px hit target and include descriptive `aria-label`s.

## 4. Automation & Script Execution Playbook

When developing or auditing UI code, execute the appropriate scripts in [scripts/]:

```bash
# 1. Full Design System Compliance Audit
# Scans TSX/TS files and generates scratch/design-audit-report.md and scratch/design-audit-results.json
npx tsx scripts/audit-design-system-compliance.ts [optional-target-dir]

# 2. Automated Badge Deprecation Remediation
# Replaces deprecated <Badge> and status dot patterns with Concept C sub-label stacking
npx tsx scripts/remediate-badge-deprecation.ts [optional-target-dir]

# 3. Static Resting Color Remediation
# Converts static resting alert fills to neutral resting states with hover-gated accents
npx tsx scripts/remediate-static-colors.ts [optional-target-dir]

# 4. Fallback Strings & Accessible Button Remediation
# Standardizes fallback strings to em-dashes ('—') and injects missing button aria-labels
npx tsx scripts/remediate-deterministic-fallbacks-and-a11y.ts [optional-target-dir]

# 5. Residual Alert Fill Remediation
# Replaces lingering resting destructive/warning/success container fills based on audit JSON
npx tsx scripts/remediate-design-violations.ts

# 6. Verify Design ADR Integrity & Links
node scripts/verify-design-adrs.mjs
python3 scripts/ci/validate_frontmatter.py .
python3 scripts/ci/validate_links.py .
```
