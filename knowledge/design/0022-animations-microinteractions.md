---
title: '0022 - Animations, Motion & Transition Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T06:15:00Z'
---

# 0022 - Animations, Motion & Transition Standards

## Context

Covers all animation and transition rules: element-level micro-interactions, async state visuals, route transitions, and section reveals. Scoped to the visual layer. Data-layer merge strategy is governed by [../architecture/adr/0011-optimistic-ui-merging.md].

## Decision

### Element Animation

1. **No Linear Easing.** `transition: all linear` is banned system-wide. Use cubic-bezier curves: `cubic-bezier(0.4, 0, 0.2, 1)` (default), ease-out (entering), ease-in (exiting).
2. **Duration Budget: 200ms–500ms.** Micro-interactions: 200ms. Standard transitions: 300ms. Complex surface/layout transitions: max 500ms. Outside this range is banned.
3. **Tooltip Delay Tiers.** Three tiers by context:
   - **Toolbar buttons (200–300ms):** Page toolbar icon buttons per [0039-toolbar-header-standards.md]. Toolbar context implies deliberate cursor placement.
   - **Content area (700–1000ms):** Dropdowns, popovers, general hover tooltips — implementations can tune within the band.
   - **Standalone icons & avatars (1000ms):** Floating controls and avatars use 1000ms delay to prevent flicker during rapid scanning.
   - All tooltips dismiss instantly on mouse-out.
4. **Avatar Name Tags.** Render through Portal-based Tooltips or Popovers anchored to the avatar. Expanding or morphing the avatar container is prohibited per [0021-iconography-imagery.md].
5. **Reduced Motion.** Respect `prefers-reduced-motion: reduce` — replace spatial animations with instant state switches or opacity-only fades. Skeleton shimmer halts: `motion-reduce:after:animate-none`.

### Async State Visuals

6. **Unhappy Path First.** Every async operation must define all 4 states:
   - **Empty:** Illustrated empty state with CTA.
   - **Loading:** Skeleton shimmer — never a spinner.
   - **Error:** Contextual message + retry action.
   - **Partial/Degraded:** Show what succeeded. Inline error for what failed.
7. **Optimistic UI.** Mutate client state immediately on user action for predictable operations (delete from list, toggle status, mark read). On server failure: roll back + high-priority error toast. Reversible, low-risk operations mutate optimistically. Financial or security mutations require explicit confirmation.

### Route & Layout Transitions

8. **Route Transitions.** Fade only — class: `animate-in fade-in duration-200`. No slide, flip, or scale at page level. Apply to the `<main>` or top-level page `<div>`.
9. **Section / Panel Mount.** Class: `animate-in fade-in slide-in-from-bottom-4 duration-300`. Maximum slide distance: `slide-in-from-bottom-6`.
10. **List Item Stagger.** Stagger the first 8 items at 20–30ms intervals through `animationDelay`. Items 9+ appear simultaneously. Stagger only on initial mount — not on re-renders or filter changes.

    ```tsx
    {
      items.map((item, i) => (
        <div
          key={item.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${Math.min(i, 7) * 25}ms` }}
        />
      ));
    }
    ```

11. **Dialog / Sheet.** Preserve Radix transitions: open `fade-in-0 zoom-in-95` (200ms), close `fade-out-0 zoom-out-95` (200ms). No slide animations on dialogs.
12. **Dropdown / Popover.** Open/close: `fade-in-0 zoom-in-95` / `fade-out-0 zoom-out-95` at 100ms.
13. **Skeleton → Content.** Fade in the content wrapper: `animate-in fade-in duration-200`. Never slide or scale — position is already established.

### Forbidden Patterns

- Pattern | Reason
- `transition: all` | Over-broad. Animates unintended properties
- `linear` easing | Mechanical. Banned
- Page-level slide > 6 units | Disorienting at large viewport
- Simultaneous fade + color change | Compound transitions feel sluggish
- Infinite loops in content area | Reserved for intentional loading states only
- Scale > 105% on enter | Aggressive in data-dense context
