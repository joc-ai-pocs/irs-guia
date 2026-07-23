# SPEC-003 — Deduções à coleta itemizadas (consumir a tabela que já existe)

- **Prioridade**: P0 · **Esforço**: M · **Origem**: Product Owner · **Estado**: Proposto

## Problema

`TaxYearConfig.deducoesColeta` é uma tabela completa e com fontes (saúde 15%/1 000 €, educação 30%/800 €, gerais 35%/250 €, rendas, escalões de PPR — cada um com `fonteId`), mas nenhum código do motor ou da UI a consome. A Calculadora colapsa tudo num único campo de valor global ("Saúde, educação, e-fatura — apuradas pela AT"). Na época do IRS, os utilizadores têm os totais por categoria do e-fatura, não o crédito final — não conseguem produzir esse valor global sozinhos. O teto global degressivo (art. 78.º n.º 7 CIRS) também não está modelado, pelo que mesmo um valor global correto pode sobrestimar as deduções em rendimentos mais altos.

## Solução proposta

Uma função do motor que transforma despesas por categoria no crédito legal, mais inputs itemizados, mantendo o valor global como override avançado.

## Requisitos

1. Nova função do motor `calcularDeducoesColeta(despesas, config)` que aplica a percentagem + teto de cada categoria a partir da tabela `deducoesColeta` existente.
2. Implementar o teto global degressivo do art. 78.º n.º 7 (limite dependente do rendimento sobre o total das deduções), com as suas constantes adicionadas a `TaxYearConfig` + `fontes`.
3. Calculadora: substituir o campo único por inputs por categoria (saúde, educação, rendas, despesas gerais, PPR), agrupados com progressive disclosure; manter "Valor apurado pela AT (avançado)" como override que ignora o cálculo itemizado.
4. Apresentar a decomposição por categoria (despesa → taxa → teto → crédito) com o padrão expansível `FormulaBlock` já usado na dedução específica.
5. As deduções por dependente (SPEC-001) passam pelo mesmo passo e pelo mesmo teto global.

## Critérios de aceitação

- [ ] Introduzir 2 000 € de saúde produz um crédito de 300 € (15%, abaixo do teto de 1 000 €), com derivação visível na UI.
- [ ] Um cenário de rendimento alto mostra o teto global a atuar, com nota explicativa.
- [ ] O override de valor global reproduz exatamente o comportamento atual.
- [ ] Todas as taxas/tetos vêm de `tax-data/` (sem constantes no motor/UI); testes cobrem cada teto por categoria e o teto global.

## Áreas afetadas

`src/engine/` (novo módulo), `src/tax-data/types.ts`, `src/tax-data/*.ts`, `src/ui/components/Calculator.ts`, `src/ui/components/FormulaBlock.ts`
