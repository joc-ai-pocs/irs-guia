# SPEC-008 — Engine correctness: coleta líquida floor + cent-rounding policy

- **Priority**: P0 · **Effort**: S · **Origin**: Software Architect · **Status**: Proposed

## Problem

Two engine-level correctness gaps that produce wrong euro figures:

1. **Negative coleta líquida.** `liquidacao.ts:384`: `coletaLiquida = coletaTotal - deducoesColeta - beneficioMunicipal` is not clamped at zero (unlike `baseBeneficioMunicipal`, which is). Under art. 78.º CIRS, deductions cannot exceed the collection. A low income (coleta ~€300) with €1 500 of health/education deductions — a plausible pensioner scenario — yields a negative coleta líquida flowing into a fictitious "a receber" amount. No test covers deduções > coleta.
2. **No rounding policy.** The engine carries raw IEEE floats end to end; `exercises/exercicio-2025-mae.json` shows `"coletaTotal": 1092.7476000000001` persisted on disk. The AT note rounds specific lines to cents. `formatEUR` hides the noise in the UI, but the `casos` reconciliation harness (tolerance €0.01) is one accumulated half-cent from flaky, and future snapshot-vs-recompute comparisons will hit spurious diffs.

## Proposed solution

Clamp at the legal floor with an explanatory note, and round at the documented settlement-note lines via a single helper.

## Requirements

1. `coletaLiquida = Math.max(0, …)`; when the clamp fires, emit a detail note (pattern exists: `abatimentoMinimoExistenciaDetalhe`) explaining that deductions à coleta cannot generate a refund by themselves (IRC/IRS retention refunds come from retenção, not negative coleta).
2. Introduce `roundCents()` in the engine; apply at the settlement-note lines: coleta, coleta total, coleta líquida, imposto apurado.
3. Apply the same rounding in `buildSnapshot` (`src/state/types.ts`) so persisted files carry clean cents.
4. Add a caso to `casos/cobertura.json` pinning the deduções > coleta behaviour; run `npm run casos` to confirm no regression on existing casos.
5. Document the rounding policy in a comment on `roundCents()` (which lines round, which stay raw).

## Acceptance criteria

- [ ] Coleta €300 + deduções €1 500 → coleta líquida €0, with a visible note; "a receber" reflects only retention.
- [ ] No persisted snapshot contains more than 2 decimal places at the rounded lines.
- [ ] All existing tests and casos pass unchanged (within the €0.01 tolerance).

## Touched areas

`src/engine/liquidacao.ts`, `src/state/types.ts`, `casos/cobertura.json`
