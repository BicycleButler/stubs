---
title: 'ADR 0048: Combobox, Async Autocomplete & Date Range Pickers'
type: 'adr'
status: 'in-progress'
description: 'TODO Draft proposal: Interaction standards for async comboboxes, debounce timings, inline item creation, and dual-month date range pickers.'
date: '2026-08-20'
---

# ADR 0048: Combobox, Async Autocomplete & Date Range Pickers

> [!NOTE]
> **TODO / RFC Draft:** This document is in draft status within `knowledge/in-progress/` and serves as a discussion proposal for future revision and adoption. The specifications below represent proposed guidelines for review, not yet active design system enforcement rules.

---

## Context

Forms and search interfaces depend on advanced selection primitives to handle large datasets (e.g. searching 50,000 customers or selecting date ranges across fiscal years).

Currently:

1. Autocomplete components lack standard debouncing and loading feedback, resulting in erratic race conditions.
2. "Create new option" patterns vary across views.
3. Date pickers lack standardized range selection layouts, keyboard shortcuts, and relative range presets ("Last 30 days", "Q3 2026").

---

## Proposed Guidelines & Architectural Standards

### 1 — Async Combobox & Autocomplete Anatomy

```
┌────────────────────────────────────────────────────────┐
│ 🔍  Acme Corp                                      [⟳] │
├────────────────────────────────────────────────────────┤
│  Acme Global Logistics — Denver, CO                    │
│  Acme Medical Supplies — Chicago, IL                   │
│ ────────────────────────────────────────────────────── │
│  + Create "Acme Corp" as new Organization              │
└────────────────────────────────────────────────────────┘
```

- **Debounce Budget:** Keydown debounce strictly set to **250ms–300ms** before triggering remote queries.
- **Loading State:** An animated spinner icon (`Loader2 className="animate-spin text-muted-foreground w-4 h-4"`) in the input's trailing slot while fetching.
- **Empty State:** If query yields zero results: `"No matching organizations found"`.
- **Inline Create Action:** The last item in the dropdown popover offers inline item creation: `+ Create "[query]"`.
- **Popover Elevation:** `shadow-md` with `z-40` layer.

---

### 2 — Keyboard Interaction for Comboboxes (WAI-ARIA)

- Input: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded="true|false"`, `aria-controls="combobox-listbox"`.
- Dropdown: `role="listbox"`, items with `role="option"`.
- `ArrowDown` / `ArrowUp`: Highlights option without selecting it.
- `Enter`: Commits highlighted option.
- `Escape`: Closes popover and restores prior input value.

---

### 3 — Date & Date Range Picker Specification

```
┌─────────────────┬───────────────────────────┬───────────────────────────┐
│ Presets         │       August 2026         │      September 2026       │
├─────────────────┼───────────────────────────┼───────────────────────────┤
│ Today           │ Su Mo Tu We Th Fr Sa      │ Su Mo Tu We Th Fr Sa      │
│ Yesterday       │     1  2  3  4  5  6  7   │           1  2  3  4  5   │
│ Last 7 Days     │  8  9 10 11 12 13 14      │  6  7  8  9 10 11 12      │
│ [Last 30 Days]  │ 15 16 17 18 19 20 21      │ 13 14 15 16 17 18 19      │
│ This Quarter    │ 22 23 24 25 26 27 28      │ 20 21 22 23 24 25 26      │
│ Year to Date    │ 29 30 31                  │ 27 28 29 30               │
└─────────────────┴───────────────────────────┴───────────────────────────┘
```

- **Layout Structure:**
  - Left column: Quick preset shortcuts.
  - Center & Right: Dual side-by-side month calendars.
- **Range Visual Highlighting:**
  - Start Date & End Date: `bg-primary text-primary-foreground font-semibold rounded-full`.
  - In-Between Range: `bg-primary/10 text-foreground rounded-none`.
- **Display Input Format:** Must strictly follow ADR 0030: `"Aug 1, 2026 — Aug 31, 2026"`.
- **Timezone Transparency:** When time selection is enabled, display timezone badge (e.g. `PDT (UTC-7)`) next to the time input.

---

## Anti-Patterns & Prohibitions

1. **No Raw HTML `<select>` for > 15 Options:** Standard `<select>` elements become unusable for large datasets; use `<Combobox>` with virtualized scrolling instead.
2. **No Layout Shifts During Async Search:** Keep dropdown menu height stable while search results are pending.
3. **No Ambiguous Date Formats:** Never display numeric-only dates like `08/09/2026` (which causes month/day confusion in international contexts); use formatted short month names (`Aug 9, 2026`).

---

## Open Questions for Discussion

- Should single date pickers use inline calendar popovers or a native mobile wheel picker on touch devices?
- Should custom date range presets be persistable per user in localStorage?
