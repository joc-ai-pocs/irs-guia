# SPEC-016 — Provisional-year propagation + season awareness (and verify 2026)

- **Priority**: P1 · **Effort**: S · **Origin**: Software Architect, Product Owner · **Status**: Proposed

## Problem

`provisorio` is honoured in exactly two places: `defaultAno()` skips it and `YearSelector` shows an asterisk + one-line aviso. But select 2026 and open the Calculadora: the simulator renders a fully confident settlement note from placeholder brackets that `2026.ts` itself says not to use. `ExerciciosPanel.saveAs` happily persists an exercício stamped `ano: 2026` with no provisional marker — the caveat is lost the moment the data leaves the screen.

Meanwhile 2026 is the current fiscal year and remains a stub (brackets copied from 2025, IAS unconfirmed vs. Lei 73-A/2025), and the app has no season awareness: the Hero hard-codes "A declarar até 30/06" even after the deadline has passed.

## Requirements

1. When `config.provisorio`, render a persistent warning banner inside `TabCalculadora` and a badge in the Calculator header (the `badge` prop exists): "Tabela provisória — valores não verificados".
2. Saving an exercício for a provisional year either requires confirmation and stores `provisorio: true` (displayed in the list item meta), or is refused — pick one and document it.
3. Verify `src/tax-data/2026.ts` against Lei 73-A/2025 / Portal das Finanças (fontes already linked); remove `provisorio` when confirmed; SPEC-009's invariant suite must pass on the verified table.
4. Season banner derived from `config.anoDeclaracao` + current date: "Entrega decorre até 30/06/YYYY" during Apr–Jun, "Prazo terminou a 30/06/YYYY" after — replacing the hard-coded Hero eyebrow text.

## Acceptance criteria

- [ ] Selecting a provisional year shows the warning in the Calculadora tab itself, not only in the YearSelector.
- [ ] A saved provisional exercício is identifiable as such after reload.
- [ ] Hero deadline copy is correct in July without manual edits.

## Touched areas

`src/ui/sections/TabCalculadora.ts`, `src/ui/components/Calculator.ts`, `ExerciciosPanel.ts`, `Hero.ts`, `src/state/types.ts`, `src/tax-data/2026.ts`
