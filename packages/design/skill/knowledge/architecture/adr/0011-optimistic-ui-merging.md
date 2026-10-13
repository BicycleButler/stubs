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

Client query hooks merge active server documents with uncommitted local drafts. Drafts show temporary IDs and "Syncing" indicators, and appear at index 0 of feeds.

Exemption: Mutations affecting financial data, access control, or external integrations must not use optimistic merging. These mutations must show explicit loading and confirmation states.

## Consequences

- Provides instant, zero-latency feedback for UI interactions.
- Keeps UI functional and consistent regardless of connection status while protecting critical financial records.
- Requires clean separation between server-authoritative and client-draft state structures.

> **See also:**[../../design/0022-animations-microinteractions.md] governs visual/interaction layer for optimistic UI — which operations qualify for instant rendering, unhappy path state design, and rollback UX. ADR governs data-layer merge strategy.
