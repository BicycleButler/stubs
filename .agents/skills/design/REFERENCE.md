---
title: Design Guidelines Reference
type: reference
status: active
description: Reference
---

# Design Guidelines Reference

## Spacing Tokens

- Token | Value | Use
- `space-1` | 4px | Inline gaps, icon padding
- `space-2` | 8px | Tight component padding
- `space-3` | 12px | Default component padding
- `space-4` | 16px | Card inner padding
- `space-6` | 24px | Section gaps
- `space-8` | 32px | Field group separation
- `space-12` | 48px | Page section breaks

**Content width constraints:**

- Text: 65–75 chars/line
- Forms: max 640px
- Standard dashboards: max 1280px
- Data-dense layouts: max 1600px

**Border radius tokens:** `radius-sm`, `radius-md`, `radius-lg`, `radius-xl`, `radius-full`

## Typography Scale

- Step | Size | Weight use
- `xs` | 12px | Metadata, captions
- `sm` | 14px | Secondary labels
- `base` | 16px | Body copy (line-height 140–160%)
- `lg` | 18px | Emphasized body
- `xl` | 20px | Section headings
- `2xl` | 24px | Page headings

**Weights:** 400 body · 500 labels · 600 headings · 700 hero/CTA only
**App UI cap:** 24px. Larger sizes are for marketing only.

## Color Architecture

- 3 seed colors: primary, accent, neutral
- Lightness stepping: light shade, mid shade, dark shade
- Primitives: `--primary-100`, `--primary-200`, `--primary-300`, and so on.
- Semantic: `--primary`, `--background`, `--border`, `--foreground`, and so on.
- Components consume only semantic tokens.

**Neutral foundation:**

- 3 background layers
- 2 structural strokes
- 3 text contrast tiers

**Status palette:** success, warning, destructive, info — each with matching foreground.

**Dark mode validation:**

- Minimum lightness delta between adjacent background layers
- Borders shift to lightened strokes
- Manual override persisted. Default = system preference

## Icon Sizes & Optical Weights

- Tier | Size | Stroke | Context
- Inline | 16px | 2 | Inline with text
- Action | 20px | 2 | Buttons, form inputs
- Navigation | 24px | 1.75 | Sidebar, toolbar, top nav
- Feature | 32px | 1.5 | Feature tiles, card headers
- Hero | 48px | 1.5 | Empty states, onboarding

**Touch target rule:** interactive icons on touch viewports need a minimum 44×44px bounding box.
**Avatar sizes:** 24 / 32 / 40 / 48px — circular.

## Z-Index Scale

- Layer | Value
- Base | 0
- Dropdowns | 40
- Sticky | 50
- FABs | 60
- Drawers | 70
- Modals | 80
- Toasts | 100

## Shadow / Elevation Tiers

- Token | Box Shadow Spec | Use
- `shadow-xs` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Resting cards
- `shadow-sm` | `0 1px 3px 0 + 0 1px 2px -1px` | Raised / hover
- `shadow-md` | `0 4px 6px -1px + 0 2px 4px -2px` | Floating / dropdowns
- `shadow-lg` | `0 10px 15px -3px + 0 4px 6px -4px` | Overlay / modal
- `shadow-xl` | `0 20px 25px -5px + 0 8px 10px -6px` | Top-level / toast

Higher-elevation elements always cast larger shadows. Shadowless elements must not appear above shadowed elements.

## Breakpoints

- Token | Min width | Adaptation
- base | 0 | Mobile — single column
- `sm` | 640px | Minor layout unlocks
- `md` | 768px | Tables→cards. Multi-col forms→single
- `lg` | 1024px | Side panels expand. 2-col layouts
- `xl` | 1280px | Full dashboard grids

## Animation Durations

- Tier | Duration | Use
- Micro | 100ms | State toggles, checkboxes
- Standard | 200ms | Hover effects, dropdowns
- Emphasis | 300ms | Panels, modals entering
- Complex | 500ms | Page transitions, data reveals

**Easing defaults:**

- Entering: `ease-out`
- Leaving: `ease-in`
- Repositioning: `ease-in-out`
- Default curve: `cubic-bezier(0.4, 0, 0.2, 1)`
- `linear` is banned.

**Async state requirements (every data-fetching component):**

1. Empty — illustrated CTA
2. Loading — skeleton shimmer
3. Error — contextual message + retry
4. Partial/Degraded — show succeeded, inline error for failed

## Theming — Required Token Categories

Every theme must define:

- 3 background tiers
- 3 text tiers
- primary / secondary / accent + foregrounds
- 4 semantic status colors + foregrounds
- border / input / ring
- chart colors

**Dark mode validation:**

- Minimum lightness delta between adjacent backgrounds
- Borders shift to lightened strokes
- Images dimmed or desaturated
- Manual override persisted. Default = system preference

## Forms Quick Rules

