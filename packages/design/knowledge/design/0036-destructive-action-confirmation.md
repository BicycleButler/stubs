---
title: '0036 - Semantic Color at Rest & Destructive Action Confirmation'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T05:45:00Z'
---

# 0036 - Semantic Color at Rest & Destructive Action Confirmation

## Context

Destructive actions (deleting records, revoking access, cancelling contracts) present permanent risk of data loss. Destructive workflow entry points must be strictly menu-gated, and preceding trigger controls must remain visually neutral at rest. More broadly, all semantic alert colors — not just destructive red — create visual anxiety and noise when present on resting surfaces.

## Decision

### 1 — Zero Semantic Color on Resting UI Surfaces

This is the foundational rule governing all semantic colors (success, warning, and destructive) in the application UI:

- **Semantic Alert Colors Banned at Rest:** Success green, warning amber, and destructive red are **strictly forbidden** on resting UI surfaces — including cards, table rows, section headers, badges, buttons, and default view states. This extends and formalizes the color-system rule in [ADR 0020](0020-color-system.md) (§5 — Dynamic-Only Semantic Status Palette).
- **Allowed Surfaces Only:** Semantic colors may only manifest during **active user interaction or ephemeral system events**:
  - Destructive / warning colors → inside an **open overflow menu** (red text + background highlight on hover of the destructive item only)
  - Destructive confirm button → inside an **active `AlertDialog`** modal
  - Success / warning / error colors → **transient toast notifications** (<4–8s auto-dismiss, per [ADR 0033](0033-toast-notification-rules.md))
  - Form validation error colors → **only on active blur or submission failure** (per [ADR 0025](0025-forms-inputs.md) §3)
  - Change indicators (percentage up/down) → permitted inline in data tables and KPI cards (contextual data display, not status signaling)
- **Neutral at Rest:** Resting buttons, cards, table rows, and status strings must rely exclusively on neutral typography, opacity hierarchy (Sub-label Stacking), and spacing — never semantic color — to convey categorical state.

### 2 — Menu-Gated Destructive Entry Points

- **Resting Trigger Neutrality:** Resting buttons preceding a destructive workflow **must remain neutral or `ghost` style**. Persistent red "Delete" buttons on resting screens are strictly forbidden (covered by Rule 1 above).
- **Allowed Entry Points:** Destructive workflows can **only** be initiated from inside an open overflow menu (`...`) (where red highlight manifests solely on active item hover) or via explicit modal dialog triggers.

### 3 — When Confirmation Is Required

**Always require confirmation dialog:**

| Action                                     | Reason                                    |
| ------------------------------------------ | ----------------------------------------- |
| Permanently delete a record                | Irreversible data loss                    |
| Bulk delete (≥2 records)                   | Higher impact, harder to recover          |
| Revoke user access / role removal          | Security consequence                      |
| Cancel a deal / close a deal (financial)   | Revenue-impacting, may affect commissions |
| Disconnect an integration (Google, Stripe) | Service disruption                        |
| Clear / reset data (import rollback)       | Bulk data modification                    |

**Do NOT require confirmation:**

| Action                | Reason                              |
| --------------------- | ----------------------------------- |
| Archive a record      | Reversible — unarchive is available |
| Mark as inactive      | Reversible                          |
| Reassign an owner     | Reversible                          |
| Save / publish a form | Positive-direction action           |

### 4 — Confirmation Dialog Requirements

Use `AlertDialog` (not standard `Dialog` — see ADR 0032) for all hard destructive confirmations:

- **Title:** Question form naming the entity. "Delete John Smith?" / "Delete 5 Contacts?"
- **Description:** Clear sentence explaining the consequence. "This action cannot be undone."
- **Cancel Button:** `outline` variant, left position, labeled "Cancel". Keyboard focus lands on Cancel upon dialog opening.
- **Confirm Button:** `destructive` variant, right position, explicitly naming the action + entity: "Delete Contact", "Delete 5 Contacts".
- **Forbidden:** Enter key auto-confirmation is disabled (Radix default). Confirm button labels like "OK", "Yes", or "Confirm" alone are banned.

### 5 — Undo as Alternative to Confirmation

For soft-delete workflows where records can be recovered within a grace period:

- Skip the confirmation dialog.
- Perform the action immediately (optimistic UI, ADR 0022).
- Show an 8-second undo toast ([ADR 0033](0033-toast-notification-rules.md) §4): "John Smith deleted. [Undo]".

## Consequences

- Resting surfaces remain completely free of semantic color — success, warning, and destructive colors only appear during active interactions or ephemeral system events.
- Destructive workflows require deliberate overflow menu interaction.
- Dialog focus defaults protect against accidental keyboard confirms.
- The principle extends ADR 0020 §5 from the color system level to the component behavior level.
