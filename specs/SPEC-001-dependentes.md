# SPEC-001 — Dependents in the household model

- **Priority**: P0 · **Effort**: M · **Origin**: Product Owner, Marketing · **Status**: Proposed

## Problem

The Rosto card in `TabCalculadora.ts` advertises "dependentes", but nothing models them: `LiquidacaoInput` has no dependents field, `TaxYearConfig` has no per-dependent deduction values, and the only family lever is `quocienteFamiliar` (1 or 2). Any household with children — most families, and the owner's own use case — gets a wrong (overstated) tax result with no warning.

Worse, `src/content/seccao08_callout_conjunta.md` states dependents "adicionam ao quociente em certas condições" — outdated law. The dependent family quotient was abolished in 2016; today dependents grant fixed deductions à coleta (art. 78.º n.º 1 + 78.º-A CIRS, ~€600 each with increments for children under 3 in households with 2+ children).

## Proposed solution

Model dependents as deductions à coleta, per current law, with values sourced per year in `tax-data/`.

## Requirements

1. Add `dependentes` to `LiquidacaoInput`: count, and optionally per-dependent age bands (under 3 / under 6 / other) to support the increments.
2. Add per-dependent fixed deduction values to `TaxYearConfig` for 2024/2025/2026, each with a `fontes` entry pointing at art. 78.º-A CIRS (use `requireFonte` pattern).
3. Apply the dependent deduction in the deduções-à-coleta step of `calcularLiquidacao`, visible as its own line in the output detail.
4. Add a numeric "Dependentes" input to the Rosto group in `Calculator.ts` (`min: 0`, integer).
5. Correct `seccao08_callout_conjunta.md`: dependents affect deductions à coleta, not the quotient.
6. Engine tests covering 0, 1, and 3 dependents, including interaction with the coleta-líquida floor (see SPEC-008).

## Acceptance criteria

- [ ] A single filer with 2 dependents sees the fixed deduction per dependent reflected in coleta líquida, with a labelled output row.
- [ ] All dependent constants live in `tax-data/`, none in engine or UI (inviolable rule).
- [ ] Guide content no longer claims dependents change the family quotient.
- [ ] `npm test` and `npm run typecheck` green; new casos added to `casos/cobertura.json`.

## Touched areas

`src/engine/liquidacao.ts`, `src/tax-data/*.ts`, `src/tax-data/types.ts`, `src/ui/components/Calculator.ts`, `src/content/seccao08_callout_conjunta.md`
