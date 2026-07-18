# SPEC-002 — Two-declarant joint taxation + conjunta vs. separada comparator

- **Priority**: P0 · **Effort**: L · **Origin**: Product Owner, UX Designer · **Status**: Proposed

## Problem

Joint taxation is simulated with a single `quocienteFamiliar` number input (`step: 0.5`, which allows the legally meaningless 1.5) and ONE set of cat. A fields. For a two-earner couple the engine computes one combined specific deduction — `min(total, max(4 462,15, combined contributions))` — when the law grants each sujeito passivo their own. A couple each earning ~€20k loses ~€4 462 of deduction in the simulation.

The single most valuable married-couple decision — tributação conjunta vs. separada — cannot be computed at all, even though the engine already demonstrates the what-if pattern with `englobamentoNota` for cat. F.

The form UX compounds it: the first field of the whole form asks for an engine constant ("quociente familiar, 1 ou 2") instead of a question a taxpayer understands.

## Proposed solution

Model Sujeito Passivo A and B separately; compute per-SP specific deductions; add a joint-vs-separate comparator; replace the quotient spinner with a segmented control.

## Requirements

1. Replace the `quocienteFamiliar` number input with a two-option segmented control styled like `YearSelector`: "Tributação individual" / "Tributação conjunta (casal)", mapped internally to 1/2. Keep the pedagogy in the hint ("isto é o quociente familiar do quadro 5 do Rosto").
2. When conjunta is selected, show Sujeito Passivo A / B input blocks, each with its own cat. A/H income + contributions.
3. Engine: compute the specific deduction per sujeito passivo, then sum, per art. 25.º CIRS.
4. Add a "Conjunta vs. separada" comparator note that runs both scenarios and shows the € delta, mirroring the `englobamentoNota` pattern in `liquidacao.ts`.
5. `Exercicio` snapshots capture both SP blocks (schema bump; see SPEC-011 for `migrateExercicio` coordination).

## Acceptance criteria

- [ ] A two-earner couple gets two specific deductions, not one.
- [ ] Entering 1.5 as a quotient is impossible via the UI.
- [ ] The comparator states which option is cheaper and by how much, in € (formatEUR).
- [ ] Engine tests cover: both SPs above the deduction floor, one below, and equivalence of individual mode with today's results (no regression).

## Touched areas

`src/engine/liquidacao.ts`, `src/engine/escaloes.ts`, `src/ui/components/Calculator.ts`, `src/state/types.ts`
