# SPEC-021 — Modelo 3 filling companion ("o que escrevo onde")

- **Priority**: P2 · **Effort**: M · **Origin**: Product Owner · **Status**: Proposed

## Problem

Field hints already name quadros ("Anexo A, quadro 4 — códigos 4xx") and AnexosHeader mirrors the anexo structure — but at filing time the user still mentally maps their saved exercício back onto the Portal das Finanças form. There is no per-exercício checklist or printable view listing anexo/quadro/campo per input. TODO.md's "User journey survey para perceber anexos a preencher" points at exactly this unmet job: converting the simulator into a filing companion is the last mile of the household use case.

## Requirements

1. Extend `FieldSpec` with an explicit `modelo3` mapping (anexo, quadro, campo/código) — most of it already exists informally in hints.
2. New "Guia de preenchimento" view generated from an exercício's active groups: table of input → anexo → quadro/campo → value (formatEUR), plus the list of anexos to attach.
3. Reachable from the Calculator result and from each ExerciciosPanel item.
4. Print-friendly (`@media print` stylesheet) and exportable via the browser's print-to-PDF; no new dependencies.
5. Clearly scoped disclaimer: field codes verified against the current Modelo 3; unknown mappings shown as "verificar no portal" rather than guessed.

## Acceptance criteria

- [ ] For a saved exercício with cat. A + H + deductions, the view lists every value with its anexo/quadro/campo and which anexos to attach.
- [ ] Printing produces a clean one-to-two-page cheat-sheet per person.
- [ ] Fields without a verified mapping are explicitly flagged, never invented.

## Touched areas

`src/ui/components/Calculator.ts` (FieldSpec), new `src/ui/components/GuiaPreenchimento.{ts,css}`, `src/ui/components/ExerciciosPanel.ts`
