# SPEC-020 — Guide personalization: the user's own numbers inside the pedagogy

- **Priority**: P2 · **Effort**: M · **Origin**: UX Designer · **Status**: Proposed

## Problem

`Seccao05_Fatias.ts` renders `SlicedIncome({ coletavel: 15650 })` — a hardcoded example — and Secção 02's BracketBar is explicitly stand-alone. The user's numbers appear only in the Calculadora tab; the guide's explanatory sections, where the "aha" should happen, never reflect them. The calculator output shows settlement-note lines (01, 02, 04, 05, 10, 11…) whose full anatomy is explained in Secção 07 — yet neither links to the other. The stated pedagogy — see the mechanism applied to *your* income — only half-lands, even though the plumbing (`Calculator.onChange` broadcast, `__irsSwitchTab(tab, anchor)`) mostly exists.

## Requirements

1. Keep the last calculator snapshot in module state (already broadcast via `Calculator.onChange`; coordinate with SPEC-004's `lastSnapshot`).
2. Secção 05's SlicedIncome gains a toggle: "Exemplo (15 650 €)" / "O meu rendimento coletável" — the second option enabled only when a snapshot exists.
3. Secção 02's BracketBar highlights the user's bracket when a snapshot exists, with a small "o teu escalão" marker.
4. In the calculator output, make line numbers links that jump to the corresponding row of Secção 07's StepTable via the existing cross-tab plumbing (with focus management per SPEC-013).
5. Graceful empty state: with no snapshot, sections behave exactly as today.

## Acceptance criteria

- [ ] After one calculation, Secção 05 can slice the user's own coletável and Secção 02 marks their bracket.
- [ ] Clicking line "10" in the output lands on (and focuses) that line's explanation in Secção 07.
- [ ] No behaviour change for users who never touch the calculator.

## Touched areas

`src/ui/sections/Seccao02_Escaloes.ts`, `Seccao05_Fatias.ts`, `Seccao07_NotaLiquidacao.ts`, `src/ui/components/SlicedIncome.ts`, `BracketBar.ts`, `Calculator.ts`, `src/main.ts`
