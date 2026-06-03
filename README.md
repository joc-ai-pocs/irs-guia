# irs-guia

Guia pedagógico interativo do IRS português — motor de cálculo separado de UI editorial, com configuração fiscal versionada por ano.

## Princípio arquitetural

Camadas que mudam a ritmos diferentes:

```
┌─────────────────────────────────────────────────────────┐
│  TAX-DATA  (src/tax-data/)                                │
│  Configuração fiscal por ano: escalões, IAS, deduções.   │
│  Adicionar 2027? → criar 2027.ts, registrar no index.    │
├─────────────────────────────────────────────────────────┤
│  ENGINE  (src/engine/)                                    │
│  Funções puras, sem DOM. 100% testável.                   │
│  Coleta (3 métodos), líquida, cat. A/H/F/B, mínimo de    │
│  existência, tributação individual/conjunta.             │
├─────────────────────────────────────────────────────────┤
│  STATE  (src/state/)                                      │
│  Persistência de exercícios guardados (File System       │
│  Access API, JSON, schema versionado).                    │
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
│   ├── 2024.ts         # Lei 33/2024 (tabela revista, verified)
│   ├── 2025.ts         # Lei 55-A/2025 (verified)
│   ├── 2026.ts         # Lei 73-A/2025 (stub, TO VERIFY)
│   └── index.ts        # TAX_YEARS registry, getTaxYearConfig(), requireFonte()
│
├── engine/
│   ├── escaloes.ts        # findEscalao, calcularDeducaoEspecifica
│   ├── coleta.ts          # métodos 1, 2 e 3 do art. 68.º
│   ├── categoriaF.ts      # rendas: art. 41.º (deduções) + art. 72.º (taxas autónomas)
│   ├── minimoExistencia.ts# abatimento do art. 70.º
│   ├── liquidacao.ts      # pipeline completo (cat. A/H/F/B via Anexo D)
│   ├── *.test.ts          # cobertura crítica (73 testes)
│   └── index.ts           # barrel
│
├── state/
│   ├── types.ts        # Exercicio, schema versionado, migrateExercicio, slugify
│   ├── fs-storage.ts   # leitura/escrita via File System Access API
│   └── handle-store.ts # persistência do directory handle
│
├── ui/
│   ├── dom.ts          # h(), fragment(), mount() — micro DSL tipado
│   ├── format.ts       # formatEUR, formatPercent (pt-PT)
│   ├── sections/       # 8 secções (Seccao01–08) + tabs (Guia/Calculadora/Resumo/Recursos)
│   └── components/     # ~23 componentes (BracketBar, Calculator, SlicedIncome,
│                       #   TabsNav, TableOfContents, ExerciciosPanel, …) + index.ts barrel
│
├── styles/
│   ├── tokens.css      # design tokens (Direção A)
│   └── base.css        # reset + body + .page shell
│
└── main.ts             # entry point — app completa (Hero + YearSelector + 4 tabs + Footer)
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
- `2024.ts` (tabela revista pela Lei 33/2024) e `2025.ts` estão verificados contra fontes oficiais. `2026.ts` é um stub — validar todos os valores contra o Portal das Finanças antes de o usar para cálculos reais.
- `src/types/*.d.ts` contém *type shims* mínimos para `*.css` (side-effect imports do Vite) e `vitest`. São substituídos pelos types reais quando `npm install` correr; existem para o `tsc --noEmit` funcionar isoladamente.
- O helper `requireFonte(config, id)` em `@/tax-data` é a forma canónica de aceder a fontes oficiais — devolve `FonteOficial` em vez de `FonteOficial | undefined` (que o `noUncheckedIndexedAccess` força).

## Roadmap

Feito:

- [x] Componentes interativos: `BracketBar`, `Calculator`, `SlicedIncome`
- [x] Meta-navegação: `TabsNav`, `TableOfContents`, `ResumoCard`, tabs
- [x] Persistência de exercícios guardados (File System Access API, `src/state/`)
- [x] Cat. F (rendas) no motor
- [x] Anexo D (transparência fiscal — cat. B imputada) no motor
- [x] Tributação conjunta (quociente 1 ou 2)
- [x] Anos fiscais 2024 e 2025 verificados

Próximo:

- [ ] Dependentes no quociente familiar
- [ ] Mais categorias de rendimento além de A/H/F/D
- [ ] Verificar e fechar `2026.ts` contra o Portal das Finanças
