# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Guia pedagógico interativo do IRS português. Vanilla TypeScript + Vite, sem framework.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm test` — Vitest watch mode
- `npm run test:run` — single run, CI-style
- `npm run test:run -- src/engine/coleta.test.ts` — run a single test file
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — production build to `dist/` (runs typecheck first)
- `npm run test:ui` — Vitest UI dashboard

## Architecture — READ BEFORE EDITING

Layered design with an **inviolable rule**: UI never contains tax constants or formulas. All arithmetic lives in engine; all constants live in `tax-data/`.

```
src/tax-data/   →  fiscal config per year (brackets, IAS, deductions, official sources)
src/engine/     →  pure functions, no DOM (calculations)
src/state/      →  persistence of saved exercícios (File System Access API, JSON, schema-versioned)
src/ui/         →  vanilla TS components + sibling CSS (presentation)
```

### tax-data

- Each year is a file (`2024.ts`, `2025.ts`, `2026.ts`) satisfying the `TaxYearConfig` interface, registered in `index.ts`. 2024 and 2025 are verified against official sources; 2026 is a stub (marked `provisorio`).
- `TaxYearConfig` is the contract between data and engine: brackets (`Escalao[]`), IAS, specific deduction, cat. F rates, minimum-existence reference, deductions to the collection, and `fontes` (indexed map of official source URLs).
- `requireFonte(config, id)` is the canonical way to access official sources — returns non-nullable `FonteOficial` (needed because of `noUncheckedIndexedAccess`).
- `getTaxYearConfig(year)` retrieves a year's config from the `TAX_YEARS` registry.

### engine

- Pure functions only, no DOM. Tests live alongside code (`*.test.ts`). Do NOT write UI tests. Barrel exports in `engine/index.ts`.
- **Pipeline**: `calcularLiquidacao(input, config)` → gross income → specific deduction → taxable income → bracket lookup → coleta → deductions → final tax. Covers cat. A/H/F plus cat. B imputed via Anexo D (transparência fiscal, art. 20.º), and individual/joint taxation (quociente 1 or 2).
- **Three coleta methods** (all equivalent up to cents of rounding, for pedagogical comparison): Method 3 (`calcularColetaMetodo3`) is canonical (single bracket, parcela a abater). Method 2 (`calcularColetaMetodo2`) slices income across all brackets. Method 1 (`calcularColetaMetodo1`) splits into previous-limit (taxa média) + excess (taxa normal).
- Other engine modules: `categoriaF.ts` (cat. F rents — art. 41.º deductions + art. 72.º autonomous rates), `minimoExistencia.ts` (art. 70.º abatement), `escaloes.ts` (`findEscalao`, specific deduction).

### state

- Persists saved *exercícios* (named snapshots of Calculator inputs + computed result) as one JSON file per exercício, via the File System Access API.
- `types.ts`: `Exercicio` shape, `EXERCICIO_SCHEMA_VERSION`, `migrateExercicio` (validation + future migrations), `buildSnapshot`, `slugify`.
- `fs-storage.ts` / `handle-store.ts`: directory-handle persistence and read/write. Wired into the UI via `ExerciciosPanel`.

### ui

- Components in `src/ui/components/<Name>.{ts,css}`. Each exports a function returning `HTMLElement`. Exported via barrel in `src/ui/components/index.ts`.
- Guide content lives in `src/ui/sections/`: 8 numbered sections (`Seccao01…08`) and the tab assemblies (`TabGuia`, `TabCalculadora`, `TabResumo`, `TabRecursos`).
- DOM helpers in `dom.ts`: `h(tag, attrs, ...children)`, `fragment(...)`, `mount(host, root)`, `html(trustedMarkup)`.
- Only CSS variables from `src/styles/tokens.css` — no hex literals.
- Formatting: use `formatEUR` / `formatPercent` from `@/ui/format` (pt-PT locale).

## Conventions

- TypeScript strict max: `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Do not relax.
- Explicit types on public API of each module.
- Path alias `@/*` → `src/*`.
- Commits: small, one per unit of change. Messages in imperative, English.
- Before implementing a feature, read touched files and run `npm test` + `npm run typecheck` to confirm green state.

## Current State

- **Engine**: covers cat. A/H, cat. F (rents), and cat. B imputed via Anexo D (transparência fiscal); individual and joint taxation (quociente 1 or 2); minimum-existence abatement; three coleta methods. 73 tests passing.
- **Tax data**: 2024 (Lei 33/2024 revised table) and 2025 (Lei 55-A/2025) verified against official sources. 2026 (Lei 73-A/2025) is a stub — verify against Portal das Finanças before real use.
- **UI**: full app in `main.ts` — Hero + YearSelector + 4 tabs (Guia / Calculadora / Resumo / Recursos), 8 guide sections, ~23 components including the interactive BracketBar, Calculator, SlicedIncome, TabsNav, TableOfContents, and ExerciciosPanel.
- **Persistence**: saved exercícios via File System Access API (`src/state/`), schema v1.
- **Not yet implemented / next**: dependents in the family quotient, more tax categories beyond A/H/F/B, verifying 2026.
- See `BRIEFING.md` for full context on design decisions (note: parts of it predate the current state).
