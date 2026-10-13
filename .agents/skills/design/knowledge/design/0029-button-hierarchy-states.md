---
title: '0029 - Button Hierarchy & States'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T06:15:00Z'
---

# 0029 - Button Hierarchy & States

## Context

Button variants must maintain clear visual hierarchy without creating visual anxiety. Unbounded motion and arbitrary text-slide effects on standard form actions introduce visual noise.

## Decision

### 1 — Menu-Gated Destructive Actions Rule

> **Canonical source:** [0036-destructive-action-confirmation.md] governs zero semantic color at rest and menu-gated entry points. Summary for button implementation:

- All semantic alert colors (destructive red, success green, warning amber) are banned on resting button surfaces — see [0036-destructive-action-confirmation.md].
- Destructive actions must be gated inside an overflow menu (`...`) or an explicit modal trigger.
- Overflow trigger: `variant="ghost"`. Red text and highlight appear only on hover of the destructive item inside the open menu.

### 2 — Variant Decision Rule

One button per tier per surface (card, modal footer, toolbar section):

- Tier | Variant | When to use
- Primary | `default` | Single primary CTA per surface (Save, Confirm, Submit)
- Secondary | `outline` | Secondary actions (Edit, Export, Cancel in footers)
- Tertiary | `secondary` | Supporting actions in grouped toolbars or filter bars
- Quiet / Menu Trigger | `ghost` | Low-emphasis: header icon controls, overflow triggers (`...`)
- Text | `link` | Navigation-style triggers embedded in body text
- Modal Destructive | `destructive` | Inside active confirmation modals or active hover in open menus

### 3 — Functional Text-Slide Motion Rule

- Standard buttons use variants (`default`, `outline`, `ghost`) with 200ms background/border transitions and push feedback (`transform: scale(0.97)`).
- **Text-slide exception:** Permitted only when the sliding text provides functional utility:
  1. **State/Mode Switchers:** "Copy Link" → "Copied!"
  2. **Space-Constrained CTAs:** "Export Data" → "CSV / 1.2 MB"
  3. **Progressive Async Feedback:** live status during async triggers.
- **Forbidden:** Decorative-only text-slide, on standard form inputs, or inside table cells. Sliding buttons must enforce fixed width/height with `overflow-hidden`.

### 4 — Size Decision Rule

- Size | Use
- `sm` | Dense toolbars, table row overflow triggers, chips
- `default` | Standard form submissions, modal footers, page CTAs
- `lg` | Hero sections, onboarding primary CTA only
- `icon` / `icon-sm` / `icon-lg` | Icon-only controls. Mandatory `aria-label`

### 5 — Loading State

- On click: disabled + `Loader2` spinner (`animate-spin`) replaces leading icon or appears left of label.
- Label switches to past-progressive verb: "Saving…", "Deleting…".
- The button is the status indicator — no separate full-screen spinner.

### 6 — Icon Placement

- Leading icon only, except directional navigation (for example,., "Next →").
- Icon size: 16px (Action tier per [0021-iconography-imagery.md]).

### 7 — Keyboard & Focus Defaults

- `Enter` confirms `default` and `outline` buttons when focused.
- `Enter` must **never** auto-confirm destructive buttons inside `AlertDialog`s — focus lands on Cancel by default.
- `Escape` dismisses the surface without action.

## Consequences

- Defaulting Enter to Cancel prevents accidental deletions. This differs from standard dialog behavior.
