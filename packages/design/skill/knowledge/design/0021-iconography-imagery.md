---
title: '0021 - Iconography & Imagery Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T06:15:00Z'
---

# 0021 - Iconography & Imagery Standards

## Context

Mixed icon sources, uncontrolled sizing, and missing avatar fallbacks degrade visual consistency. Mutating avatar containers into inline name tags causes layout reflows and clipping.

## Decision

1. **Single Icon Library:** Lucide across the entire project. No mixed styles, stock SVGs, or emoji for functional UI.
2. **5-Tier Icon Size & Optical Stroke Scale:**
   - **Inline (16px):** `strokeWidth={2}` (2px stem protection for dense context)
   - **Action (20px):** `strokeWidth={2}` (buttons, input fields)
   - **Navigation (24px):** `strokeWidth={1.75}` (toolbar, sidebar)
   - **Feature (32px):** `strokeWidth={1.5}` (card headers, metric callouts)
   - **Hero (48px):** `strokeWidth={1.5}` (empty states, banners)
3. **Mobile Touch Target Bounds:** Interactive icon elements on touch devices must provide a minimum 44×44px hit area.
4. **Dynamic Background Contrast:** Icons on user-uploaded images require a solid backdrop, drop-shadow, or scrim overlay.
5. **Avatar System & Fixed Bounds:**
   - 4 sizes (24/32/40/48px), strictly circular. Fallback chain: uploaded image → initials → generic icon.
   - **Immutable Container Rule:** The `Avatar` primitive must preserve its 1:1 circular aspect ratio. Expanding it into name tags, pills, or cards is strictly prohibited. Hover previews must render through portal overlays per [0022-animations-microinteractions.md].
6. **Image Handling:** Aspect ratio locking, lazy loading below fold, alt text for meaningful images, WebP/AVIF preferred.
