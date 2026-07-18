# SPEC-003 — Itemized deduções à coleta (consume the table that already exists)

- **Priority**: P0 · **Effort**: M · **Origin**: Product Owner · **Status**: Proposed

## Problem

`TaxYearConfig.deducoesColeta` is a fully sourced table (saúde 15%/€1 000, educação 30%/€800, gerais 35%/€250, rendas, PPR tiers — each with a `fonteId`), yet no engine or UI code consumes it. The Calculator collapses everything into one lump-sum euro field ("Saúde, educação, e-fatura — apuradas pela AT"). At IRS time users have e-fatura category totals, not the final credit — they cannot produce that lump sum themselves. The global sliding cap (art. 78.º n.º 7 CIRS) is also unmodelled, so even a correct lump sum can overstate deductions at higher incomes.

## Proposed solution

An engine function that turns per-category expenses into the legal credit, plus itemized inputs, keeping the lump sum as an advanced override.

## Requirements

1. New engine function `calcularDeducoesColeta(despesas, config)` applying each category's percentage + ceiling from the existing `deducoesColeta` table.
2. Implement the global sliding cap of art. 78.º n.º 7 (income-dependent ceiling on total deductions), with its constants added to `TaxYearConfig` + `fontes`.
3. Calculator: replace the single field with per-category inputs (saúde, educação, rendas, despesas gerais, PPR), grouped with progressive disclosure; keep "Valor apurado pela AT (avançado)" as an override that bypasses the itemized calculation.
4. Render the per-category breakdown (spent → rate → cap → credit) with the expandable `FormulaBlock` pattern already used for the specific deduction.
5. Dependent deductions (SPEC-001) flow through the same step and the same global cap.

## Acceptance criteria

- [ ] Entering €2 000 saúde yields a €300 credit (15%, under the €1 000 cap) visibly derived in the UI.
- [ ] A high-income scenario shows the global cap binding, with a note explaining it.
- [ ] The lump-sum override reproduces today's behaviour exactly.
- [ ] All rates/caps come from `tax-data/` (no constants in engine/UI); tests cover each category cap and the global cap.

## Touched areas

`src/engine/` (new module), `src/tax-data/types.ts`, `src/tax-data/*.ts`, `src/ui/components/Calculator.ts`, `src/ui/components/FormulaBlock.ts`
