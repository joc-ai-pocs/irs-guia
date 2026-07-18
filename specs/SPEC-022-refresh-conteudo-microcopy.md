# SPEC-022 — Content refresh & microcopy pass: coverage matrix, audience framing, jargon

- **Priority**: P2 · **Effort**: S · **Origin**: Product Owner, UX Designer · **Status**: Proposed

## Problem

The guide content has drifted from the product on three axes:

1. **Stale coverage claims.** Secção 08 is titled "O que esta calculadora não cobre" yet its callouts describe cat. F, Anexo D and tributação conjunta — all of which the engine now covers. It under-sells the product and confuses readers about what to rely on. (The dependents error in `seccao08_callout_conjunta.md` is handled by SPEC-001.)
2. **Owner framing.** `tab_calculadora_intro.md` opens with "Os teus 4 IRS deste ano…" — second-person owner framing meaningless to any other reader. Same leak in `resumo05.md` (SPEC-017) and the Resumo tab hardcoding year references while the YearSelector promises year-filtered content (`TabResumo.ts` takes no config; "ESCALÕES 2025", `resumo06.md` deadlines).
3. **AT jargon and false affordances.** `AnexosHeader.ts` badges read "Conforme aplicável" / "Fora do âmbito" — administrative register a taxpayer won't parse; the locked "Rosto" `<div>` still gets the hover background, signalling clickability it doesn't have; BracketBar's nine equal-width segments visually imply equal bracket spans (the caption admits otherwise in 11px mono).

## Requirements

1. Rewrite Secção 08 as a coverage matrix derived from actual capability ("Coberto: A/H/F/D, conjunta, mínimo de existência · Não coberto: dependentes, Anexo B/E/G/J, IRS Jovem") — ideally generated from a single source of truth (a capabilities constant next to the engine) so it cannot drift again.
2. Audience pass over `src/content/`: remove owner-specific phrasing; neutral second person throughout.
3. Pass `config` into `TabResumo(config)`; interpolate `config.ano`/`anoDeclaracao` into card titles; template year-specific values from `tax-data` or stamp cards "Referente a rendimentos de YYYY" when they don't follow the selector.
4. Rewrite AnexosHeader badges in second person ("Preenche sempre" / "Só se tiveres" / "Ainda não coberto"); scope hover styles to `--toggleable` chips; drop redundant `title` attributes.
5. BracketBar: width proportional to bracket span with a min-width floor (keep equal widths only in the table), or an explicit visual break marker for the open-ended top bracket.

## Acceptance criteria

- [ ] Secção 08's claims match the engine's actual coverage, verified against `engine/index.ts` exports.
- [ ] Selecting 2024 leaves no visible "2025" claim that doesn't declare itself.
- [ ] No first-person-owner copy remains in `src/content/`.

## Touched areas

`src/content/*.md`, `src/ui/sections/TabResumo.ts`, `Seccao08_Avisos.ts`, `src/ui/components/AnexosHeader.ts/.css`, `BracketBar.ts/.css`
