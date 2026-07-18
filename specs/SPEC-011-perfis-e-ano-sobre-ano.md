# SPEC-011 — Household profiles + year-over-year roll-forward

- **Priority**: P1 · **Effort**: M · **Origin**: Product Owner · **Status**: Proposed

## Problem

The stated product goal is a reusable yearly tool for the household's 4 declarations (BRIEFING.md), but `Exercicio` (schema v1) is a flat file with a free-form `nome` — person identity lives only in naming conventions like `exercicio-2025-mae.json`. There is no grouping by person, no "same person, previous year" link, no roll-forward. Every fiscal year all 4 declarations are re-typed from scratch, and "mãe 2024 vs mãe 2025" cannot be compared.

## Proposed solution

Schema v2 with an optional `perfil` field, a grouped panel, and a one-click "Duplicar para {ano+1}" that recomputes under the new year and shows the delta.

## Requirements

1. Bump `EXERCICIO_SCHEMA_VERSION` to 2: add optional `perfil: string`. `migrateExercicio` upgrades v1 files (perfil absent) — this is the migration hook's first real use.
2. `ExerciciosPanel` groups the list by perfil (ungrouped section for files without one); the save flow (SPEC-007's inline form) gains an optional perfil field with datalist of known perfis.
3. "Duplicar para {ano+1}" action: copies inputs, restamps `ano`, recomputes with the target year's config (must exist and, ideally, not be `provisorio` — warn per SPEC-014), saves as a new exercício.
4. Year-over-year delta view when a perfil has exercícios in consecutive years: imposto apurado, escalão, taxa efetiva — computed from stored snapshots, displayed in the panel item meta.
5. Coordinate schema changes with SPEC-002 (two-declarant inputs) to avoid two consecutive schema bumps.

## Acceptance criteria

- [ ] v1 files load, display ungrouped, and re-save as v2 without data loss.
- [ ] Duplicating "mãe 2025" to 2026 produces a saved 2026 exercício with identical inputs and recomputed results.
- [ ] The panel shows a € and percentage-point delta between consecutive years of the same perfil.

## Touched areas

`src/state/types.ts`, `src/ui/components/ExerciciosPanel.ts`, `src/engine/` (reuse only)
