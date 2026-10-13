---
title: '0019 - Typography Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-01T14:52:00Z'
---

# 0019 - Typography Standards

## Context

Unconstrained font usage leads to inconsistent visual hierarchy. Typography scales require a clear mathematical foundation to maintain harmonic proportions across viewports.

## Decision

Adopt typography standards across all UI components:

1. **2-Family Limit:** One sans-serif primary (for example,., Inter, Geist) + one monospace. Decorative fonts are reserved exclusively for marketing hero headings.
2. **Golden Ratio Type Scale (6 Tiers):** Typography scaling rules use Golden Ratio proportions with a cap of six font tiers (12px to 24px). Maximum font size is 24px.
3. **4-Weight Hierarchy:** 400 (body text), 500 (labels/sub-labels), 600 (headings), 700 (hero/primary CTAs only).
4. **Display Heading Tightening:** For marketing headings beyond 24px, letter-spacing tightens by −2% to −3% and line-height drops to 110%–120%.
5. **Paragraph Readability:** Body line-height must remain between 140% and 160% (never below 140%).
