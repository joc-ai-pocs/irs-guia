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

Three layers with an **inviolable rule**: UI never contains tax constants or formulas. All arithmetic lives in engine; all constants live in `tax-data/`.

```
src/tax-data/   →  fiscal config per year (brackets, IAS, deductions, official sources)
src/engine/     →  pure functions, no DOM (calculations)
src/ui/         →  vanilla TS components + sibling CSS (presentation)
```

### tax-data

- Each year is a file (`2025.ts`, `2026.ts`) satisfying the `TaxYearConfig` interface, registered in `index.ts`.
- `TaxYearConfig` is the contract between data and engine: brackets (`Escalao[]`), IAS, deductions, and `fontes` (indexed map of official source URLs).
- `requireFonte(config, id)` is the canonical way to access official sources — returns non-nullable `FonteOficial` (needed because of `noUncheckedIndexedAccess`).
- `getTaxYearConfig(year)` retrieves a year's config from the `TAX_YEARS` registry.

### engine

- Pure functions only, no DOM. Tests live alongside code (`*.test.ts`). Do NOT write UI tests.
- **Pipeline**: `calcularLiquidacao(input, config)` → gross income → specific deduction → taxable income → bracket lookup → coleta → deductions → final tax.
- **Two coleta methods**: Method 3 (`calcularColetaMetodo3`) is canonical (single bracket, parcela a abater). Method 2 (`calcularColetaMetodo2`) slices income across all brackets (for pedagogical visualization).
- `findEscalao(coletavel, escaloes)` locates the applicable bracket.

### ui

- Components in `src/ui/components/<Name>.{ts,css}`. Each exports a function returning `HTMLElement`.
- DOM helpers in `dom.ts`: `h(tag, attrs, ...children)`, `fragment(...)`, `mount(host, root)`, `html(trustedMarkup)`.
- Only CSS variables from `src/styles/tokens.css` — no hex literals.
- Formatting: use `formatEUR` / `formatPercent` from `@/ui/format` (pt-PT locale).
- Components exported via barrel in `src/ui/components/index.ts`.

## Conventions

- TypeScript strict max: `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Do not relax.
- Explicit types on public API of each module.
- Path alias `@/*` → `src/*`.
- Commits: small, one per unit of change. Messages in imperative, English.
- Before implementing a feature, read touched files and run `npm test` + `npm run typecheck` to confirm green state.

## Current State

- Engine covers Category A/H income, individual and joint taxation (quotient 1 or 2).
- Tax data 2025 (Lei 55-A/2025) verified. 2026 (Lei 73-A/2025) is a stub — verify against Portal das Finanças before real use.
- 7 pedagogical components built. `main.ts` is a demo (section 04 of the guide), not the final app.
- Not yet implemented: interactive components (BracketBar, Calculator, SlicedIncome), navigation (TabsNav, TOC), Category F, Anexo D, dependents, localStorage profiles.
- See `BRIEFING.md` for full context on design decisions.
