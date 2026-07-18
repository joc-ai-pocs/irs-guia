# Specs — irs-guia

Specs de produto/engenharia agregadas de uma revisão a quatro personas (2026-07-18): **arquiteto de software sénior** (conservador, robustez primeiro), **product owner sénior**, **UX designer sénior** e **marketing/growth**. As conclusões sobrepostas foram fundidas; cada spec lista as personas de origem. Prioridades: P0 = correção, perda de dados ou lacunas bloqueantes; P1 = alto valor a seguir; P2 = valioso, mais tarde. Compatível com a convenção do repo de uma feature por sessão (ver BRIEFING.md).

## Índice

| ID | Spec | Prioridade | Esforço | Origem |
|----|------|------------|---------|--------|
| [SPEC-001](SPEC-001-dependentes.md) | Dependentes no modelo do agregado | P0 | M | PO, Mkt |
| [SPEC-002](SPEC-002-tributacao-conjunta-dois-declarantes.md) | Tributação conjunta com dois declarantes + conjunta vs. separada | P0 | L | PO, UX |
| [SPEC-003](SPEC-003-deducoes-coleta-itemizadas.md) | Deduções à coleta itemizadas | P0 | M | PO |
| [SPEC-004](SPEC-004-preservar-estado-na-troca-de-ano.md) | Preservar o estado da calculadora na troca de ano | P0 | S | UX, Arq |
| [SPEC-005](SPEC-005-inputs-pt-pt-validacao.md) | Inputs numéricos pt-PT com validação a sério | P0 | M | UX, Arq |
| [SPEC-006](SPEC-006-persistencia-universal.md) | Persistência universal + exportar/importar JSON | P0 | M | Arq, PO, Mkt |
| [SPEC-007](SPEC-007-fluxo-guardar-exercicios.md) | Revisão do fluxo de guardar/carregar (colisões, diálogos inline) | P0 | M | Arq, UX |
| [SPEC-008](SPEC-008-motor-clamp-e-arredondamento.md) | Correção do motor: piso da coleta líquida + arredondamento | P0 | S | Arq |
| [SPEC-009](SPEC-009-invariantes-tax-data.md) | Suite de invariantes do tax-data | P1 | S | Arq |
| [SPEC-010](SPEC-010-integridade-exercicios.md) | Integridade dos exercícios (ano divergente, validação) | P1 | S | PO, Arq |
| [SPEC-011](SPEC-011-perfis-e-ano-sobre-ano.md) | Perfis do agregado + transporte ano-sobre-ano | P1 | M | PO |
| [SPEC-012](SPEC-012-anexo-b-regime-simplificado.md) | Cat. B regime simplificado (recibos verdes) | P1 | L | PO, Mkt |
| [SPEC-013](SPEC-013-acessibilidade.md) | Conclusão da acessibilidade (tabs, BracketBar, contraste) | P1 | M | Arq, UX |
| [SPEC-014](SPEC-014-mobile-feedback.md) | Ciclo de feedback em mobile (resultado sticky, BracketBar) | P1 | M | UX |
| [SPEC-015](SPEC-015-url-partilhavel.md) | Estado partilhável no URL e deep links | P1 | M | Mkt, UX |
| [SPEC-016](SPEC-016-ano-provisorio-e-epoca.md) | Propagação do ano provisório + consciência da época | P1 | S | Arq, PO |
| [SPEC-017](SPEC-017-confianca-e-defaults.md) | Superfície de confiança + valores de exemplo neutros | P1 | S | Mkt, PO, UX |
| [SPEC-018](SPEC-018-presenca-web-seo.md) | Presença web: pré-render, head kit, fontes self-hosted | P1* | L | Mkt, Arq |
| [SPEC-019](SPEC-019-ci-e-deploy.md) | Higiene de CI e deploy | P1 | S | Arq |
| [SPEC-020](SPEC-020-pedagogia-personalizada.md) | Pedagogia personalizada (números do utilizador no guia) | P2 | M | UX |
| [SPEC-021](SPEC-021-guia-preenchimento-modelo3.md) | Companheiro de preenchimento do Modelo 3 | P2 | M | PO |
| [SPEC-022](SPEC-022-refresh-conteudo-microcopy.md) | Refresh de conteúdo e microcopy | P2 | S | PO, UX |
| [SPEC-023](SPEC-023-estimador-retencao.md) | Estimador de retenção (modo mensal) | P2 | L | PO |
| [SPEC-024](SPEC-024-hero-conversao.md) | Conversão no Hero: CTA + diferenciação | P2* | S | Mkt |
| [SPEC-025](SPEC-025-go-to-market.md) | Go-to-market: nome, analytics, captura, kit de lançamento | P2 | M | Mkt |

\* Sobe de prioridade se o projeto for publicado publicamente (portão de decisão na SPEC-025).

## Sequenciação sugerida

1. **Estancar a sangria (pequeno, alta confiança)**: SPEC-004, 008, 007, 010, 016, 019 — perda de dados, euros errados, substituições silenciosas.
2. **Cobertura fiscal (o núcleo do produto)**: SPEC-001 → 003 → 002, depois 012.
3. **Chegar à audiência**: SPEC-005, 006, 013, 014 (utilizável por todos), depois 015, 017, 018, 024 (partilhável e de confiança).
4. **O fluxo anual e o requinte**: SPEC-011, 021, 020, 022, 023, 025.

## Dependências a conhecer

- A SPEC-002 e a SPEC-011 fazem ambas bump ao schema de `Exercicio` — coordenar para evitar duas migrações consecutivas.
- A SPEC-001 e a SPEC-003 partilham o passo das deduções à coleta e o teto global do art. 78.º n.º 7.
- O esquema de URLs da SPEC-015 deve fechar antes das rotas pré-renderizadas da SPEC-018.
- O snapshot de estado da SPEC-004 é o mesmo plumbing que a SPEC-020 consome.
