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

establish Human-in-the-Loop gating policy: non-critical data (like logos) applied autonomously, but critical business fields (email, phone, address) must generate `PendingChange` or `ClientEnrichmentProposal` inside `ReviewQueue`. only committed to authoritative records upon manual user validation. High-confidence suggestions (>95%) can bypass manual review only if explicit auto-reconcile settings active.

## Consequences

- Protects core database integrity from AI hallucination or ingestion drift.
- Empowers user governance over automated updates.
- Adds database collections (`pending_changes`) and requires dedicated review UI.
