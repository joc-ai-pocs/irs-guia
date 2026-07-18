# SPEC-010 — Exercício data integrity: year mismatch on load + real file validation

- **Priority**: P1 · **Effort**: S · **Origin**: Product Owner, Software Architect · **Status**: Proposed

## Problem

1. **Year mismatch.** `ExerciciosPanel.load()` calls `calculator.setInputs(ex.inputs)` without comparing `ex.ano` to the app's selected year. Loading a 2024 exercício while 2025 is selected silently recomputes with 2025 brackets — contradicting the stored `snapshotResultado` with no warning. Clicking "Atualizar" then overwrites the file restamped `ano: 2025`, corrupting the historical record.
2. **Shallow validation.** `migrateExercicio` (`src/state/types.ts`) checks only that `inputs` is an object. A hand-edited file with `"rendimentoTrabalho": "13k"` passes; `setInputs` writes the string into a number input, the browser blanks it, `getInputs` coerces to 0 — a plausible-looking but wrong calculation with no error.
3. **Zero tests.** The pure functions in `state/types.ts` (`migrateExercicio`, `slugify`, `buildSnapshot`) have no tests; coverage config only includes `src/engine/**`.

## Proposed solution

Respect each exercício's fiscal year on load; validate the numeric shape of what's loaded; test the state layer's pure functions.

## Requirements

1. On load, if `ex.ano !== selected year`: switch the app's year to `ex.ano` (preferred — the year selector already re-renders programmatically), or show an inline warning "Exercício de 2024 recalculado com a tabela de 2025" and disable "Atualizar" until the years match.
2. Extend `migrateExercicio` to type-check known numeric fields (finite, ≥ 0), returning the existing structured `ParseResult` error on failure — rendered per SPEC-007's invalid-row pattern.
3. Add `state/types.test.ts` covering `migrateExercicio` (valid, wrong types, negative, unknown schema version), `slugify` collisions, and `buildSnapshot`; include `src/state/**` in coverage.

## Acceptance criteria

- [ ] Loading an old-year exercício never silently changes its result or its stored year.
- [ ] A file with `"rendimentoTrabalho": "13k"` is rejected with a clear reason, not zeroed.
- [ ] `npm run test:run` exercises the state layer.

## Touched areas

`src/ui/components/ExerciciosPanel.ts`, `src/state/types.ts`, `src/main.ts`, `vite.config.ts`
