# SPEC-004 — Preserve calculator state across year switches

- **Priority**: P0 · **Effort**: S · **Origin**: UX Designer, Software Architect · **Status**: Proposed

## Problem

`renderApp()` in `src/main.ts` rebuilds the entire App on every `YearSelector.onSelect`. The active tab survives (via a DOM query on `.tabs-nav__btn--active`), but the Calculator is recreated with hardcoded defaults: every value the user typed is destroyed, plus the AnexosHeader scope and the ExerciciosPanel expansion/connection state. Comparing the same income across 2024/2025 is the single most obvious reason the YearSelector exists — and doing it wipes the scenario the user just built, with no warning and no undo.

## Proposed solution

Capture the calculator state before re-rendering and thread it into the rebuilt tree. No framework needed — the handles already exist.

## Requirements

1. Before re-render, capture `calculator.getInputs()` (handle exists) and the current `VisibleGroups` scope.
2. Thread them into `TabCalculadora(config, initialInputs)` → `Calculator({ initial })` — the `initial` prop is already supported.
3. Preserve ExerciciosPanel expanded/connected state across the rebuild.
4. Alternative accepted implementation: module-level `lastSnapshot` fed by the existing `Calculator.onChange` callback, used as `initial` on every render.
5. The recomputation after the switch uses the newly selected year's config (that part already works).

## Acceptance criteria

- [ ] Type custom values → switch 2025 → 2024 → 2025: all inputs intact, results recomputed per year.
- [ ] AnexosHeader group visibility survives the switch.
- [ ] ExerciciosPanel does not collapse or disconnect on year switch.
- [ ] No regression in first-load defaults.

## Touched areas

`src/main.ts`, `src/ui/sections/TabCalculadora.ts`, `src/ui/components/Calculator.ts`, `src/ui/components/ExerciciosPanel.ts`
