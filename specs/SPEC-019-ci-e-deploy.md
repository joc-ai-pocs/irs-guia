# SPEC-019 — Higiene de CI e deploy

- **Prioridade**: P1 · **Esforço**: S · **Origem**: Arquiteto de Software · **Estado**: Proposto

## Problema

`.github/workflows/deploy-pages.yml` ainda faz deploy em pushes para `feat/year-filter`, marcado como "Temporary… until it is merged" — esse branch foi integrado há muito (o seletor de ano está em `main.ts`). Um push acidental para o branch obsoleto reescreveria o site de produção com código antigo. Também não existe CI autónoma: testes/typecheck só correm dentro do job de deploy, pelo que os PRs (que o repo usa — ver merges `1a82fb1`, `b8dc845`) não têm verificações antes do merge. Alterações partidas do motor que cheguem a `main` acabam por se tornar números errados publicados.

## Requisitos

1. Remover o trigger `feat/year-filter` de `deploy-pages.yml`; deploy apenas a partir de `main`.
2. Adicionar `ci.yml` a correr em `pull_request` (e pushes para `main`): `npm ci && npm run test:run && npm run typecheck`.
3. Incluir `npm run casos` na CI — `scripts/casos.ts` já sai com código diferente de zero em falha, tornando a reconciliação com notas da AT uma barreira de merge.
4. Opcional: fazer o job de deploy depender das mesmas verificações em vez de as duplicar.

## Critérios de aceitação

- [ ] Push para qualquer branch que não `main` nunca faz deploy.
- [ ] Um PR com um teste do motor ou um caso a falhar mostra um check vermelho antes do merge.

## Áreas afetadas

`.github/workflows/deploy-pages.yml`, `.github/workflows/ci.yml` (novo)
