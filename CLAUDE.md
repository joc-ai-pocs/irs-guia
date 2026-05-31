# irs-guia

Guia pedagógico interativo do IRS português. Vanilla TypeScript + Vite, sem framework.

## Comandos

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm test` — Vitest watch mode
- `npm run test:run` — single run, CI-style
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — production build to `dist/`

## Arquitetura — LER ANTES DE EDITAR

Três camadas com **regra inviolável**: a UI nunca contém constantes fiscais nem fórmulas. Toda a aritmética vive no engine; todas as constantes vivem em `tax-data/`.

```
tax-data/   →  configuração fiscal por ano (escalões, IAS, deduções)
engine/     →  funções puras, sem DOM (cálculos)
ui/         →  componentes vanilla TS + CSS irmão (apresentação)
```

- `src/tax-data/` — adicionar novo ano: criar `<ano>.ts` satisfazendo `TaxYearConfig`, registar em `index.ts`.
- `src/engine/` — funções puras. Testes vitest ao lado (`*.test.ts`). NÃO escrever testes de UI.
- `src/ui/` — componentes em `src/ui/components/<Nome>.{ts,css}`. Usar helpers de `dom.ts` (`h`, `fragment`, `mount`). Apenas variáveis CSS de `tokens.css` — nenhum hex literal.

## Convenções

- TypeScript em strict máximo: `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`. Não relaxar.
- Tipos explícitos na API pública de cada módulo.
- `requireFonte(config, id)` é a forma canónica de aceder a fontes oficiais — devolve `FonteOficial` não-nullable.
- Path alias `@/*` aponta para `src/*`.
- Componentes exportados via barrel em `src/ui/components/index.ts`.
- Formatação de valores: usar `formatEUR` / `formatPercent` de `@/ui/format` (pt-PT).

## Workflow

- **Mudança de código existente** → editar diretamente aqui.
- **Componente visual novo com exploração** → primeiro Artifact no claude.ai (estética/variantes), depois trazer para o repo.
- Antes de implementar feature, ler ficheiros tocados e correr `npm test` + `npm run typecheck` para confirmar estado verde.
- Pequenos commits por unidade de mudança (uma feature, um fix). Mensagens em imperativo, inglês.

## Estado atual

- ✅ Engine: `findEscalao`, métodos 2 e 3 do art. 68.º, pipeline completo `calcularLiquidacao` (cat. A/H, individual/conjunta).
- ✅ Testes vitest cobrindo casos canónicos (coletável 15 650 € → 2 413,84 €, etc.).
- ✅ 7 componentes pedagógicos (SectionHeader, Lede, SourceBox, FormulaBlock, Callout, StepTable, MarginalNote).
- ✅ Demo end-to-end em `src/main.ts`.
- ✅ Tax data 2025 (Lei 55-A/2025) verificada.
- ⚠️ Tax data 2026 (Lei 73-A/2025) é stub — verificar todos os valores contra Portal das Finanças antes de uso real.
- ❌ Componentes interativos: `BracketBar`, `Calculator`, `SlicedIncome`.
- ❌ Componentes de meta-navegação: `TabsNav`, `TableOfContents`, `ResumoCard`, `ResourceCard`.
- ❌ Engine: Categoria F (rendas), Anexo D (transparência fiscal), dependentes.
- ❌ Persistência dos 4 perfis (Mãe, Padrasto, Namorada, Zé) em localStorage.

## Histórico

Scaffold criado em sessão Claude.ai (Artifacts) — ver `BRIEFING.md` para contexto completo das decisões.
