---
title: 'ADR 0051: Internationalization (i18n), RTL & High-Contrast Support'
type: 'adr'
status: 'in-progress'
description: 'TODO Draft proposal: Standards for CSS logical properties, Right-to-Left (RTL) mirroring, text expansion allowances, and Windows High Contrast Mode.'
date: '2026-08-20'
---

# ADR 0051: Internationalization (i18n), RTL & High-Contrast Support

> [!NOTE]
> **TODO / RFC Draft:** This document is in draft status within `knowledge/in-progress/` and serves as a discussion proposal for future revision and adoption. The specifications below represent proposed guidelines for review, not yet active design system enforcement rules.

---

## Context

Global deployments and strict accessibility mandates require interfaces that seamlessly support localized text expansion, Right-to-Left (RTL) writing systems (e.g. Arabic, Hebrew), and assistive operating system modes like Windows High Contrast Mode (`forced-colors: active`).

Currently:

1. Physical directional CSS classes (e.g. `mr-4`, `pl-6`, `text-left`) break when switching to RTL.
2. Layout containers have fixed pixel widths that break when German or French translations expand by 30–40%.
3. Borderless surface designs (ADR 0041) lose visual separation when operating systems force custom contrast colors.

---

## Proposed Guidelines & Architectural Standards

### 1 — CSS Logical Properties Requirement

All layout and spacing code must adopt CSS logical properties instead of physical left/right coordinates:

| Legacy Physical Class       | Required Logical Utility    | Description                      |
| --------------------------- | --------------------------- | -------------------------------- |
| `ml-*` / `mr-*`             | `ms-*` / `me-*`             | Margin inline start / end        |
| `pl-*` / `pr-*`             | `ps-*` / `pe-*`             | Padding inline start / end       |
| `text-left` / `text-right`  | `text-start` / `text-end`   | Text alignment                   |
| `left-*` / `right-*`        | `start-*` / `end-*`         | Absolute positioning coordinates |
| `border-l-*` / `border-r-*` | `border-s-*` / `border-e-*` | Border inline start / end        |

---

### 2 — Icon & Asset RTL Mirroring Rules

- **Mirrorable Icons:** Directional navigation arrows (`ArrowLeft`, `ChevronRight`), undo/redo icons, and reading direction indicators must mirror automatically in RTL (`rtl:rotate-180` or `rtl:scale-x-[-1]`).
- **Non-Mirrorable Icons:** Media playback controls (`Play`, `Pause`), clocks, checkmarks, search magnifying glasses, and hardware icons (e.g. phone, battery) must **never** mirror.

---

### 3 — Text Expansion Budget (i18n Headroom)

- **Button & Label Widths:** Fixed-width buttons (e.g. `w-32`) are strictly prohibited for labeled buttons. Use `min-w-[80px]` with `px-4` padding to accommodate German/French string expansions of up to 40%.
- **Table Column Min-Widths:** Set explicit `min-w-[120px]` on text columns to prevent awkward two-character word-wrapping when localized.

---

### 4 — Windows High Contrast & Forced Colors Mode

When `@media (forced-colors: active)` is triggered:

- Operating systems strip custom OKLCH background colors and box shadows.
- Cards, dialogs, and popovers must enforce a system border fallback:
  ```css
  @media (forced-colors: active) {
    .surface-card,
    .surface-panel {
      border: 1px solid ButtonBorder !important;
    }
    :focus-visible {
      outline: 2px solid Highlight !important;
    }
  }
  ```

---

## Anti-Patterns & Prohibitions

1. **No Hardcoded Left/Right Insets:** Do not write `left-0` or `pl-4` in shared primitives; always use `start-0` and `ps-4`.
2. **No Text Truncation Without Tooltips:** Truncated localized strings must always provide hover tooltips revealing the full string.
3. **No Concatenated Translated Strings:** Never assemble UI sentences using string concatenation (e.g. `"Showing " + count + " items"`); use parameterized translation keys (e.g. `t('pagination.showing', { count })`).

---

## Open Questions for Discussion

- Should RTL support be enforced via a top-level `<html dir="rtl">` attribute or scoped per layout container?
- Should automated linters flag physical CSS property usage (`pl-`, `mr-`, `text-left`) during CI?
