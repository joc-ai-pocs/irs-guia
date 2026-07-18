# SPEC-017 — Trust surface: methodology, sources per line, neutral example defaults

- **Priority**: P1 · **Effort**: S · **Origin**: Marketing, Product Owner, UX Designer · **Status**: Proposed

## Problem

Two sides of one trust coin:

1. **The proof is invisible.** The genuinely persuasive evidence — engine verified against Lei 55-A/2025 and Lei 33/2024, 73 tests, a `casos/` harness reconciling against real AT settlement notes to the cent, every constant traceable to a `FonteOficial` URL — appears nowhere in the UI. Nor does authorship: in tax, "quem és tu para me explicar o IRS?" is the first objection. The Footer disclaimer and official-source links are good but incomplete.
2. **The defaults are the author's real data.** `Calculator.ts` ships pre-filled with a family member's actual settlement note (13 054,76 € / 1 436,05 € / 3 571,62 € / 307,97 € / 103 € — identical to the gitignored `exercicio-2025-mae.json`), with no marker that these are examples and no way to clear them. `resumo05.md`'s "Anexos a usar nos 4 IRS da família" leaks the same personal framing.

## Requirements

1. Replace defaults with neutral, rounded, obviously-synthetic values (e.g. 15 000 / 1 650 / 0), marked with a chip next to the Calculator header: "Valores de exemplo — substitui pelos teus".
2. Add a "Limpar valores" secondary action that zeroes all fields.
3. Add a "Sobre este guia" section (footer link): author, purpose, methodology — "cada constante tem fonte oficial; motor com testes automáticos; valores 2024–2025 verificados contra os diplomas" — last-verified date per year (already in `TaxYearConfig`), link to the repo.
4. Trust strip near the result: "Motor validado contra notas de liquidação reais · N testes", linking to the methodology.
5. Add per-line `fontes` links (art. 25.º, 68.º, 70.º, 72.º, 78.º) to the corresponding output rows, using `requireFonte`.
6. Reword `resumo05.md` to audience-neutral framing ("Anexos por perfil de contribuinte").

## Acceptance criteria

- [ ] No personal financial figures remain in committed source.
- [ ] A first-time visitor can answer "who made this and why should I trust the numbers" in two clicks.
- [ ] Each major output line links to its legal basis.

## Touched areas

`src/ui/components/Calculator.ts`, `Footer.ts`, `src/ui/sections/`, `src/content/resumo05.md`, `src/tax-data/index.ts`
