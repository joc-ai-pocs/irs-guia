# Specs — irs-guia

Product/engineering specs aggregated from a four-persona review (2026-07-18): **senior software architect** (conservative, robustness-first), **senior product owner**, **senior UX designer**, and **marketing/growth**. Overlapping findings were merged; each spec lists its origin personas. Priorities: P0 = correctness, data loss, or blocking gaps; P1 = high-value next; P2 = valuable, later. Fits the repo convention of one feature per session (see BRIEFING.md).

## Index

| ID | Spec | Priority | Effort | Origin |
|----|------|----------|--------|--------|
| [SPEC-001](SPEC-001-dependentes.md) | Dependents in the household model | P0 | M | PO, Mkt |
| [SPEC-002](SPEC-002-tributacao-conjunta-dois-declarantes.md) | Two-declarant joint taxation + conjunta vs. separada | P0 | L | PO, UX |
| [SPEC-003](SPEC-003-deducoes-coleta-itemizadas.md) | Itemized deduções à coleta | P0 | M | PO |
| [SPEC-004](SPEC-004-preservar-estado-na-troca-de-ano.md) | Preserve calculator state across year switches | P0 | S | UX, Arch |
| [SPEC-005](SPEC-005-inputs-pt-pt-validacao.md) | pt-PT number inputs with real validation | P0 | M | UX, Arch |
| [SPEC-006](SPEC-006-persistencia-universal.md) | Universal persistence + JSON export/import | P0 | M | Arch, PO, Mkt |
| [SPEC-007](SPEC-007-fluxo-guardar-exercicios.md) | Save/load flow overhaul (collision guard, inline dialogs) | P0 | M | Arch, UX |
| [SPEC-008](SPEC-008-motor-clamp-e-arredondamento.md) | Engine correctness: coleta líquida floor + rounding | P0 | S | Arch |
| [SPEC-009](SPEC-009-invariantes-tax-data.md) | Tax-data invariant test suite | P1 | S | Arch |
| [SPEC-010](SPEC-010-integridade-exercicios.md) | Exercício data integrity (year mismatch, validation) | P1 | S | PO, Arch |
| [SPEC-011](SPEC-011-perfis-e-ano-sobre-ano.md) | Household profiles + year-over-year roll-forward | P1 | M | PO |
| [SPEC-012](SPEC-012-anexo-b-regime-simplificado.md) | Cat. B regime simplificado (recibos verdes) | P1 | L | PO, Mkt |
| [SPEC-013](SPEC-013-acessibilidade.md) | Accessibility completion (tabs, BracketBar, contrast) | P1 | M | Arch, UX |
| [SPEC-014](SPEC-014-mobile-feedback.md) | Mobile feedback loop (sticky result, BracketBar) | P1 | M | UX |
| [SPEC-015](SPEC-015-url-partilhavel.md) | Shareable URL state & deep links | P1 | M | Mkt, UX |
| [SPEC-016](SPEC-016-ano-provisorio-e-epoca.md) | Provisional-year propagation + season awareness | P1 | S | Arch, PO |
| [SPEC-017](SPEC-017-confianca-e-defaults.md) | Trust surface + neutral example defaults | P1 | S | Mkt, PO, UX |
| [SPEC-018](SPEC-018-presenca-web-seo.md) | Web presence: prerender, head kit, self-hosted fonts | P1* | L | Mkt, Arch |
| [SPEC-019](SPEC-019-ci-e-deploy.md) | CI and deploy hygiene | P1 | S | Arch |
| [SPEC-020](SPEC-020-pedagogia-personalizada.md) | Guide personalization (user's numbers in pedagogy) | P2 | M | UX |
| [SPEC-021](SPEC-021-guia-preenchimento-modelo3.md) | Modelo 3 filling companion | P2 | M | PO |
| [SPEC-022](SPEC-022-refresh-conteudo-microcopy.md) | Content refresh & microcopy pass | P2 | S | PO, UX |
| [SPEC-023](SPEC-023-estimador-retencao.md) | Withholding estimator (monthly mode) | P2 | L | PO |
| [SPEC-024](SPEC-024-hero-conversao.md) | Hero conversion: CTA + differentiation | P2* | S | Mkt |
| [SPEC-025](SPEC-025-go-to-market.md) | Go-to-market: naming, analytics, capture, launch kit | P2 | M | Mkt |

\* Promotes to a higher priority if the project is published publicly (decision gate in SPEC-025).

## Suggested sequencing

1. **Stop the bleeding (small, high-trust)**: SPEC-004, 008, 007, 010, 016, 019 — data loss, wrong euros, silent overwrites.
2. **Fiscal coverage (the product core)**: SPEC-001 → 003 → 002, then 012.
3. **Reach the audience**: SPEC-005, 006, 013, 014 (usable by everyone), then 015, 017, 018, 024 (shareable and trusted).
4. **The yearly workflow & delight**: SPEC-011, 021, 020, 022, 023, 025.

## Dependencies worth knowing

- SPEC-002 and SPEC-011 both bump the `Exercicio` schema — coordinate to avoid two consecutive migrations.
- SPEC-001 and SPEC-003 share the deduções-à-coleta step and the art. 78.º n.º 7 global cap.
- SPEC-015's URL scheme should be settled before SPEC-018's prerendered routes.
- SPEC-004's state snapshot is the same plumbing SPEC-020 consumes.
