---
title: '0043 - Button Text vs Icon Rules'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-09T03:00:00Z'
---

# 0043 - Button Text vs Icon Rules

## Context

Choosing between text labels, icon + text labels, and icon-only buttons is critical to balancing user clarity with visual density. Visual clutter on persistent, always-visible surfaces increases cognitive load, whereas insufficient clarity on transient, high-stakes surfaces (like forms or confirmation dialogs) causes user anxiety and error.

A unified rule is required to define exactly when a button must have text and when it should be icon-only.

## Decision

### 1 — The Surface Presence Principle (Transient vs. Persistent)

The core heuristic for button representation is determined by how long the button's hosting surface remains on the screen.

```
                  +-----------------------------------------+
                  |         IS SURFACE PERSISTENT?          |
                  | (Always visible on screen, e.g.,        |
                  |  toolbars, sidebars, headers, layouts)  |
                  +--------------------+--------------------+
                                       |
                     YES               |               NO (Transient, e.g.,
                                       |                   modals, dialogs,
                                       |                   forms, sheets, popovers)
                                       v
                     +----------------------------------+  +----------------------------------+
                     |         PERSISTENT RULE          |  |          TRANSIENT RULE          |
                     |                                  |  |                                  |
                     |  - Single Primary CTA:           |  |  - Both Primary and Secondary   |
                     |    Must be ICON + TEXT.          |  |    buttons MUST use TEXT or      |
                     |  - All other utility controls    |  |    ICON + TEXT.                  |
                     |    (filters, imports, exports,   |  |  - High clarity is required due  |
                     |    settings, search):            |  |    to higher stakes.             |
                     |    Must be ICON-ONLY.            |  |  - Banned: Icon-only buttons on  |
                     |  - Goal: Reduce constant clutter |  |    transient action footers.     |
                     +----------------------------------+  +----------------------------------+
```

#### A. Persistent Surfaces (Toolbars, Headers, Sidebars, Main Layouts)

Persistent surfaces have a constant presence on the screen. Minimizing visual noise on these surfaces is critical to a clean UI/UX.

- **Icon-Only Preferred:** All secondary, helper, or utility controls (e.g., Import, Export, Share, Filters, Settings, Search triggers) on persistent surfaces must be **Icon-Only** (with an explicit `aria-label` and a 200–300ms hover tooltip per [ADR 0039 §3](0039-toolbar-header-standards.md)).
- **Primary CTA Exception:** A persistent surface may contain at most **one** Primary CTA (the main action driver for that view, e.g., "Add Contact" in a Contacts toolbar). This single Primary CTA must be **Icon + Text** at rest to provide a clear, high-contrast focal point. Under dynamic single-row toolbar container narrowing (Stage 2 per [ADR 0039](0039-toolbar-header-standards.md)), the Primary CTA collapses to **Icon-Only** while strictly preserving its visual variant styling (`variant="default"` accent color & framing) before overflowing into `MoreVertical` (Stage 6).

#### B. Transient Surfaces (Modals, Dialogs, Forms, Sheets, Popovers)

Transient surfaces are temporary and overlay or replace the main screen. They are opened intentionally to perform focused, high-stakes operations.

- **Text / Icon + Text Mandated:** Both primary action buttons (e.g., `Save`, `Confirm`, `Delete`) and secondary/supporting buttons (e.g., `Cancel`, `Back`) inside transient surfaces **must use Text or Icon + Text**.
- **Reasoning:** Since these surfaces are temporary, reducing clutter is secondary to preventing user error. Users need absolute clarity on the consequences of their actions before submitting a form or confirming a deletion.
- **Prohibition:** Icon-only buttons are strictly prohibited for action buttons in modal footers or form footers.

---

### 2 — Taxonomy of Buttons

#### Category A: Must Have Text (Icon + Text or Text-Only)

- **Primary Page/Section CTAs:** (e.g., `[+] Add Contact`, `[+] New Task`, `[+] Record Expense`).
- **Form Submissions & Workflow Drivers:** (e.g., `[✓] Save Changes`, `[→] Continue to Review`, `[✓] Complete Setup`).
- **Form/Modal Cancel/Back Actions:** (e.g., `Cancel`, `[←] Back`).
- **High-Stakes Destructive Actions in Active Dialogs:** (e.g., `[🗑] Delete Organization` or `Cancel` inside active confirmation dialogs).
- **Context-Specific Inline Actions:** Actions where an icon alone cannot convey the exact meaning (e.g., "Assign to Me" or "Convert to Customer").

#### Category B: Must Be Icon-Only (With Tooltip + `aria-label`)

- **Data Transport Utilities on Toolbars:** (e.g., `[↑]` (Import), `[↓]` (Export), `[⎋]` (Share Link)).
- **Global View & Layout Controls:** (e.g., `[🔍]` (Search / Clear), `[⚙]` (Settings), `[🔔]` (Notifications), `[?]` (Help), `[🗙]` (Close/Dismiss icon on the top-right corner)).
- **Data Grid Utilities:** (e.g., `[⛛]` (Filter / Sort), `[⚏]` (Column Visibility), `[⚃]` (Grid/List View Toggle)).
- **Table Row / Inline Overflow Triggers:** (e.g., `[...]` / `⋮` More Actions trigger for row-level editing/deletion).

---

### 3 — Defining a "Primary CTA" Candidate

To avoid visual confusion, there must be a strict limit on what qualifies as a "Primary CTA" requiring Icon + Text on a persistent surface:

1. **Single Focus:** There is at most **one** Primary CTA per persistent surface (e.g., page toolbar or section header).
2. **Entity Creation:** The action instantiates a new record in the system (e.g., contacts, deals, tasks, expenses).
3. **Primary Intent:** The action represents the ultimate positive path or primary driver of user engagement on that view.

---

### 4 — Step-by-Step Decision Heuristic

When building custom buttons, use the following checklist to determine if a button must have text or be icon-only:

1. **Is the button on a transient surface (form, modal, popover, sheet, popup)?**
   - **Yes:** Must have text or icon + text for both primary and secondary buttons.
2. **Is it the single Primary CTA of a persistent surface (page toolbar)?**
   - **Yes:** Must be Icon + Text (e.g., `[+] Add Contact`).
3. **Is it a high-stakes, destructive, or state-transition action?**
   - **Yes:** Must have text or icon + text.
4. **Does the action lack a globally standard Lucide icon (e.g., "Convert Deal", "Merge Duplicates")?**
   - **Yes:** Must have text or icon + text.
5. **Is the action an auxiliary utility, secondary control, filter, or data-transport operation on a persistent surface?**
   - **Yes:** Must be Icon-Only with a tooltip and `aria-label` (to eliminate clutter).

## Consequences

- UI visual noise is significantly reduced on persistent dashboards and toolbars.
- User confidence and conversion metrics are maximized through prominent, clear Primary CTAs.
- Destructive and transient form actions gain absolute clarity, preventing accidental data loss or incorrect form submissions.
- Form/Modal designs maintain consistent text pairings on action footers.
