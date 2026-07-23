# SPEC-010 — Integridade dos exercícios: ano divergente no carregamento + validação real dos ficheiros

- **Prioridade**: P1 · **Esforço**: S · **Origem**: Product Owner, Arquiteto de Software · **Estado**: Proposto

## Problema

1. **Ano divergente.** `ExerciciosPanel.load()` chama `calculator.setInputs(ex.inputs)` sem comparar `ex.ano` com o ano selecionado na app. Carregar um exercício de 2024 com 2025 selecionado recalcula silenciosamente com os escalões de 2025 — contradizendo o `snapshotResultado` guardado, sem aviso. Clicar depois em "Atualizar" reescreve o ficheiro re-estampado com `ano: 2025`, corrompendo o registo histórico.
2. **Validação superficial.** `migrateExercicio` (`src/state/types.ts`) só verifica que `inputs` é um objeto. Um ficheiro editado à mão com `"rendimentoTrabalho": "13k"` passa; `setInputs` escreve a string num input numérico, o browser esvazia-o, `getInputs` coage para 0 — um cálculo plausível mas errado, sem erro nenhum.
3. **Zero testes.** As funções puras de `state/types.ts` (`migrateExercicio`, `slugify`, `buildSnapshot`) não têm testes; a config de cobertura só inclui `src/engine/**`.

## Solução proposta

Respeitar o ano fiscal de cada exercício no carregamento; validar a forma numérica do que é carregado; testar as funções puras da camada de estado.

## Requisitos

1. No carregamento, se `ex.ano !== ano selecionado`: mudar o ano da app para `ex.ano` (preferido — o seletor de ano já re-renderiza programaticamente), ou mostrar um aviso inline "Exercício de 2024 recalculado com a tabela de 2025" e desativar "Atualizar" até os anos coincidirem.
2. Estender `migrateExercicio` para verificar tipos dos campos numéricos conhecidos (finitos, ≥ 0), devolvendo o erro estruturado `ParseResult` existente — renderizado segundo o padrão de linha inválida da SPEC-007.
3. Adicionar `state/types.test.ts` cobrindo `migrateExercicio` (válido, tipos errados, negativos, versão de schema desconhecida), colisões de `slugify`, e `buildSnapshot`; incluir `src/state/**` na cobertura.

## Critérios de aceitação

- [ ] Carregar um exercício de outro ano nunca altera silenciosamente o resultado nem o ano guardado.
- [ ] Um ficheiro com `"rendimentoTrabalho": "13k"` é rejeitado com motivo claro, não zerado.
- [ ] `npm run test:run` exercita a camada de estado.

## Áreas afetadas

`src/ui/components/ExerciciosPanel.ts`, `src/state/types.ts`, `src/main.ts`, `vite.config.ts`
