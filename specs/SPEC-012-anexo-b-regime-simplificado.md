# SPEC-012 — Cat. B regime simplificado (Anexo B — recibos verdes)

- **Priority**: P1 · **Effort**: L · **Origin**: Product Owner, Marketing · **Status**: Proposed

## Problem

Coverage is cat. A/H/F plus cat. B only via Anexo D transparência fiscal — a niche. Generic cat. B under the regime simplificado (Anexo B, art. 31.º CIRS coefficients: 0.75 services, 0.35 alojamento local, etc.) — Portugal's enormous freelancer/recibos-verdes population, the largest underserved and highest-search-volume segment — is explicitly not modelled (`liquidacao.ts` docstring). A freelancer opening the Calculator reads "not for me" within seconds. Notably, `2025.ts` already carries a `fontes.art31` entry, signalling intent.

## Proposed solution

Follow the extension pattern cat. F established: coefficients in `TaxYearConfig`, a dedicated engine module, an AnexosHeader card, and a Calculator group — plus a pedagogical section ("porque é que só 75% conta?").

## Requirements

1. `TaxYearConfig`: art. 31.º coefficient table (activity type → coefficient) with `fontes` entries, per year.
2. New engine module `categoriaB.ts`: gross × coefficient → englobed net, including the deduction-of-contributions adjustment (art. 31.º n.º 2 — SS contributions exceeding 10% of gross, where applicable) and the mandatory-minimum rules kept in scope notes if deferred.
3. `calcularLiquidacao` englobes the cat. B net alongside A/H/F; output detail shows the coefficient math.
4. UI: new AnexosHeader card "Anexo B · Trabalho independente"; Calculator group with activity-type select + gross income + contributions.
5. Guide: short section or callout explaining the coefficient logic, cross-linked from the Calculator hint.
6. Out of scope (explicit): contabilidade organizada (Anexo C), IVA interactions, retention on recibos verdes (see SPEC-023).

## Acceptance criteria

- [ ] A €30 000 services freelancer sees €22 500 englobed (0.75) with the derivation visible.
- [ ] All coefficients live in `tax-data/` with official sources.
- [ ] Engine tests cover at least services, alojamento local, and the contributions adjustment; casos added when a real Anexo B note is available.

## Touched areas

`src/engine/` (new `categoriaB.ts`), `src/engine/liquidacao.ts`, `src/tax-data/*.ts`, `src/ui/components/AnexosHeader.ts`, `src/ui/components/Calculator.ts`, `src/content/`
