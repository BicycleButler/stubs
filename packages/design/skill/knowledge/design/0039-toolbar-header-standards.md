---
title: '0039 - Page Toolbar & Section Header Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T05:45:00Z'
---

# 0039 - Page Toolbar & Section Header Standards

## Context

Across core application domain views (Organizations, Contacts, Dealers, Expenses, Tasks, Deals, Inventory), section and page toolbars lack visual consistency, introduce arbitrary spatial animations, and occupy excessive vertical real estate (120px–220px before table/data display)[cite: 1]. Legacy implementations suffer from redundant secondary search inputs, loose toggle switches ("Archived", "Incomplete"), deprecated status badge pills, unorganized action rows, and hover-triggered dynamic layout shifts[cite: 1].

A unified architectural standard is required to enforce compact single-row toolbars, clean alignment zones, predictable control caps, visual toolbar button presentation standards, and strict accessibility compliance across all entity section headers[cite: 1].

## Decision

### 1. Height & Layout Constraints

- **Maximum Vertical Height:** Standard page toolbars must strictly enforce a maximum height of **52px across all screen sizes** (mobile, tablet, desktop). Multi-row wrapping is strictly eliminated in favor of dynamic single-row adaptive priority collapse.
- **Strict Prohibition of Horizontal & Vertical Scrolling:** Horizontal scrolling (`overflow-x-auto`) and vertical scrolling (`overflow-y-auto`) are **strictly banned** on page toolbars. Toolbars must fit statically on a single 52px row regardless of container width.
- **Persistent Overflow Anchor (`MoreVertical`):** The overflow menu button (`MoreVertical` / `⋮` three vertical dots) is an **absolute persistent anchor** on the far right of `PageToolbarRight`. It remains permanently visible on the toolbar across all screen widths.
- **Dynamic Single-Row Priority Collapse Engine:** Toolbars utilize container measurement (`ResizeObserver` / Container Queries) to track available container width in real-time. As container space narrows, controls adapt and collapse in a deterministic 7-stage priority sequence to preserve the single 52px row.

### 2. Header Zone Division & Priority Architecture

Page toolbars enforce a strict 2-zone horizontal layout:

```
+-------------------------------------------------------------------------------------------------+
| PAGE TOOLBAR BAR (Fixed Height: 52px, Strict Single-Row Layout)                                 |
| +------------------------------------+   +----------------------------------------------------+ |
| | [Title] (e.g., Contacts)           |   | [Search]  [Filter]  [Secondary]  [Primary]  [⋮]     | |
| | [Sub-label Count (Sub-label Stacking)]      |   | (Adaptive Priority Collapse Sequence → [⋮] Menu)   | |
| +------------------------------------+   +----------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------+
```

#### Declarative Control Priority Contract (`priority` prop)

Controls placed in `PageToolbarRight` define an explicit priority tier governing collapse order:

1. `priority="primary"`: Primary CTA (Icon + Text $\rightarrow$ Icon-Only $\rightarrow$ Overflow 6th).
2. `priority="secondary"`: Secondary CTA (Collapses to Overflow 5th).
3. `priority="search"`: Search Bar (Input $\rightarrow$ Search Icon $\rightarrow$ Overflow 4th).
4. `priority="utility"`: Auxiliary items like filters or exports (Collapses to Overflow 3rd, left-to-right).
5. `priority="persistent"`: Overflow Trigger (`MoreVertical` / `⋮`), never enters overflow.

#### 7-Stage Single-Row Priority Collapse Sequence

When width constraints occur, items adapt in the following strict order:

1. **Stage 1 (Search Bar Input Collapse):** Compact search input (`w-[240px]`) collapses into a borderless Search icon button (`[🔍]`). Clicking this icon opens the mobile Search Dialog.
2. **Stage 2 (Utility Controls Overflow):** Lower priority utility controls (`priority="utility"`), evaluated left-to-right, move into the `MoreVertical` dropdown menu.
3. **Stage 3 (Primary CTA Text Collapse):** Primary CTA button transitions from `Icon + Text` (e.g., `[+] Add Contact`) to `Icon-Only` while preserving its variant framing (`variant="default"` accent color & styling).
4. **Stage 4 (Search Icon Overflow):** Collapsed Search icon button (`priority="search"`) moves into the `MoreVertical` dropdown menu as `[🔍] Search...` list item.
5. **Stage 5 (Secondary CTA Overflow):** Secondary button (`priority="secondary"`) moves into the `MoreVertical` dropdown menu as `[Icon] Label` list item.
6. **Stage 6 (Primary CTA Overflow):** Primary CTA icon button (`priority="primary"`) moves into the `MoreVertical` dropdown menu as top-level highlighted `[Icon] Label` list item.
7. **Stage 7 (Title Text Truncation):** If container space is still insufficient with _only_ `MoreVertical` remaining on the right, Left Zone title text is clipped/truncated (`truncate flex-1 min-w-0`).

#### Item Representation Inside `MoreVertical` Dropdown Menu

When controls enter the overflow dropdown:

- **WCAG Text Label Compliance:** All collapsed items render as full `Icon + Text` list items (`DropdownMenuItem`).
- **Primary CTA Placement:** Positioned at the top of the overflow menu with subtle visual highlighting or separated by a `DropdownMenuSeparator`.
- **Search Item Action:** Selecting `Search...` opens the focusable Search Dialog.

### 3. Toolbar Button Implementation Rules (Visual Look)

Governed strictly by [ADR 0043 - Button Text vs Icon Rules](0043-button-text-vs-icon-rules.md):

- **Primary CTA (Icon + Text Button):**
  - The page or section's single Primary CTA (e.g., `[+] Add Contact`) **must use the Icon + Text** format at rest.
  - It uses standard visual framing (`variant="default" h-9 px-4`) to offer a clear, high-contrast focal point.
  - On narrow viewports (Stage 3), it collapses to an icon-only button (`h-9 w-9`) while maintaining `variant="default"` styling.
- **Auxiliary & Utility Options (Icon-Only Borderless Buttons):**
  - All non-primary utility controls (e.g., `[⛛] Filter`, `[↑] Import`, `[↓] Export`, `[⋮] More Actions`) **must render as Icon-Only** with no visible text on the button face.
  - **No Border:** Borderless framing (`border-none` / transparent background `variant="ghost"` / `variant="outline" border-none`).
  - **Full-Height Icon:** Icon scale expands to match the total height of the button container.
  - **Tooltip Interaction:** Toolbar icon-only buttons use a **200–300ms hover delay** before displaying a tooltip with descriptive text.

### 4. Responsive Adaptations

- **Strict 52px Single-Row Guarantee:** Across all viewports ($<375\text{px}$ to $>1920\text{px}$), toolbars maintain a single row.
- **Automatic Priority Collapse:** No custom media query hacks needed per view. Container size changes (sidebar toggles, split-pane resizes, mobile screens) trigger stages 1–7 automatically.
- **Persistent `MoreVertical` Anchor:** The `MoreVertical` (`⋮`) icon trigger remains unconditionally visible on the far right.

## Consequences

- Toolbar vertical height is strictly locked to 52px across all screen sizes, eliminating awkward multi-row wrapping.
- Visual hierarchy is preserved: Primary CTA and Search stay visible on the bar as long as physically possible before overflowing into `MoreVertical`.
- Dynamic layout reflows use deterministic 7-stage container measurement without triggering horizontal or vertical scrollbars.
- Full WCAG 2.1 Level AA keyboard navigation and touch target standards are maintained.
