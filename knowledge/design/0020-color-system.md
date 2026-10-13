---
title: '0020 - Color System Architecture'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-01T14:52:00Z'
---

# 0020 - Color System Architecture

## Context

Color management across multi-theme applications can be fragile. Manual palette creation produces inconsistent perceived brightness across hues (known HSL limitation). Components consuming raw color values break when themes change. External system colors (for example,., Google Calendar) require special handling to maintain visual continuity.

> [!WARNING]
>
> ### Zero Static Semantic Alert Colors
>
> Saturated red, amber-yellow, or alert-green colors are **strictly forbidden** on resting UI surfaces, cards, and default table views. Semantic alert colors are reserved for dynamic, ephemeral feedback states. Use them for input errors, toasts, or hover interactions. Resting elements and status indicators must rely on neutral typography and sub-label hierarchy.

## Decision

Adopt OKLCH color system standards and palette derivation rules:

1. **OKLCH Perceptual Model:** Use OKLCH for dynamic themes, status tints, and chart colors to make sure of uniform perceived lightness.
2. **3-Seed Derivation:** Every theme is generated from 3 seed colors (primary, accent, neutral). Each seed produces shade stops through OKLCH lightness stepping (-100 light, -200 mid, -300 dark).
3. **Two-Tier Architecture:** Tier 1 = palette primitives (`--primary-100/200/300`, and so on.). Tier 2 = semantic tokens (`--primary`, `--background`, `--border`). Components consume Tier 2 tokens exclusively.
4. **Neutral Foundation:** 3 background layers, 2 structural strokes, 3 text contrast tiers — with defined WCAG contrast minimums.
5. **Dynamic-Only Semantic Status Palette:** Dynamic feedback colors (Success green, Warning amber, Destructive red, Info blue) are defined independently of seed colors with paired foreground tokens. They manifest only during active user interactions or ephemeral system events—never statically on resting views.
6. **Chart Color Generation Rules:** Increment Hue in steps of 25° to 30°. Hold Lightness and Chroma constant.
7. **Third-Party Exception Category:** External colors are namespaced globally. Do not redefine external colors per theme. Compute contrast dynamically.
8. **Google Calendar Fidelity:** Fetch live colors from the API. Maintain an 11-color fallback map and calculate foreground contrast dynamically.
9. **Base Theme Seed Derivation:** Default themes calculate tokens using OKLCH 3-seed logic. Accent hues use a harmonic offset of -15°. This preserves blue primary selections without teal drift.

## Consequences

- OKLCH guarantees consistent perceived brightness across all hues — the key advantage over HSL.
- Components remain theme-agnostic. Zero Tier 1 primitive values in component files.
- All default and custom themes share a single, mathematically verified OKLCH token contract.
