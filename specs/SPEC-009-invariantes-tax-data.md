# SPEC-009 — Tax-data invariant test suite (make the yearly update safe by construction)

- **Priority**: P1 · **Effort**: S · **Origin**: Software Architect · **Status**: Proposed

## Problem

The architecture exists so that adding `tax-data/2027.ts` is the only yearly change — yet `src/tax-data/index.test.ts` only validates `fontes` ids and registry ordering. Nothing asserts the internal consistency of an `Escalao[]` table. A single mistyped digit in a `parcelaAbater` transcribed from the 2027 law would ship wrong tax amounts with every current test green (casos pin only a handful of incomes for 2024/2025).

## Proposed solution

A parametrised test over `TAX_YEARS` asserting the mathematical invariants every valid bracket table must satisfy. One test file, no production code changes.

## Requirements

1. For every registered year, assert:
   - bracket limits strictly ascending; exactly one `POSITIVE_INFINITY`, in the last row;
   - all rates in (0, 1); taxas normais non-decreasing;
   - the continuity identity that makes método 3 correct: `parcelaAbater[n] ≈ parcelaAbater[n−1] + limiteSuperior[n−1] × (taxaNormal[n] − taxaNormal[n−1])` (tolerance: cents);
   - `deducaoEspecificaMinima ≈ ias × deducaoEspecificaCoef` where both are defined.
2. Cross-method sweep per year: `calcularColetaMetodo2` vs `calcularColetaMetodo3` agree within a few cents at every bracket boundary ±1 € and a spread of interior points.
3. Provisional years (`provisorio: true`) run the same invariants (a stub must still be internally consistent).
4. Wire into the normal `npm test` run (it already picks up `src/tax-data/*.test.ts`).

## Acceptance criteria

- [ ] Corrupting one digit of any `parcelaAbater` in a scratch copy makes the suite fail with a message naming the year and bracket.
- [ ] Suite passes for 2024, 2025, 2026 as committed.

## Touched areas

`src/tax-data/index.test.ts` (or a new `invariants.test.ts`)
