# SPEC-018 — Web presence: prerendered content, head kit, self-hosted fonts

- **Priority**: P1 (P0 if publishing publicly) · **Effort**: L · **Origin**: Marketing, Software Architect · **Status**: Proposed

## Problem

The product ships as an empty `<div id="app">` hydrated by `main.ts`; all pedagogical copy is compiled client-side from `src/content/*.md`, and only the active tab is in the DOM. For the queries that matter ("escalões IRS 2025", "como se calcula o IRS"), crawlers see a blank page titled "IRS Guia · Pedagógico". `index.html` has `lang="pt-PT"` and theme-color but no meta description, no Open Graph/Twitter tags, no canonical; `public/` is empty — no favicon, `robots.txt`, `sitemap.xml`, or OG image. A link shared on WhatsApp (the dominant PT sharing channel) renders as a bare grey URL. Typography additionally depends on Google Fonts at runtime: third-party requests on a page handling financial figures, render-blocking latency, and fallback fonts offline.

## Requirements

1. **Prerender**: build-time step (vite-node script or SSG plugin) rendering the Guia/Resumo sections to static HTML in `dist/` — one indexable URL per section and per year (e.g. `/2025/escaloes/`) — with the SPA hydrating on top. Sections are already pure functions of `TaxYearConfig`, so this is feasible without rearchitecting. Coordinate URL scheme with SPEC-015.
2. **Head kit**: pt-PT meta description (~150 chars), Open Graph + Twitter card tags, canonical, favicon set, `robots.txt`, `sitemap.xml` (generated from the prerendered routes), and a 1200×630 OG image reusing the editorial identity (Fraunces title + BracketBar visual on the paper/brick palette).
3. **Fonts**: self-host Fraunces, Inter, JetBrains Mono as WOFF2 in `public/fonts/` with `@font-face` + `font-display: swap`; remove the Google Fonts links and preconnects.

## Acceptance criteria

- [ ] `curl` of a section URL returns the full pedagogical HTML, no JS required.
- [ ] A link pasted into WhatsApp/Slack shows title, description, and branded image.
- [ ] Zero third-party requests on page load.
- [ ] Lighthouse SEO ≥ 95; hydration produces no duplicate content flash.

## Touched areas

`index.html`, `public/`, `scripts/` (new prerender script), `vite.config.ts`, `src/styles/base.css`, `src/ui/sections/`
