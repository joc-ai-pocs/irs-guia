# SPEC-023 — Withholding estimator: from monthly salary to projected refund

- **Priority**: P2 · **Effort**: L · **Origin**: Product Owner · **Status**: Proposed

## Problem

`retencaoFonte` is a manually typed annual total. That works in April, when the DMR total is known — but for the other ten months the tool cannot answer the question people actually ask: "que reembolso vou ter?", because users don't know their projected annual withholding. The guide links CGD's "escalões vs tabelas de retenção" article, acknowledging the concept without supporting it. Solving this extends the product's usefulness from a 3-month season to year-round.

## Requirements

1. Add per-year retention tables to `tax-data/` (published AT tables; they fit the existing per-year config + `fontes` pattern). Scope initially to trabalho dependente, continente, the main situações (não casado / casado único titular / casado dois titulares, with/without dependents).
2. New engine module `retencao.ts`: monthly gross + situação → monthly withholding → ×14 annual estimate (subsídios handling documented).
3. Calculator: optional "modo mensal" — salário mensal bruto + situação — producing an estimated annual withholding that pre-fills `retencaoFonte` (editable override always wins).
4. Pedagogical callout: retention is an advance, not the tax — linking the estimate to the final apuramento the app already computes.
5. Accept the maintenance cost consciously: retention tables change more often than brackets (document this in the spec header of each year file).

## Acceptance criteria

- [ ] Entering €1 500/month, não casado, 0 dependentes yields a plausible annual retention matching the published AT table for that year.
- [ ] The refund estimate updates accordingly, and the manual annual field still overrides.
- [ ] All table values live in `tax-data/` with official sources.

## Touched areas

`src/tax-data/types.ts`, `src/tax-data/*.ts`, new `src/engine/retencao.ts`, `src/ui/components/Calculator.ts`
