# SPEC-012 — Cat. B regime simplificado (Anexo B — recibos verdes)

- **Prioridade**: P1 · **Esforço**: L · **Origem**: Product Owner, Marketing · **Estado**: Proposto

## Problema

A cobertura é cat. A/H/F mais cat. B apenas via Anexo D transparência fiscal — um nicho. A cat. B genérica em regime simplificado (Anexo B, coeficientes do art. 31.º CIRS: 0,75 serviços, 0,35 alojamento local, etc.) — a enorme população de freelancers/recibos verdes, o maior segmento por servir e com maior volume de pesquisa — está explicitamente por modelar (docstring de `liquidacao.ts`). Um freelancer que abra a Calculadora lê "isto não é para mim" em segundos. Nota: `2025.ts` já tem uma entrada `fontes.art31`, sinalizando a intenção.

## Solução proposta

Seguir o padrão de extensão que a cat. F estabeleceu: coeficientes em `TaxYearConfig`, módulo próprio do motor, cartão no AnexosHeader e grupo na Calculadora — mais uma secção pedagógica ("porque é que só 75% conta?").

## Requisitos

1. `TaxYearConfig`: tabela de coeficientes do art. 31.º (tipo de atividade → coeficiente) com entradas em `fontes`, por ano.
2. Novo módulo do motor `categoriaB.ts`: bruto × coeficiente → líquido englobado, incluindo o ajuste de dedução de contribuições (art. 31.º n.º 2 — contribuições SS que excedam 10% do bruto, quando aplicável); regras de mínimos obrigatórios anotadas no âmbito se adiadas.
3. `calcularLiquidacao` engloba o líquido de cat. B a par de A/H/F; o detalhe do output mostra a conta do coeficiente.
4. UI: novo cartão AnexosHeader "Anexo B · Trabalho independente"; grupo na Calculadora com select de tipo de atividade + rendimento bruto + contribuições.
5. Guia: secção curta ou callout a explicar a lógica dos coeficientes, com cross-link a partir da hint da Calculadora.
6. Fora de âmbito (explícito): contabilidade organizada (Anexo C), interações com IVA, retenção nos recibos verdes (ver SPEC-023).

## Critérios de aceitação

- [ ] Um freelancer de serviços com 30 000 € vê 22 500 € englobados (0,75), com derivação visível.
- [ ] Todos os coeficientes vivem em `tax-data/` com fontes oficiais.
- [ ] Testes do motor cobrem pelo menos serviços, alojamento local e o ajuste de contribuições; casos adicionados quando houver uma nota real com Anexo B.

## Áreas afetadas

`src/engine/` (novo `categoriaB.ts`), `src/engine/liquidacao.ts`, `src/tax-data/*.ts`, `src/ui/components/AnexosHeader.ts`, `src/ui/components/Calculator.ts`, `src/content/`
