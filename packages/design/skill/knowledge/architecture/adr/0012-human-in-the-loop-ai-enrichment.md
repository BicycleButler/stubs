---
title: 'Human-in-the-Loop AI Enrichment'
type: 'adr'
description: 'Automated background AI data enhancements (scraping directories or sites) can hallucinate or fetch out-of-date information, which would corrupt author...'
status: 'active'
last_updated: '2026-07-18T17:50:00Z'
---

# Human-in-the-Loop AI Enrichment

## Context

Automated background AI data enhancements (scraping directories or sites) can hallucinate or fetch out-of-date information, which corrupt authoritative data profiles if applied autonomously.

## Decision

Apply non-critical data autonomously. Critical fields (email, phone, address) generate pending changes for review. Commit critical fields only after user validation. High-confidence suggestions can bypass review if auto-reconcile settings are active.

## Consequences

- Protects core database integrity from AI hallucination or ingestion drift.
- Empowers user governance over automated updates.
- Adds database collections (`pending_changes`) and requires dedicated review UI.
