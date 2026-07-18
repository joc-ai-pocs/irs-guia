# SPEC-025 — Go-to-market: naming/domain decision, privacy-first analytics, seasonal capture, launch kit

- **Priority**: P2 · **Effort**: M · **Origin**: Marketing · **Status**: Proposed — requires an explicit product decision first

## Problem

Everything here is conditional on one unresolved decision the BRIEFING leaves open: **personal tool or public product?** If public:

1. **Naming.** "irs-guia" on `*.github.io/irs-guia/` is a repo slug, not a brand — unmemorable, unpronounceable in conversation, and "guia IRS" as a generic term is contested by Doutor Finanças, DECO, and every bank's content marketing. Hard to change after links accumulate.
2. **Measurement.** No analytics of any kind: no way to know if the Calculadora tab is even found. No retention hook: every seasonal visitor is re-acquired from scratch next year, for a product whose usage recurs annually by law.
3. **Distribution.** Nothing is prepared for the channels where this would land: no screenshots, no GIF, no one-paragraph pitch; the README is architecture documentation. The two annual traffic moments (Apr–Jun delivery season; October OE announcement, when "novos escalões IRS" searches spike) are unowned — despite the config-diff between year files being machine-computable.

## Requirements

1. **Decision gate**: explicitly choose personal / public. Everything below applies only to "public".
2. Register a .pt domain before links accumulate; test 2–3 name candidates carrying the differentiator (the fatias/transparency angle — e.g. "IRS por dentro", "IRS às fatias"); set the custom domain on Pages; keep "simulador IRS" / "escalões IRS" as page-level SEO terms, not the brand.
3. Privacy-first analytics (Plausible or GoatCounter — no cookie banner needed, consistent with the sober ethos): track tab switches, calculator use, year switches, save/share events.
4. One email-capture hook with a concrete seasonal promise ("Avisa-me quando a tabela 2026 estiver verificada / quando abrir a entrega").
5. "O que muda em {ano}" page auto-generated from the year-over-year `TaxYearConfig` diff, published when the OE proposal drops (October).
6. Launch kit: 3 screenshots (fatias, três métodos, nota de liquidação), a 20s calculator GIF, channel-specific posts (r/literaciafinanceira — educational/sources angle; r/devpt — architecture angle), timed to early April.

## Acceptance criteria

- [ ] The personal-vs-public decision is recorded (here or in BRIEFING.md) with its consequences.
- [ ] If public: domain live, analytics answering "do visitors find the calculator?", capture live, and the launch kit exists in the repo (`docs/launch/`).

## Touched areas

Repo docs, `index.html`, `public/`, new `docs/launch/`, `scripts/` (config-diff page generator)
