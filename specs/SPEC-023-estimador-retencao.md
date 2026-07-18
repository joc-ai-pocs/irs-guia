# SPEC-023 — Estimador de retenção: do salário mensal ao reembolso previsto

- **Prioridade**: P2 · **Esforço**: L · **Origem**: Product Owner · **Estado**: Proposto

## Problema

`retencaoFonte` é um total anual escrito à mão. Funciona em abril, quando o total da DMR é conhecido — mas nos outros dez meses a ferramenta não consegue responder à pergunta que as pessoas realmente fazem: "que reembolso vou ter?", porque os utilizadores não sabem a sua retenção anual projetada. O guia liga o artigo da CGD "escalões vs tabelas de retenção", reconhecendo o conceito sem o suportar. Resolver isto estende a utilidade do produto de uma época de 3 meses para o ano inteiro.

## Requisitos

1. Adicionar tabelas de retenção por ano a `tax-data/` (tabelas publicadas pela AT; encaixam no padrão existente de config por ano + `fontes`). Âmbito inicial: trabalho dependente, continente, as situações principais (não casado / casado único titular / casado dois titulares, com/sem dependentes).
2. Novo módulo do motor `retencao.ts`: bruto mensal + situação → retenção mensal → ×14 estimativa anual (tratamento dos subsídios documentado).
3. Calculadora: "modo mensal" opcional — salário mensal bruto + situação — que produz uma retenção anual estimada a pré-preencher `retencaoFonte` (o override manual ganha sempre).
4. Callout pedagógico: a retenção é um adiantamento, não o imposto — ligando a estimativa ao apuramento final que a app já calcula.
5. Aceitar conscientemente o custo de manutenção: as tabelas de retenção mudam mais vezes do que os escalões (documentar no cabeçalho de cada ficheiro de ano).

## Critérios de aceitação

- [ ] Introduzir 1 500 €/mês, não casado, 0 dependentes produz uma retenção anual plausível, coerente com a tabela publicada da AT para esse ano.
- [ ] A estimativa de reembolso atualiza em conformidade, e o campo anual manual continua a prevalecer.
- [ ] Todos os valores das tabelas vivem em `tax-data/` com fontes oficiais.

## Áreas afetadas

`src/tax-data/types.ts`, `src/tax-data/*.ts`, novo `src/engine/retencao.ts`, `src/ui/components/Calculator.ts`
