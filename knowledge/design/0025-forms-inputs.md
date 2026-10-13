---
title: '0025 - Forms & Input Design'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-01T14:52:00Z'
---

# 0025 - Forms & Input Design

## Context

Form and AI prompt interaction UX must remain clear and structured. Traditional input field inconsistencies (placeholders as labels, static red alert colors on resting forms) increase cognitive load. AI capabilities require clear prompt entry, compact media previews, execution transparency, and confidence scoring.

## Decision

Adopt standardized form and AI component input patterns:

1. **Consistent Field Sizing:** Text inputs and selects: 36–40px height. Textareas: 80px minimum with vertical resize.
2. **Labels Above Inputs:** Labels must always render above inputs (never inline or placeholder-only). Placeholders supplement labels.
3. **Dynamic Validation Timing (No Static Alert Colors):** Form controls remain neutral at rest. Validation error borders (red stroke + contextual error text) and warning indicators manifest **only dynamically** upon input blur or form submission failure.
4. **AI Input Prompt Canvases:** Position prominent prompt input canvases **above the fold** in AI-assisted workflows. Canvases must feature multi-line expansion, explicit trigger buttons, and clear keyboard shortcuts (`⌘Enter` to execute).
5. **Structured Input Preview Blocks:** Pasted snippets or attached files must compress into compact, removable card preview blocks.
6. **Execution Trails & Confidence Indicators:**
   - **Execution Trails:** AI processing states must show live, step-by-step progress trails ("Searching → Indexing → Generating response") using non-linear physics transitions.
   - **Confidence Indicators:** AI-generated outputs must display non-invasive, click-to-expand numeric confidence scores (for example,., `94% match`) positioned unobtrusively alongside generated content.
7. **Field Grouping & Multi-Step:** Related fields sit in semantic `<fieldset>`/`<legend>` blocks separated by 32px (`space-8`). Multi-step forms feature progress steppers with zero data loss on backward navigation.

### AI-Assisted Input Patterns

_The following rules apply only to AI-assisted workflows — not standard forms._

8. **AI Input Prompt Canvases:** Position prompt canvases above the fold. Multi-line expansion, explicit trigger button, and `⌘Enter` to execute.
9. **Structured Input Preview Blocks:** Attached files compress into compact preview cards with a single-click remove icon.
10. **Execution Trails:** AI processing must show live step-by-step progress ("Searching → Indexing → Generating response") using non-linear transitions.
11. **Confidence Indicators:** AI-generated outputs display click-to-expand numeric confidence scores (for example,., `94% match`) unobtrusively alongside content.
