---
title: 'ADR 0050: Offline States, Syncing & Concurrent Conflict Resolution'
type: 'adr'
status: 'in-progress'
description: 'TODO Draft proposal: Visual indicators for network disruption, offline mutation queues, background sync banners, and conflict resolution diff modals.'
date: '2026-08-20'
---

# ADR 0050: Offline States, Syncing & Concurrent Conflict Resolution

> [!NOTE]
> **TODO / RFC Draft:** This document is in draft status within `knowledge/in-progress/` and serves as a discussion proposal for future revision and adoption. The specifications below represent proposed guidelines for review, not yet active design system enforcement rules.

---

## Context

Field operations, mobile CRM tasks, and real-time collaborative workspaces frequently experience intermittent network dropouts or simultaneous multi-user edits on identical records.

Currently:

1. Applications lack consistent offline feedback, leading users to believe actions failed or were lost.
2. Optimistic UI merges (Architecture ADR 0011) lack clear visual states when mutations are pending background sync.
3. Concurrent edit collisions silently overwrite data without presenting conflict resolution affordances.

---

## Proposed Guidelines & Architectural Standards

### 1 — Network Status Banners & Sticky Indicators

```
┌────────────────────────────────────────────────────────────┐
│ ⚠️  You are offline. 3 changes queued. Working in read/cache mode. [Retry] │
└────────────────────────────────────────────────────────────┘
```

- **Top Sticky Banner:** When `navigator.onLine === false` or WebSocket connection drops:
  - Surface: `bg-muted text-foreground border-b border-border/60 py-2 px-4 text-xs font-medium flex items-center justify-between`.
  - Icon: `<WifiOff className="w-3.5 h-3.5 text-muted-foreground" />`.
  - Content: Clear statement of state + count of offline queued mutations.
- **Reconnecting State:**
  - When connection is re-established: Banner updates to `"Reconnecting & syncing 3 changes..."` with spinning loader.
  - Auto-dismisses 3 seconds after successful sync with a brief checkmark confirmation.

---

### 2 — Optimistic Mutation Visual Cues

- **Pending Offline Items:** In lists, cards, or tables, items modified while offline should display a subtle sync icon:
  `<Clock className="w-3.5 h-3.5 text-muted-foreground/60" aria-label="Pending sync" />`.
- **Sync Failure:** If a background sync fails permanently:
  - Provide an inline error badge/indicator with a `[Review]` or `[Retry]` action.

---

### 3 — Concurrent Edit Conflict Resolution Modal

When a user submits a change to a record that was modified remotely by another user:

```
┌────────────────────────────────────────────────────────────┐
│  Resolve Editing Conflict: Deal #1092                      │
├────────────────────────────────────────────────────────────┤
│  Sarah Connor modified this record 2 minutes ago.          │
│  Choose which version to retain:                           │
│                                                            │
│  ┌─────────────────────────┬────────────────────────────┐  │
│  │ Your Local Changes      │ Remote Server Version      │  │
│  ├─────────────────────────┼────────────────────────────┤  │
│  │ Amount: $52,000         │ Amount: $48,000            │  │
│  │ Stage: Negotiation      │ Stage: Contract Sent       │  │
│  └─────────────────────────┴────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  [Cancel]               [Keep Remote]    [Overwrite Remote] │
└────────────────────────────────────────────────────────────┘
```

- **Dialog Class:** Standard `Dialog` (size tier `lg` or `xl`).
- **Diff Presentation:** Side-by-side card comparison with field-level highlights.
- **Action Hierarchy:**
  - `Cancel`: Closes dialog and leaves local draft untouched.
  - `Keep Remote`: Discards local edits and applies server record.
  - `Overwrite Remote` (Primary): Overrides server record with local changes.

---

## Anti-Patterns & Prohibitions

1. **No Silent Data Overwriting:** Never overwrite remote changes without notifying the user if the underlying version timestamp does not match.
2. **No Persistent Blocking Alerts:** Do not freeze the entire UI with blocking modal dialogs during temporary network blips; allow cached reads and queue writes.
3. **No Uninformative Error Messages:** Never display `"Network Error"`; specify `"Offline — your edits are saved locally and will sync when reconnected"`.

---

## Open Questions for Discussion

- Should field-level 3-way merging (accepting some local fields and some remote fields) be supported in the resolution modal?
- Should offline caching use IndexedDB automatically for all table entity stores?
