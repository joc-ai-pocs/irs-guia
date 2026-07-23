# SPEC-004 — Preservar o estado da calculadora na troca de ano

- **Prioridade**: P0 · **Esforço**: S · **Origem**: UX Designer, Arquiteto de Software · **Estado**: Proposto

## Problema

`renderApp()` em `src/main.ts` reconstrói toda a App a cada `YearSelector.onSelect`. O tab ativo sobrevive (via query ao DOM por `.tabs-nav__btn--active`), mas a Calculadora é recriada com os defaults hardcoded: todos os valores que o utilizador escreveu são destruídos, tal como o âmbito do AnexosHeader e o estado de expansão/ligação do ExerciciosPanel. Comparar o mesmo rendimento entre 2024/2025 é a razão mais óbvia para o YearSelector existir — e fazê-lo apaga o cenário que o utilizador acabou de construir, sem aviso e sem undo.

## Solução proposta

Capturar o estado da calculadora antes de re-renderizar e injetá-lo na árvore reconstruída. Sem framework — os handles já existem.

## Requisitos

1. Antes do re-render, capturar `calculator.getInputs()` (o handle existe) e o âmbito `VisibleGroups` atual.
2. Passá-los a `TabCalculadora(config, initialInputs)` → `Calculator({ initial })` — a prop `initial` já é suportada.
3. Preservar o estado expandido/ligado do ExerciciosPanel através da reconstrução.
4. Implementação alternativa aceite: `lastSnapshot` ao nível do módulo, alimentado pelo callback `Calculator.onChange` existente, usado como `initial` em cada render.
5. O recálculo após a troca usa a config do ano acabado de selecionar (essa parte já funciona).

## Critérios de aceitação

- [ ] Escrever valores próprios → trocar 2025 → 2024 → 2025: todos os inputs intactos, resultados recalculados por ano.
- [ ] A visibilidade de grupos do AnexosHeader sobrevive à troca.
- [ ] O ExerciciosPanel não colapsa nem se desliga na troca de ano.
- [ ] Sem regressão nos defaults do primeiro carregamento.

## Áreas afetadas

`src/main.ts`, `src/ui/sections/TabCalculadora.ts`, `src/ui/components/Calculator.ts`, `src/ui/components/ExerciciosPanel.ts`
