---
title: '0041 - Surface Tier System'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-07T23:19:00Z'
---

# 0041 - Surface Tier System

## Context

Components such as `Card`, inspector pane shells, sidebar panels, and section wrappers previously managed elevation through ad-hoc `className` overrides — manually combining `border`, `shadow-*`, and `bg-*` tokens with no shared vocabulary. This produced inconsistent elevation hierarchies, violated ADR 0027's 5-tier shadow scale (which was not minted as CSS custom properties at all), and made it impossible to enforce ADR 0028's dark mode lightness gap rule systematically.

A secondary issue: `Card` was semantically conflated with structural layout regions. ADR 0017 (Rule 5) states that "visible borders are reserved for interactive affordances (cards, inputs, tables)" — grouping by proximity and spacing is preferred. There was no primitive for the structural case, leading components like `split-pane-layout.tsx` to use raw divs with inline class overrides.

## Decision

### 1 — Shadow Scale Tokens (ADR 0027 Implementation)

The 5-tier shadow scale from ADR 0027 is now minted as CSS custom properties in `globals.css` `@theme inline`, intentionally overriding Tailwind defaults:

| Token         | Value                                                | ADR 0027 Tier       |
| ------------- | ---------------------------------------------------- | ------------------- |
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.04)`                      | Resting             |
| `--shadow-sm` | `0 2px 4px + 0 1px 2px -1px` (rgb 0.06/0.04)         | Raised / hover      |
| `--shadow-md` | `0 4px 8px -2px + 0 2px 4px -2px` (rgb 0.10/0.06)    | Floating / dropdown |
| `--shadow-lg` | `0 12px 24px -4px + 0 4px 8px -2px` (rgb 0.12/0.08)  | Overlay / modal     |
| `--shadow-xl` | `0 20px 40px -8px + 0 8px 16px -4px` (rgb 0.18/0.10) | Top-level / toast   |

**Layering Consistency:** Higher-elevation elements always cast larger shadows. A shadowless element must never appear above a shadowed element in the same stacking context.

**Modal Backdrop:** Modal overlays use `backdrop-filter: blur(4px)` with a semi-transparent scrim. Light mode: `rgba(0,0,0,0.5)`. Dark mode: `rgba(0,0,0,0.7)`.

Surface tier tokens (`--surface-raised-*`, `--surface-flat-*`, etc.) are also minted as documentation anchors — components consume them indirectly via their CVA class definitions.

### 2 — Surface Options & Tiers

All `Card` and `ContainerPanel` components expose a `surface` prop supporting both **bordered** and **borderless** design system options. Each tier owns its complete elevation signature: border, shadow, and background.

| `surface`            | Border                            | Shadow      | Background       | Dark Mode Compensator                      | Purpose                                     |
| -------------------- | --------------------------------- | ----------- | ---------------- | ------------------------------------------ | ------------------------------------------- |
| `raised` _(default)_ | none (`border-0`)                 | `shadow-sm` | `bg-card`        | `ring-1 ring-border/20`                    | Borderless primary card elevated via shadow |
| `flat`               | none (`border-0`)                 | `shadow-xs` | `bg-card`        | `ring-1 ring-border/20`                    | Borderless nested info group                |
| `bordered`           | explicit (`border border-border`) | `shadow-xs` | `bg-card`        | Standard border                            | Bordered option for explicit framing        |
| `flush`              | none (`border-0`)                 | none        | `bg-transparent` | **Parent must provide elevation context.** | Structural region; no visual decoration     |
| `inset`              | none (`border-0`)                 | `shadow-md` | `bg-muted/40`    | Heavier shadow depth                       | Recessed read-only / metadata block         |

> **Design System Policy — Bordered vs Borderless:**
> Both `bordered` and `borderless` options are first-class primitives in the design system. Applications using this design system may standardize on `borderless` or `bordered` surfaces. For data-dense applications, content cards and data tables standardly use **borderless** (`raised` / `flat`) for a clean visual hierarchy, while Main Layout structural dividers (sidebar, header, sticky footer), Form Controls (`input`, `select`), and Overlay Surfaces (`dialog`, `popover`, `dropdown`, `toast`) retain structural borders.

### 3 — Usage Rules

#### Rule 1 — Card vs. ContainerPanel

- **`Card`**: Use for discrete, interactive data units — a container that a user can scan, click, or act on. Semantically equivalent to a "record" or "widget".
- **`ContainerPanel`**: Use for structural layout regions — inspector panes, sidebar wrappers, page section groupings — where `Card` semantics are wrong. `ContainerPanel` has no default padding and no `gap`/`py` defaults; callers own their internal spacing.

> **Decision rule:** If removing the container's border and shadow would leave the content perfectly readable because it sits inside an already-elevated parent, use `ContainerPanel surface="flush"` or `Card surface="flush"`. If the container itself _is_ the elevation boundary, use `raised`.

#### Rule 2 — Default Is `raised`

The `surface` prop defaults to `"raised"` on both `Card` and `ContainerPanel`. Existing `<Card>` usages without a `surface` prop are unaffected — output is identical to the previous implementation.

#### Rule 3 — `flush` Requires Parent Context

`flush` surfaces have **no border, no shadow, and transparent background**. They are only valid when rendered inside a `raised` or `flat` container that provides the visual boundary. Using `flush` at the top/canvas level on dark themes produces visual bleed — the content will merge into the background.

**Correct:**

```tsx
<ContainerPanel surface="raised" className="p-6">
  <Card surface="flush">…</Card> {/* ✓ inside a raised shell */}
