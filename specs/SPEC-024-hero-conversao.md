# SPEC-024 — Hero conversion: outcome hook, primary CTA, differentiation block

- **Priority**: P2 (P1 if publishing publicly) · **Effort**: S · **Origin**: Marketing · **Status**: Proposed

## Problem

The Hero — eyebrow "Guia pedagógico · Rendimentos de 2025", title "Como se calcula o IRS, passo a passo.", meta row "Fonte / Tabela / IAS", badge "ART. 68.º CIRS" — is beautiful editorial framing for the curious, but a stressed taxpayer in April is asking "vou receber ou pagar, e quanto?". There is no above-the-fold CTA: the Calculadora is a tab the visitor must discover. And although the Recursos tab generously links the competition (Doutor Finanças, DECO, banks), no page articulates the actual differentiation: three coleta methods side-by-side, a nota de liquidação decoded line-by-line, the fatias visualization, per-constant official sourcing — "o único que te mostra *porquê*, não só *quanto*".

## Requirements

1. Keep the editorial title; add an outcome-led sub-hook and a primary CTA button ("Simula o teu IRS em 2 minutos →") that switches to the Calculadora tab (reuse `CtaButton` + the tab-switch plumbing; real href per SPEC-015).
2. Season-aware eyebrow (from SPEC-016): deadline countdown during Apr–Jun.
3. Add a compact "Porquê este guia?" block (Hero or top of Resumo): AT simulator = decisão final; este guia = perceber o cálculo; three bullets on the unique mechanics (três métodos, nota linha-a-linha, fontes em cada número).
4. Reuse that framing verbatim as the canonical pitch in README/launch materials (SPEC-025).

## Acceptance criteria

- [ ] A first-time visitor can reach a computed result in one click from the Hero.
- [ ] The differentiation block exists and states the positioning in ≤3 bullets.
- [ ] Editorial visual direction (paper/brick/ink, Fraunces) unchanged.

## Touched areas

`src/ui/components/Hero.ts/.css`, `CtaButton.ts`, `src/ui/sections/TabResumo.ts`, `src/main.ts`
