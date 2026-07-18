# SPEC-015 — Shareable URL state: tab, section, and encoded calculation deep links

- **Priority**: P1 · **Effort**: M · **Origin**: Marketing, UX Designer · **Status**: Proposed

## Problem

`main.ts` persists only `?ano=` in the URL. The active tab lives in a class name (refresh while in Calculadora returns to Guia); section anchors exist (`Section.ts` gives stable ids) but are never reflected in the address bar; Calculator inputs aren't encoded anywhere. The TOC's "Calculadora interativa" entry is `href="#"` — middle-click gives a dead link. A user who just understood "afinal só pago 37% sobre a última fatia" cannot send that exact moment to anyone; a saved simulation can't be sent to the three other household members. Explorable explanations spread through deep links; this one has none.

## Requirements

1. Mirror the `?ano=` pattern: write `?tab=<id>` in `TabsNav.activate()` via `history.replaceState`; read at boot alongside `anoFromUrl()`.
2. Reflect the active guide section as `#<section-id>` on scroll/TOC navigation; restore scroll position on load.
3. Give TOC/cross-tab links real hrefs (`?tab=calculadora`, `#seccao-05`) with JS interception as progressive enhancement — middle-click must work.
4. Compact-encode `LiquidacaoInput` in a query param (it is a small typed object — e.g. base64url of a versioned minimal JSON): loading a URL with it pre-fills the Calculator and computes.
5. "Copiar ligação a este cálculo" button next to the result: `navigator.share` when available, clipboard fallback, with a confirmation state.
6. Browser back/forward reflect tab changes (`popstate` handling).

## Acceptance criteria

- [ ] Refresh in any tab restores that tab, year, and (if present) the encoded calculation.
- [ ] A pasted calculation link on another machine reproduces the exact result.
- [ ] Old URLs (`?ano=` only) keep working; the input-encoding param is versioned for future schema changes.

## Touched areas

`src/main.ts`, `src/ui/components/TabsNav.ts`, `src/ui/components/TableOfContents.ts`, `src/ui/components/Calculator.ts`, `src/ui/sections/TabGuia.ts`
