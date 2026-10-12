---
title: '0033 - Toast & Notification Rules'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T06:15:00Z'
---

# 0033 - Toast & Notification Rules

## Context

Sonner is wired at `top-right`, z-index 100, using semantic tokens (ADR 0020). No rule exists for auto-dismiss duration, max concurrent count, when to use toast vs. inline feedback, or the "undo" pattern for destructive actions. Agents generating toast calls produce inconsistent dismiss behavior and missing undo affordances.

## Decision

### 1 — Auto-Dismiss Duration

| Toast type               | Duration                     | Rationale                                      |
| ------------------------ | ---------------------------- | ---------------------------------------------- |
| `success`                | 4 seconds                    | Glanceable confirmation, no action needed      |
| `info`                   | 5 seconds                    | Slightly more to read                          |
| `warning`                | 8 seconds                    | Requires attention; may need action            |
| `error`                  | Persistent (no auto-dismiss) | User must acknowledge; loss of info is harmful |
| Undo toast (destructive) | 8 seconds                    | Time to read + click Undo                      |

### 2 — Max Concurrent Toasts

- Maximum **3 toasts** visible simultaneously. Sonner stacks top-to-bottom from `top-right`.
- New toasts push older ones down. Oldest auto-dismiss first.
- Do not programmatically stack more than 3 — batch multiple success events into one: "3 contacts updated."

### 3 — When to Use Toast vs. Other Feedback

| Situation                                            | Use                                                      |
| ---------------------------------------------------- | -------------------------------------------------------- |
| Async operation completed (save, send, sync)         | Toast                                                    |
| Async operation failed (retryable)                   | Error toast with "Try Again" action                      |
| Async operation failed (non-retryable, data at risk) | Inline error message within the form/panel — not a toast |
| Destructive action completed (delete)                | Undo toast (§4)                                          |
| Field-level validation error                         | Inline error below input (ADR 0025)                      |
| Global degraded service / offline                    | Persistent banner (not a toast)                          |
| Empty search results                                 | Inline empty state (ADR 0022)                            |
| Background sync in progress                          | Sync indicator in top nav — not a toast                  |

### 4 — Undo Toast (Destructive Action Pattern)

When a user deletes or archives a record:

1. Perform the operation optimistically (ADR 0022 scoping rules apply — only for reversible deletes).
2. Show 8-second undo toast: "{Entity} deleted. [Undo]"
3. "Undo" button in toast triggers restoration server action.
4. If timer expires without undo: commit the deletion permanently.
5. If undo fails: show new error toast "Couldn't undo. Contact support."

Undo button variant in toast: Sonner's `action` button (renders inline, not as a full button component).

### 5 — Copy Rules (supplements ADR 0031)

- **Success:** Past tense, specific. "Contact saved." "Deal updated." "3 contacts imported."
- **Error:** What failed + "Try again" action. "Couldn't save contact. [Try Again]"
- **Undo:** "[Entity] deleted. [Undo]" — entity name if available, type if not.
- **Info:** Present progressive. "Syncing 12 offline changes…"
- Max 60 characters. No trailing period on single-clause messages.

### 6 — Position & Appearance

- Position: `top-right` (already implemented in `sonner.tsx`).
- Never move to `bottom-right` — this position is reserved for FABs (ADR 0017, z-index 60).
- Toast uses `shadow-xl` ([ADR 0041](0041-surface-tier-system.md) top-level tier) — already implemented.
- Width: Sonner default (~356px) — do not constrain narrower.

### 7 — Notification Bell vs. Toast (Clear Boundary)

- **Toast:** Responds to the current user's action in the current session. Ephemeral, auto-dismissing.
- **Notification Bell (`NotificationBell` in `top-nav.tsx`):** Surfaces persistent cross-session events — new assignment, mention, or status change from another user. Persists across sessions.
- **Rule:** Never emit the same event to both systems. A completed save is a toast. A deal assigned to you by a colleague is a bell notification. If in doubt: did the current user trigger it? Toast. Did another actor trigger it? Bell.

## Consequences

- Error toasts never disappear before users read them.
- Undo pattern prevents destructive data loss while keeping the UI fast and optimistic.
- Toast volume is bounded — no "toast storm" from batch operations.
- Clear delineation between toast feedback and notification bell removes duplication.
