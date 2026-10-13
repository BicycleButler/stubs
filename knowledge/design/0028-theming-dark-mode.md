---
title: '0028 - Theming & Dark Mode'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-01T14:52:00Z'
---

# 0028 - Theming & Dark Mode

## Context

Multi-theme applications suffer from incomplete theme definitions and illegible dark mode surface hierarchies. Because dark shades bleed together more easily on digital displays, traditional light-mode contrast gaps are insufficient in dark mode.

## Decision

Adopt theming and dark mode elevation mechanics:

1. **Theme Contract:** Every theme must supply a completed manifest of CSS custom properties. Incomplete theme manifests fail build validation.
2. **Required Token Categories:** Every theme must supply background tiers, text contrast tiers, feedback colors, and chart series. Incomplete manifests fail build validation.
3. **Dark Mode Surface Elevation Mechanics:**
   - **Lightness Progression:** Dark mode surfaces get lighter as z-index increases: Canvas → Frame → Cards/Panels → Modals/Popovers.
   - **Contrast Gap:** Dark mode requires double the lightness contrast gap (4%–6%) between adjacent layers compared to light mode (2%).
4. **Borders & Shadows in Dark Mode:** Shadows are supplemented or replaced by lightened stroke borders (`border-border/40`). Elevated surface borders derive from the lightness tier above their container.
5. **Media Comfort:** Images and video backgrounds are dimmed 10–15% or slightly desaturated in dark mode to prevent visual blowout.
6. **System Preference:** Default to `prefers-color-scheme`. User overrides (light/dark/system) persist in local storage.
