# SPEC-005 — pt-PT number inputs with real validation (no silent zeros)

- **Priority**: P0 · **Effort**: M · **Origin**: UX Designer, Software Architect · **Status**: Proposed

## Problem

`Calculator.ts` uses raw `<input type="number">` with values like `13054.76`, while every output uses `formatEUR` ("13 054,76 €"). A Portuguese user who types `1.436,05` gets browser-dependent rejection or truncation. `getInputs()` then coerces anything non-finite to 0 — an empty or invalid field silently zeroes an income and the whole liquidação recomputes as if it vanished: no error state, no `aria-invalid`, no message. Negative amounts are accepted on every field except `quocienteFamiliar` (the only one with `min`/`max`).

## Proposed solution

A pt-PT parse/format layer over text inputs, with visible per-field error states, and "last valid value" semantics instead of zero-coercion.

## Requirements

1. Switch money fields to `type="text"` + `inputmode="decimal"`; accept `,` as decimal separator and spaces/dots as thousands; format on blur via the pt-PT conventions already in `src/ui/format.ts`.
2. Invalid input shows an inline error state: `.calculator__field--invalid` border + short message replacing the hint (e.g. "Insere um valor em euros, ex.: 1 436,05") + `aria-invalid="true"`.
3. While a field is invalid, the computation keeps the last valid value — never silently collapses to 0.
4. Enforce `min: 0` semantics on all money fields (negative values rejected with the error state).
5. Extend `FieldSpec` in `Calculator.ts` with the constraints so bounds live in one place (also used by SPEC-010's file validation).

## Acceptance criteria

- [ ] Typing `1.436,05` yields 1436.05; blur re-renders it as "1 436,05".
- [ ] Clearing a field mid-edit does not zero the result; an error/hint appears and the previous value holds.
- [ ] Negative input shows the invalid state and does not enter the engine.
- [ ] Screen readers announce invalid state (`aria-invalid` + message associated via `aria-describedby`).

## Touched areas

`src/ui/components/Calculator.ts`, `src/ui/components/Calculator.css`, `src/ui/format.ts`
