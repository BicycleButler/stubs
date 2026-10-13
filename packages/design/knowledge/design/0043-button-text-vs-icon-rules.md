---
title: '0043 - Button Text against Icon Rules'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-09T03:00:00Z'
---

# 0043 - Button Text against Icon Rules

## Context

Choosing between text labels, icon + text labels, and icon-only buttons is critical to balancing user clarity with visual density. Visual clutter on persistent, always-visible surfaces increases cognitive load, whereas insufficient clarity on transient, high-stakes surfaces (like forms or confirmation dialogs) causes user anxiety and error.

A unified rule is required to define exactly when a button must have text and when it must be icon-only.

## Decision

### 1 — The Surface Presence Principle (Transient against. Persistent)

The core heuristic for button representation is determined by how long the button's hosting surface remains on the screen.

- **Persistent Surfaces (Always visible on screen):**
  - Single Primary CTA: Must be Icon + Text.
  - All other utility controls (filters, imports, exports, settings, search): Must be Icon-Only.
  - Goal: Reduce constant clutter.
- **Transient Surfaces (Modals, dialogs, forms, sheets, popovers):**
  - Primary and secondary buttons must use Text or Icon + Text.
  - Banned: Icon-only buttons on transient action footers.
  - Goal: Prevent accidental user errors through clarity.

#### A. Persistent Surfaces (Toolbars, Headers, Sidebars, Primary Layouts)

Persistent surfaces have a constant presence on the screen. Minimizing visual noise on these surfaces is critical to a clean UI/UX.

- **Icon-Only Preferred:** All secondary, helper, or utility controls (for example,., Import, Export, Share, Filters, Settings, Search triggers) on persistent surfaces must be **Icon-Only** (with an explicit `aria-label` and a 200–300ms hover tooltip per [0039-toolbar-header-standards.md]).
- **Primary CTA Exception:** A persistent surface can contain at most one Primary CTA. It must be **Icon + Text** at rest. During toolbar narrowing, it collapses to **Icon-Only** before overflowing into `MoreVertical`.

#### B. Transient Surfaces (Modals, Dialogs, Forms, Sheets, Popovers)

Transient surfaces are temporary and overlay or replace the primary screen. They are opened intentionally to do focused, high-stakes operations.

- **Text Mandated:** Primary action buttons and secondary buttons inside transient surfaces **must use Text or Icon + Text**.
- **Reasoning:** Since these surfaces are temporary, reducing clutter is secondary to preventing user error. Users need absolute clarity on the consequences of their actions before submitting a form or confirming a deletion.
- **Prohibition:** Icon-only buttons are strictly prohibited for action buttons in modal footers or form footers.

### 2 — Taxonomy of Buttons

#### Category A: Must Have Text (Icon + Text or Text-Only)

- **Primary Page/Section CTAs:** (for example,., `[+] Add Contact`, `[+] New Task`, `[+] Record Expense`).
- **Form Submissions & Workflow Drivers:** (for example,., `[] Save Changes`, `[→] Continue to Review`, `[] Complete Setup`).
- **Form/Modal Cancel/Back Actions:** (for example,., `Cancel`, `[←] Back`).
- **High-Stakes Destructive Actions in Active Dialogs:** (for example,., `[] Delete Organization` or `Cancel` inside active confirmation dialogs).
- **Context-Specific Inline Actions:** Actions where an icon alone cannot convey the exact meaning (for example,., "Assign to Me" or "Convert to Customer").

#### Category B: Must Be Icon-Only (With Tooltip + `aria-label`)

- **Data Transport Utilities on Toolbars:** (for example,., `[↑]` (Import), `[↓]` (Export), `[⎋]` (Share Link)).
- **Global View & Layout Controls:** (for example,., `[]` (Search / Clear), `[]` (Settings), `[]` (Notifications), `[?]` (Help), `[]` (Close/Dismiss icon on the top-right corner)).
- **Data Grid Utilities:** (for example,., `[]` (Filter / Sort), `[]` (Column Visibility), `[]` (Grid/List View Toggle)).
- **Table Row / Inline Overflow Triggers:** (for example,., `[...]` / `⋮` More Actions trigger for row-level editing/deletion).

### 3 — Defining a "Primary CTA" Candidate

To prevent visual confusion, there must be a strict limit on what qualifies as a "Primary CTA" requiring Icon + Text on a persistent surface:

1. **Single Focus:** There is at most **one** Primary CTA per persistent surface (for example,., page toolbar or section header).
2. **Entity Creation:** The action instantiates a new record in the system (for example,., contacts, deals, tasks, expenses).
3. **Primary Intent:** The action represents the ultimate positive path or primary driver of user engagement on that view.

### 4 — Step-by-Step Decision Heuristic

When building custom buttons, use the following checklist to determine if a button must have text or be icon-only:

1. **Is the button on a transient surface (form, modal, popover, sheet, popup)?**
   - **Yes:** Must have text or icon + text for  primary and secondary buttons.
2. **Is it the single Primary CTA of a persistent surface (page toolbar)?**
   - **Yes:** Must be Icon + Text (for example,., `[+] Add Contact`).
3. **Is it a high-stakes, destructive, or state-transition action?**
   - **Yes:** Must have text or icon + text.
4. **Does the action lack a globally standard Lucide icon (for example,., "Convert Deal", "Merge Duplicates")?**
   - **Yes:** Must have text or icon + text.
5. **Is the action an auxiliary utility, secondary control, filter, or data-transport operation on a persistent surface?**
   - **Yes:** Must be Icon-Only with a tooltip and `aria-label` (to eliminate clutter).

## Consequences

- UI visual noise is significantly reduced on persistent dashboards and toolbars.
- User confidence and conversion metrics are maximized through prominent, clear Primary CTAs.
- Destructive and transient form actions gain absolute clarity, preventing accidental data loss or incorrect form submissions.
- Form/Modal designs maintain consistent text pairings on action footers.
