---
title: '0042 - Multi-Step Wizards & Complex Workflow Standards'
type: 'adr'
description: 'Accepted'
status: 'active'
last_updated: '2026-08-08T07:20:00Z'
---

# 0042 - Multi-Step Wizards & Complex Workflow Standards

## Context

Complex creation flows (e.g. campaign setup, multi-step customer onboarding, service contract intake, custom vehicle builds) present high cognitive load when rendered as long single-page forms or naive linear wizards. Inconsistent step navigation, disabled "Next" buttons, lack of draft persistence, missing live previews, and poor error feedback cause user disorientation and high drop-off rates.

## Decision

Adopt Facebook / Meta's gold-standard wizard architecture across all multi-step workflows:

### 1 — Layout & 3-Zone Anatomy

Every multi-step wizard must adhere to a strict 3-zone layout managed by `<WizardShell>`:

- **Top Header Bar:** Contains exit button (`✕ Exit`), live draft auto-save indicator ("Saving draft..." → "Draft saved"), and step progress counter ("Step 2 of 4").
- **Left Vertical Step Tree Sidebar (240–280px):** Renders a vertical tree of steps. Completed steps show a checkmark (`✓`) icon; active step is highlighted; upcoming steps are neutral. Clicking any previously completed step jumps directly to that step without data loss.
- **Center Form Canvas (60–70% width):** Focused input area displaying only the fields for the active step.
- **Right Live Preview Panel (30–40% width):** Real-time summary or live preview (e.g. ad card preview, contract summary) that updates dynamically as inputs change.
- **Bottom Sticky Navigation Bar:** Fixed bottom bar containing `[ Back ]` (secondary/outline) on the left and `[ Next: <StepName> -> ]` (primary default) on the right.

### 2 — Draft Auto-Save & Exit Guard

- **Automatic Draft Persistence:** Input changes auto-save in the background to `IndexedDB` (local offline sync queue per [ADR 0011](../architecture/adr/0011-optimistic-ui-merging.md)) and sync to the server draft collection on network availability.
- **Unsaved Exit Safety:** Clicking `✕ Exit` or navigating away triggers a safety confirmation modal (`AlertDialog` per [ADR 0032](0032-modal-dialog-standards.md)) offering "Save Draft & Exit" or "Discard Draft".

### 3 — Step Validation & Advance Gating

- **No Disabled "Next" Buttons:** The `Next` button is **never disabled**. Disabling buttons leaves users confused about missing requirements.
- **Click-to-Validate:** Clicking `Next` executes validation on the current step:
  - If valid: Advances immediately to the next step.
  - If invalid: Blocks advance, smoothly scrolls to the first invalid field, focuses it, and reveals inline error messages per [ADR 0025](0025-forms-inputs.md).
- **Unrestricted Back Navigation:** Clicking `Back` or selecting a previously completed step in the sidebar is **always allowed** without validation blocking and with **zero data loss**.

### 4 — Meta/Facebook-Grade Data Review Grid & Value Mapping (Data Imports)

For data import wizards, Step 3 (Review & Validate) must adhere to Meta/Facebook Ads & Business Manager data ingestion standards:

- **Status Filter Tabs:** Top filter bar allowing operators to isolate rows: `All Rows (N)`, `Valid (N)`, `Needs Attention / Errors (N)`, and `Conflicts (N)`.
- **Inline Cell Editing & Resolution:** Spreadsheet-like cell rendering allowing direct editing of invalid values (e.g. fixing date formats, choosing a Dealer from an inline combobox cell) with real-time re-validation.
- **Bulk Mass-Fix Actions:** One-click toolbar actions to resolve batch errors (e.g. _"Assign all 15 unlinked dealers to Org X"_, _"Approve all new tags"_, or _"Default missing priority to Medium"_).
- **Value-Mapping Step (Step 2):** Support mapping raw CSV text values (such as stage names "In Negotiation" or priorities "Urgent") directly to application schema enum identifiers before record validation.

### 5 — Brand Templates & Template Precedence Over AI

- **Multi-Template Brand Configuration:** Brands can store multiple named import templates (e.g., _Monthly Sell-Through_, _Quarterly YoY Report_, _Pre-Season Booking_).
- **Template Auto-Matching:** Header signatures automatically match and populate the appropriate brand template upon file selection.
- **Brand Template Precedence:** User-selected or signature-matched template mapping rules take strict precedence over AI document parsing, eliminating AI hallucinations and guaranteeing deterministic agency parsing.

### 6 — Server Job Persistence & Async Status Drawer

- **Decoupled Server Staging:** Files are staged in Cloud Storage and executed in server-side background worker chunks.
- **Persistent Floating UI Drawer:** When an operator clicks `[ Run in Background ]`, the wizard collapses into a floating bottom-right drawer (`<ImportStatusDrawer />`) showing live percentage progress and row counters.
- **Cross-Page & Off-Site Persistence:** The status drawer remains visible during SPA navigation across application pages (`/contacts`, `/organizations`, `/analytics`). Closing the browser tab does NOT interrupt the server import job; upon return, the user receives an alert toast and badge with job results.

### 7 — 3-Tier Interval Deduction & Temporal Merging

- **3-Tier Sales Interval Engine:** Handles date overlaps via:
  1. _Clean Sub-Period Deduction_: Automatically calculates missing period totals ($A_{\text{deduced}} = A_{\text{incoming}} - A_{\text{existing}}$) and reverse-engineers historical periods from MoM/QoQ/YoY comparative metrics.
  2. _Proportional Day-Weighted Splitting_: Allocates run-rates for mid-month overlaps while enforcing a 100% confidence threshold for sub-monthly granularity.
  3. _Deduction Conflict Cards_: Flags negative or divergent overlaps for explicit user approval (Trust Import vs. Trust DB vs. Log Conflict).
- **Temporal Deep Merge:** All entity updates (Contacts, Organizations) use `temporal-merge.ts` (`updatedAt` Last-Write-Wins), while enforcing `GenericDomainExclusionRule` to prevent public webmail domains (`gmail.com`, `comcast.net`) from creating or linking corporate organizations.

### 8 — Responsive Tier Adaptation

- **Desktop (>1024px):** 3-column split view (Step Tree Sidebar | Form Canvas | Live Preview Panel / Review Grid).
- **Tablet (768–1024px):** 2-column view (Step Tree drawer toggle | Form Canvas | Floating Preview toggle button).
- **Mobile (<768px):** Single-column stacked wizard with a top horizontal progress bar and fixed bottom navigation bar.