</ContainerPanel>
```

**Incorrect:**

```tsx
{
  /* ✗ flush at canvas level — bleeds on dark themes */
}
<Card surface="flush">…</Card>;
```

#### Rule 4 — `inset` for Read-Only / Recessed Zones

`inset` conveys a recessed surface — content that the user reads but does not interact with as a primary action target. Use it for:

- Data conflict review panels (`DataReviewCard`)
- Read-only preview blocks
- Embedded code / metadata blocks within a raised card

Do **not** use `inset` for full-page content areas — it implies subordinate depth.

#### Rule 5 — `flat` for Nested Info Groups

`flat` is the middle ground: no border (grouping by proximity, per ADR 0017), but a resting `shadow-xs` keeps it slightly above its parent. Use `flat` for:

- A sub-section card inside a dashboard column
- A data module card inside the DynamicInspector grid (ADR 0040)
- An empty-state card inside a `raised` panel (with a dashed border override via `className` to signal vacancy)

#### Rule 6 — className Overrides for Semantic Color Only

`className` on `Card` or `ContainerPanel` is reserved for:

- Layout modifiers (`flex flex-col`, `overflow-hidden`, `h-full`)
- Semantic state borders (`border-primary`, `border-destructive/30`, `border-dashed`) that signal interaction state — **not** elevation
- Hover transitions (`hover:shadow-md transition-shadow`) for interactive cards

**Forbidden className patterns** (use `surface` prop instead):

```
❌  className="border shadow-sm"
❌  className="border-0 shadow-none bg-transparent"
❌  className="bg-card border border-border/70"
❌  className="shadow-xs border border-border/60"
```

#### Rule 7 — Dark Mode Compliance (ADR 0028)

- `raised` and `flat` replace `box-shadow` with `ring-1` in dark mode. This satisfies ADR 0028's requirement that dark surfaces supplement shadows with lightened stroke borders.
- `flush` emits `data-surface="flush"` on its DOM node. If a `flush` surface ever appears in a dark context without a parent container, this attribute can be targeted in CSS for emergency border injection without a prop change.
- `inset` uses a heavier inset shadow in dark mode to compensate for low shadow visibility.

### 3 — Component API Reference

#### Card

```tsx
import { Card } from '@/components/ui/card'

// surface: "raised" | "flat" | "bordered" | "flush" | "inset"
// Defaults to "raised" — backward compatible

<Card>…</Card>                          // raised (default borderless, shadow-sm)
<Card surface="raised">…</Card>         // explicit raised (borderless)
<Card surface="flat">…</Card>           // borderless, shadow-xs
<Card surface="bordered">…</Card>       // explicit bordered surface
<Card surface="flush">…</Card>          // structural, no decoration
<Card surface="inset">…</Card>          // recessed read-only zone
```

#### ContainerPanel

```tsx
import { ContainerPanel } from '@/components/ui/container-panel'

// surface: "raised" | "flat" | "bordered" | "flush" | "inset"
// scrollable?: boolean — adds overflow-y-auto
// No default padding — callers add className="p-{n}"

<ContainerPanel surface="raised" className="h-full p-6">
  {inspectorPane}
</ContainerPanel>

<ContainerPanel surface="bordered" className="p-4">
  {borderedSection}
</ContainerPanel>

<ContainerPanel surface="flush" scrollable>
  {sectionContent}
</ContainerPanel>
```

### 4 — Affected Files

| File                                      | Change                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `src/app/globals.css`                     | `--shadow-xs` → `--shadow-xl` tokens minted; surface tier anchor tokens added     |
| `src/components/ui/card.tsx`              | CVA refactor; `surface` prop added; `raised` is default                           |
| `src/components/ui/container-panel.tsx`   | New primitive                                                                     |
| `src/components/ui/split-pane-layout.tsx` | Inspector pane migrated from raw div to `ContainerPanel surface="raised"`         |
| Multiple Card consumers                   | Redundant elevation `className` overrides removed or replaced with `surface` prop |

## Consequences

- Elevation intent is expressed at the prop level, not buried in `className` strings — greppable, type-safe, and agent-auditable.
- ADR 0027's 5-tier shadow scale is now physically implemented in CSS tokens, not just documented in prose.
- ADR 0028 dark mode compliance is structural — rings and inset shadow adjustments are baked into CVA, not patched per-component.
- `Card` and `ContainerPanel` have distinct semantic roles, resolving the long-standing conflation of "data unit" with "layout region."
- All existing `<Card>` usages default to `raised` — **zero breaking changes.**

## Cross-References

- [ADR 0017 - Layout & Structure Standards](0017-layout-structure.md) — Rule 5: whitespace over borders; borders for interactive affordances
- [ADR 0028 - Theming & Dark Mode](0028-theming-dark-mode.md) — ring supplement rule for dark surfaces
- [ADR 0040 - Split Pane Detail Cards](0040-split-pane-detail-cards.md) — DynamicInspector uses `ContainerPanel` + `Card surface="flat"` for sub-modules

> **Note:** ADR 0027 (Elevation & Depth Standards) has been absorbed into this document. All elevation rules, shadow scale tokens, and backdrop specifications are now authoritative here.
