# irs-guia

Guia pedagógico interativo do IRS português — motor de cálculo separado de UI editorial, com configuração fiscal versionada por ano.

## Princípio arquitetural

Três camadas que mudam a ritmos diferentes:

```
┌─────────────────────────────────────────────────────────┐
│  TAX-DATA  (src/tax-data/)                                │
│  Configuração fiscal por ano: escalões, IAS, deduções.   │
│  Adicionar 2027? → criar 2027.ts, registrar no index.    │
├─────────────────────────────────────────────────────────┤
│  ENGINE  (src/engine/)                                    │
│  Funções puras, sem DOM. 100% testável.                   │
│  Calcula coleta, líquida, imposto apurado.                │
├─────────────────────────────────────────────────────────┤
│  UI  (src/ui/)                                            │
│  Vanilla TS + helpers de DOM tipados.                     │
│  Componentes consomem o motor — nunca reimplementam.     │
└─────────────────────────────────────────────────────────┘
```

A regra inviolável: a UI nunca contém uma constante fiscal nem uma fórmula. Tudo o que é "21,5%" ou "8,54 × IAS" vive na camada de dados; tudo o que é "como combinar esses números" vive no motor.

## Setup

```bash
npm install
npm run dev          # vite dev server, hot reload
npm test             # vitest watch mode
npm run test:run     # single run, CI-style
npm run typecheck    # tsc --noEmit
npm run build        # production build to dist/
```

## Estrutura

```
src/
├── tax-data/
│   ├── types.ts        # Escalao, TaxYearConfig, FonteOficial
│   ├── 2025.ts         # Lei 55-A/2025 (verified)
│   ├── 2026.ts         # Lei 73-A/2025 (stub, TO VERIFY)
│   └── index.ts        # TAX_YEARS registry, getTaxYearConfig()
│
├── engine/
│   ├── escaloes.ts     # findEscalao, calcularDeducaoEspecifica
│   ├── coleta.ts       # método 2 + método 3 do art. 68.º
│   ├── liquidacao.ts   # pipeline completo (linhas 01–25 da AT)
│   ├── *.test.ts       # cobertura crítica
│   └── index.ts        # barrel
│
├── ui/
│   ├── dom.ts          # h(), fragment(), mount() — micro DSL tipado
│   ├── format.ts       # formatEUR, formatPercent (pt-PT)
│   └── components/
│       ├── SectionHeader.{ts,css}
│       ├── Lede.{ts,css}
│       ├── SourceBox.{ts,css}
│       ├── FormulaBlock.{ts,css}
│       ├── Callout.{ts,css}
│       ├── StepTable.{ts,css}
│       ├── MarginalNote.{ts,css}
│       └── index.ts
│
├── styles/
│   ├── tokens.css      # design tokens (Direção A)
│   └── base.css        # reset + body + .page shell
│
└── main.ts             # entry point — demo da secção 04 do guia
```

## Como adicionar um novo ano fiscal

1. Criar `src/tax-data/2027.ts` satisfazendo `TaxYearConfig`.
2. Registrar no `src/tax-data/index.ts` adicionando ao `TAX_YEARS`.
3. Adicionar/atualizar testes em `src/engine/*.test.ts` se houver mudanças estruturais.

A UI continua a funcionar sem alterações — basta um seletor de ano que escolha entre as configurações disponíveis.

## Como adicionar um novo componente UI

1. Criar `src/ui/components/<Nome>.css` + `<Nome>.ts`.
2. O TS importa o CSS no topo (`import './<Nome>.css'`).
3. Exportar do `src/ui/components/index.ts`.
4. Apenas usar variáveis CSS do `tokens.css`, nunca cores hex literais.

## Notas

- `tsconfig.json` está em modo **strict** + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- Os testes do motor cobrem casos canónicos do guia pedagógico (coletável de 15 650 € → coleta ≈ 2 413,84 €, etc.). Não escrever testes de UI — não vale o ROI para este projeto.
- A configuração `2026.ts` é um stub. Validar todos os valores contra o Portal das Finanças antes de a usar para cálculos reais.
- `src/types/*.d.ts` contém *type shims* mínimos para `*.css` (side-effect imports do Vite) e `vitest`. São substituídos pelos types reais quando `npm install` correr; existem para o `tsc --noEmit` funcionar isoladamente.
- O helper `requireFonte(config, id)` em `@/tax-data` é a forma canónica de aceder a fontes oficiais — devolve `FonteOficial` em vez de `FonteOficial | undefined` (que o `noUncheckedIndexedAccess` força).

## Roadmap próximo

- [ ] Componentes interativos: `BracketBar`, `Calculator`, `SlicedIncome`
- [ ] Componentes de meta-navegação: `TabsNav`, `TableOfContents`, `ResumoCard`, `ResourceCard`
- [ ] Persistência dos 4 perfis (Perfil A, Perfil B, Perfil C, Perfil D) em localStorage
- [ ] Suporte a Cat. F (rendas) no motor
- [ ] Suporte a Anexo D (transparência fiscal) no motor
- [ ] Suporte a tributação conjunta com dependentes
