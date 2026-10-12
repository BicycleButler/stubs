---
name: design
title: design-guidelines
type: skill
status: active
description: >
  Layout structure, spacing tokens, typography, color systems, icons/imagery,
  motion, accessibility, dark mode, forms, and component standards for any UI project.
last_updated: 2026-08-15
---

# Design Guidelines Skill

Read `REFERENCE.md` for full token tables, decision trees, and lookup references.

## Quick Checklist (run before every UI commit)

- [ ] Run automated design audit; 0 ERRORs and 0 WARNINGs
- [ ] Code properties use `camelCase`; UI labels use Title Case
- [ ] Layout follows defined structure, sidebar spec, and z-index scale
- [ ] Spacing uses only defined spacing tokens; no ad-hoc values
- [ ] Typography within defined scale and weight hierarchy; app UI capped at largest step
- [ ] Colors use only semantic tokens in components; zero semantic alert colors at rest
- [ ] Icons from one approved library only, sized to defined scale; avatar containers remain immutable
- [ ] No linear easing; motion duration within defined budget; tooltip delay tiers obeyed
- [ ] Every async operation defines 4 states: Empty / Loading / Error / Degraded
- [ ] Route and section transitions use defined patterns and durations
- [ ] Accessibility: focus rings, keyboard nav, semantic landmarks, minimum touch targets
- [ ] Mobile-first, breakpoint grid, component adaptation rules, safe-area insets
- [ ] Forms: labels above inputs, validation timing, required indicators, grouping semantics
- [ ] Charts: labeled axes+units, accessible palette, tabular alternative, responsive reflow
- [ ] Themes supply complete token contract; dark mode lightness delta meets minimum
- [ ] Max 1 primary button per surface; variant matches action type; loading state defined
- [ ] Button text pairing complies with transient vs persistent surface presence rules; primary CTA in toolbars uses icon + text
- [ ] Dates use relative/absolute rule; currency formatted; unknowns use em-dash
- [ ] Copy: verb-first labels, error = what + do, empty state = action invitation
- [ ] Dialog: correct type for risk level; size tier; cancel left
- [ ] Error toasts persist; success auto-dismiss; max concurrent limit; toast ≠ bell notification
- [ ] Table: text left-aligned, numeric right-aligned, sub-label stacking, no badge/dot/pill
- [ ] Badge/status dots/pills are completely banned; use sub-label stacking or margin wash instead
- [ ] Zero semantic color at rest: no semantic alert colors on resting surfaces — only in toasts, open dialogs, validation, or hover inside open menus
- [ ] Destructive entry points gated behind menu or dialog; no persistent destructive buttons
- [ ] Header: limited zones, fixed height, no nav links inside header
- [ ] Toolbar: max height across viewports, single-row layout, dynamic priority collapse, persistent overflow anchor, icon-only borderless utilities, tooltip delay, max 1 primary CTA
- [ ] Surface options via `surface` prop on layout/card primitives; shadow scale for depth
- [ ] Multi-step wizard: consistent 3-zone layout, background draft auto-save, next button never disabled, accordion review step
- [ ] Mobile bottom actions follow app-wide paradigm with safe-area buffer
- [ ] Scrollbar auto-hide: hidden at rest; visible on active scroll; fade after idle timer; zero-width overlay layout

## Workflows

### 1 — Building a new component

1. Identify context: page, density tier, breakpoint targets.
2. Check spacing + layout rules → pick tokens from REFERENCE.md tables.
3. Apply color: semantic tokens only. Zero semantic alert color at rest.
4. Set surface tier via `surface` prop on layout/card primitives.
5. Wire all 4 async states if component fetches data.
6. Run accessibility checklist: focus, ARIA, keyboard, touch target.
7. Test dark mode: verify minimum lightness delta on adjacent surfaces.
8. Run automated design audit.

### 2 — Reviewing a PR for style compliance

1. Execute design audit on target scope.
2. Scan for raw literal spacing/color values → flag, replace with tokens.
3. Check layering values against global scale.
4. Confirm all icons are from one approved library at correct size.
5. Verify form validation timing.
6. Check reduced-motion guard on any animation.
7. Verify no semantic color on resting surfaces.

### 3 — Adding a new theme

1. Supply all required token categories.
2. Run contrast check on every semantic pair.
3. Verify minimum lightness delta between adjacent background layers.
4. Visual test on representative pages: overview, detail, form.

## Query Mode (fast lookup)