- Rule | Detail
- Input height | 36–40px. Textarea min 80px
- Labels | Always above — never placeholder-only
- Validation trigger | Text inputs: on blur · Selects/toggles: on change
- Error state | Red border +  icon + message below
- Warning state | Amber +  icon + message below
- Success state | Green +  icon + message below
- Required indicator | `*` in destructive color beside label
- Optional grouping | Label group "Optional." explicitly
- Field grouping | `<fieldset>` / `<legend>`. Separated by `space-8` (32px)
- Multi-step | stepper showing current/total/completed

## Data Visualization Rules

- Chart palette: 5–8 colors, ≥30° OKLCH hue separation, WCAG AA contrast
- Mandatory: title, labeled axes with units, legend (multi-series), readable gridlines
- Tooltips: hover desktop / tap mobile. Show value + series + unit. Follow cursor
- Below `md`: simplify to key metrics or tabular summary. Legend below chart. Min height 200px
- Every chart must have a tabular data alternative for screen readers

## Accessibility Checklist

- [ ] WCAG 2.1 Level AA minimum
- [ ] `:focus-visible` 2px ring — never suppressed
- [ ] Focus trapped inside modals. Returned to trigger on close
- [ ] Skip-navigation link on every page
- [ ] One `<h1>` per page. No skipped heading levels
- [ ] `<nav>`, `<main>`, `<aside>` over `<div>` where semantic
- [ ] Status indicators use icon/text in addition to color
- [ ] 44×44px minimum touch targets
- [ ] `aria-hidden` on decorative images
- [ ] `aria-label` on icon-only buttons
- [ ] `aria-live` regions for dynamic updates
- [ ] `prefers-reduced-motion`: instant state changes, opacity-only transitions

## Sidebar Specification

- State | Width | Behavior
- Collapsed | 64px | Icon-only
- Expanded | 240–280px | Label + icon
- Mobile | full-screen | Drawer overlay

- 5–9 top-level items max
- Low-frequency actions (profile, settings, billing) → header profile menu

## Toolbar / Header Principles

- Toolbar: max height across viewports. Single-row layout preferred. Persistent overflow anchor. Tooltip delay tier. Max 1 primary action
- Header: limited zones. Fixed height. No nav links inside header
- Persistent-surface utilities are icon-only. Transient-surface buttons require text or icon+text

## Surface & Elevation

- Use a defined shadow scale for depth
- Layout/card primitives expose a `surface` prop or equivalent when available
- Layering rule: higher-elevation elements cast larger shadows than lower ones

## Mobile Bottom Actions

### Application Paradigm Evaluation Decision Tree

- Sticky Footer Paradigm: When the application requires 2 to 3 contextual actions per view (Search or Filter, Primary Action, Voice or AI Assistant).
  - Provides 1 to 3 slot layout flexibility per page.
  - Replaces mobile floating FABs.
  - Includes safe-area inset and scroll buffer.
- FAB Paradigm: When the application requires strictly 1 floating action across all views.
  - Single persistent floating button.
  - Safe-area inset offset.

### Sticky Footer Slot Contract (1–3 Slots)

- **1-Slot**: Full-width primary CTA
- **2-Slot**: Left: Context/Secondary action · Right: Primary CTA
- **3-Slot**: Left: Search/Filter · Center: Primary CTA · Right: Assistant/Voice trigger

### Mandatory Bottom Scroll Buffer Rule

- Page container: `pb-[calc(var(--sticky-footer-height,4rem)+env(safe-area-inset-bottom,0px))] md:pb-0`

## Scrollbar Auto-Hide

- Hidden at rest
- Visible on active scroll
- Fade after idle timer
- Zero-width overlay when hidden

## Decision Trees

### Dialog type for an action

- Destructive, high-stakes, or permanent action: Use alert-style dialog. Require explicit confirmation.
- Contextual side panel: Use sheet or side panel when supported.
- Standard form or informational view: Use standard dialog.

### Button text against icon

- Persistent surface:
  - Utilities are icon-only with tooltip or aria-label.
  - Maximum 1 primary CTA, and it is icon with text.
- Transient surface:
  - Buttons are text or icon with text.

### Missing value display

Use an em-dash. Never use N/A, null, -, or blank.

## Source Reference Map

- Topic | Reference
- Spacing | ADR 0018
- Typography | ADR 0019
- Color | ADR 0020
- Icons | ADR 0021
- Animation | ADR 0022
- Accessibility | ADR 0023
- Responsive | ADR 0024
- Forms | ADR 0025
- Data Viz | ADR 0026
- Theming | ADR 0028
- Buttons | ADR 0029
- Content Format | ADR 0030
- Copy | ADR 0031
- Modals | ADR 0032
- Toasts | ADR 0033
- Tables | ADR 0034
- Badge Ban | ADR 0035
- Semantic Color at Rest | ADR 0036
- Header | ADR 0037
- Toolbar | ADR 0039
- Split Pane | ADR 0040
- Surface Tier | ADR 0041
- Mobile Bottom Actions | ADR 0045
- Wizards | ADR 0042
- Button Text against Icon | ADR 0043
- Scrollbar Auto-Hide | ADR 0044
