---
title: 'ADR 0052: Print & PDF Export Styling Standards'
type: 'adr'
status: 'in-progress'
description: 'TODO Draft proposal: Print media stylesheets (@media print), pagination break controls, hiding UI chrome, and high-contrast ink-saving palettes.'
date: '2026-08-20'
---

# ADR 0052: Print & PDF Export Styling Standards

> [!NOTE]
> **TODO / RFC Draft:** This document is in draft status within `knowledge/in-progress/` and serves as a discussion proposal for future revision and adoption. The specifications below represent proposed guidelines for review, not yet active design system enforcement rules.

## Context

Users frequently print or export web views as PDFs for physical records, client invoice handoffs, field repair orders, and executive summary reporting.

Currently:

1. Printing a web page captures interactive navigation sidebars, floating FAB buttons, and toolbars.
2. Dark mode backgrounds consume excessive printer ink or print as unreadable dark gray boxes.
3. Multi-row tables and detail cards split awkwardly across page margins mid-row.

## Proposed Guidelines & Architectural Standards

### 1 — `@media print` Global Layout Rules

When `@media print` is activated:

```css
@media print {
  /* 1. Hide interactive web chrome */
  header,
  nav,
  aside,
  footer,
  .no-print,
  button,
  [role='toolbar'] {
    display: none !important;
  }

  /* 2. Reset backgrounds and force high-contrast ink */
  body,
  main {
    background: #ffffff !important;
    color: #000000 !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* 3. Render full widths */
  .container,
  main {
    max-width: 100% !important;
    width: 100% !important;
  }
}
```

### 2 — Page Break Management

To prevent awkward mid-element splits across physical printed pages:

- **Cards & Summary Panels:**
  ```css
  .print-avoid-break,
  .surface-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  ```
- **Table Headers & Rows:**
  - Table headers must appear again on subsequent printed pages:
    ```css
    thead {
      display: table-header-group;
    }
    tr {
      break-inside: avoid;
    }
    ```
- **Explicit Page Breaks:** Provide utility `.print-page-break` (`break-before: page;`) for multi-section reports.

### 3 — Printable Document Anatomy & Header Block

Every printable detail view (for example,. Invoices, Field Repair Sheets) must render a dedicated `.print-only` header block that is hidden in the web browser (`hidden print:block`):

- Document Header: The Bicycle Butler | Invoice #1092
- Metadata: Field Operations Service Report | Date: 2026-08-20

## Anti-Patterns & Prohibitions

1. **No Interactive Controls on Printouts:** Never print action buttons (`[Edit]`, `[Delete]`), search inputs, or pagination toggles.
2. **No Heavy Dark Fills:** Never allow dark mode backgrounds or dark card fills to print. All print styles must force pure `#ffffff` backgrounds with `#000000` text.
3. **No Hidden Overflow Clipping:** Remove `overflow-hidden` and fixed heights (`h-screen`, `max-h-*`) during print so that multi-page records render fully.

## Open Questions for Discussion

- Must print export templates include a printable QR code linking back to the live digital entity URL?
- Must PDF generation be handled client-side through CSS `@media print` or server-side through headless Chromium?
