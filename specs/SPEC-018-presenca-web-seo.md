# SPEC-018 — Presença web: conteúdo pré-renderizado, head kit, fontes self-hosted

- **Prioridade**: P1 (P0 se publicado publicamente) · **Esforço**: L · **Origem**: Marketing, Arquiteto de Software · **Estado**: Proposto

## Problema

O produto entrega-se como um `<div id="app">` vazio hidratado por `main.ts`; todo o conteúdo pedagógico é compilado no cliente a partir de `src/content/*.md`, e só o tab ativo está no DOM. Para as pesquisas que importam ("escalões IRS 2025", "como se calcula o IRS"), os crawlers veem uma página em branco intitulada "IRS Guia · Pedagógico". O `index.html` tem `lang="pt-PT"` e theme-color mas nenhuma meta description, nenhuma tag Open Graph/Twitter, nenhum canonical; `public/` está vazio — sem favicon, `robots.txt`, `sitemap.xml` ou imagem OG. Um link partilhado no WhatsApp (o canal de partilha dominante em PT) aparece como um URL cinzento nu. A tipografia depende ainda do Google Fonts em runtime: pedidos a terceiros numa página que lida com valores financeiros, latência que bloqueia o render, e fontes de fallback offline.

## Requisitos

1. **Pré-render**: passo de build (script vite-node ou plugin SSG) que renderiza as secções do Guia/Resumo para HTML estático em `dist/` — um URL indexável por secção e por ano (ex.: `/2025/escaloes/`) — com a SPA a hidratar por cima. As secções já são funções puras de `TaxYearConfig`, portanto é viável sem re-arquitetura. Coordenar o esquema de URLs com a SPEC-015.
2. **Head kit**: meta description pt-PT (~150 carateres), tags Open Graph + Twitter card, canonical, conjunto de favicons, `robots.txt`, `sitemap.xml` (gerado a partir das rotas pré-renderizadas), e uma imagem OG 1200×630 reutilizando a identidade editorial (título Fraunces + o visual da BracketBar sobre a paleta papel/tijolo).
3. **Fontes**: self-host de Fraunces, Inter e JetBrains Mono como WOFF2 em `public/fonts/` com `@font-face` + `font-display: swap`; remover os links e preconnects do Google Fonts.

## Critérios de aceitação

- [ ] Um `curl` a um URL de secção devolve o HTML pedagógico completo, sem JS.
- [ ] Um link colado no WhatsApp/Slack mostra título, descrição e imagem com marca.
- [ ] Zero pedidos a terceiros no carregamento da página.
- [ ] Lighthouse SEO ≥ 95; a hidratação não produz flash de conteúdo duplicado.

## Áreas afetadas

`index.html`, `public/`, `scripts/` (novo script de pré-render), `vite.config.ts`, `src/styles/base.css`, `src/ui/sections/`