| Question                                           | Answer                                                                                                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shadow for a resting card?                         | smallest elevation shadow                                                                                                                            |
| Shadow for a dropdown?                             | medium elevation shadow                                                                                                                              |
| Shadow for a modal?                                | large elevation shadow                                                                                                                               |
| Shadow for a toast?                                | largest elevation shadow                                                                                                                             |
| When can I show success/warning/destructive color? | Toast, open dialog, validation, hover inside open menu — never at rest                                                                               |
| Can I use badge/pill/dot status?                   | No — fully deprecated. Use sub-label stacking or margin wash                                                                                         |
| How do I show entity status or tier?               | Sub-label stacking or margin wash                                                                                                                    |
| Tooltip delay for a toolbar icon button?           | 200–300ms                                                                                                                                            |
| Tooltip delay for a standalone icon / avatar?      | 1000ms                                                                                                                                               |
| Tooltip delay for a dropdown or popover?           | 700–1000ms                                                                                                                                           |
| Is this a toast or a bell notification?            | Current user triggered it → toast. Another actor triggered it → bell.                                                                                |
| Hard delete confirmation?                          | Alert-style dialog; destructive confirm action; cancel default                                                                                       |
| Soft delete pattern?                               | Undo toast — no dialog                                                                                                                               |
| Easing curve for entering elements?                | ease-out                                                                                                                                             |
| Route transition class?                            | defined in animation section                                                                                                                         |
| Section mount class?                               | defined in animation section                                                                                                                         |
| Max stagger count?                                 | 8 — items 9+ appear simultaneously                                                                                                                   |
| Dialog type for destructive/high-stakes?           | Alert-style dialog                                                                                                                                   |
| Button variant for overflow trigger?               | ghost                                                                                                                                                |
| Missing value display?                             | em-dash, never N/A/null/-/blank                                                                                                                      |
| When should buttons be icon-only or have text?     | Persistent surface utilities are icon-only, except max 1 primary CTA which must be icon+text. Transient surface buttons must have text or icon+text. |
| How to structure split-pane detail cards?          | Dynamic CSS Grid Inspector Pane layout with entity priority rankings (ADR 0040)                                                                      |
| Which mobile bottom action pattern to use?         | Evaluate app-wide needs: Sticky Footer (1–3 slots) or FAB paradigm, never mix (ADR 0045 mobile)                                                      |

## Key Rules (inline reference)

| Domain                 | Rule                                                                                                                         | ADR      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| Casing                 | Code properties = camelCase; UI display = Title Case                                                                         | ADR 0015 |
| Layout                 | Defined structure; sidebar widths; z-index base→toast                                                                        | ADR 0017 |
| Spacing                | Defined grid, tokens only, no ad-hoc values, content width caps                                                              | ADR 0018 |
| Typography             | Defined scale and weights; app UI capped at largest step                                                                     | ADR 0019 |
| Color                  | Semantic tokens only in components                                                                                           | ADR 0020 |
| Icons                  | One library only; defined sizes; avatar immutable container                                                                  | ADR 0021 |
| Animation              | No linear easing; duration budget; tooltip delay tiers; reduced-motion                                                       | ADR 0022 |
| Transitions            | Routes: fade; sections: slide; stagger limit                                                                                 | ADR 0022 |
| Accessibility          | WCAG 2.1 AA; focus rings; landmarks; touch targets                                                                           | ADR 0023 |
| Responsive             | Mobile-first; breakpoints; component adaptation                                                                              | ADR 0024 |
| Forms                  | Labels above inputs; validation timing; grouping semantics                                                                   | ADR 0025 |
| Data Viz               | Labeled axes+units+legend; accessible palette; tabular alt; responsive                                                       | ADR 0026 |
| Theming                | Complete token contract; minimum dark mode delta; override persistence                                                       | ADR 0028 |
| Buttons                | 1 primary per surface; destructive only in active confirm/hover; loading state                                               | ADR 0029 |
| Content Format         | Relative time threshold; currency format; unknowns = em-dash                                                                 | ADR 0030 |
| Copy                   | Verb-first labels; error = what+what-to-do; empty state = action invitation                                                  | ADR 0031 |
| Modals                 | Correct type for risk level; size tiers; cancel left, confirm right                                                          | ADR 0032 |
| Toasts                 | Success auto-dismiss; error persistent; max concurrent; undo toast for soft deletes                                          | ADR 0033 |
| Tables                 | Text left / numeric right; row height; sub-labels; no badges/dots/pills                                                      | ADR 0034 |
| Badge Ban              | Badges, dots, pills = total ban system-wide; sub-label stacking or margin wash                                               | ADR 0035 |
| Semantic Color at Rest | Zero semantic alert color on resting surfaces; only in toasts/dialogs/validation/hover-open-menu                             | ADR 0036 |
| Destructive Actions    | Menu gating; ghost trigger; dialog for hard delete confirmation                                                              | ADR 0036 |
| Header                 | Limited zones; fixed height; no nav links                                                                                    | ADR 0037 |
| Toolbar                | Max height; single-row layout; dynamic priority collapse; persistent overflow anchor; tooltip tier; primary CTA is icon+text | ADR 0039 |
| Split Pane             | DynamicInspector CSS Grid, priority rankings                                                                                 | ADR 0040 |
| Elevation              | Defined shadow scale; surface prop on layout/card primitives                                                                 | ADR 0041 |
| Multi-Step Wizard      | 3-zone layout; background draft auto-save; next never disabled; accordion review                                             | ADR 0042 |
| Button Text vs Icon    | Transient surface buttons require text/icon+text. Persistent surface utilities are icon-only, primary CTA is icon+text.      | ADR 0043 |
| Mobile Bottom Actions  | Single paradigm per app; 1–3 slot contract; safe-area scroll buffer                                                          | ADR 0045 |
| Scrollbar Auto-Hide    | Hidden at rest; visible on active scroll; fade after idle; zero-width overlay                                                | ADR 0044 |
