---
title: 'Optimistic UI Merging for Disconnected States'
type: 'adr'
description: 'Waiting for connection triggers or showing blocking overlays during offline/slow network operations leads to high perceived latency and poor user expe...'
status: 'active'
last_updated: '2026-07-18T17:50:00Z'
---

# Optimistic UI Merging for Disconnected States

## Context

Waiting for connection triggers or showing blocking overlays offline/slow network operations leads to high perceived latency and poor user experience.

## Decision

enforce optimistic rendering pattern client-side query hooks merge active server documents with uncommitted local `MutationQueueItem` drafts. drafts decorated with temporary IDs and "Syncing" indicators and sorted to index 0 of feeds. **Exemption:** Per [ADR 0022 — Animations & Micro-Interactions](../../design/0022-animations-microinteractions.md), mutations affecting financial data, access control rules, or 3rd-party integrations strictly excluded from optimistic feed merging and must render explicit loading/confirmation states.

## Consequences

- Provides instant, zero-latency feedback for UI interactions.
- Keeps UI functional and consistent regardless of connection status while protecting critical financial records.
- Requires clean separation between server-authoritative and client-draft state structures.

> **See also:**[ADR 0022 — Animations & Micro-Interactions](../../design/0022-animations-microinteractions.md) governs visual/interaction layer for optimistic UI — which operations qualify for instant rendering, unhappy path state design, and rollback UX. ADR governs data-layer merge strategy.
