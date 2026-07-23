# SPEC-021 — Companheiro de preenchimento do Modelo 3 ("o que escrevo onde")

- **Prioridade**: P2 · **Esforço**: M · **Origem**: Product Owner · **Estado**: Proposto

## Problema

As hints dos campos já nomeiam quadros ("Anexo A, quadro 4 — códigos 4xx") e o AnexosHeader espelha a estrutura de anexos — mas na hora de entregar, o utilizador continua a mapear mentalmente o exercício guardado de volta para o formulário do Portal das Finanças. Não há checklist por exercício nem vista imprimível a listar anexo/quadro/campo por input. O "User journey survey para perceber anexos a preencher" do TODO.md aponta exatamente para este trabalho por fazer: converter o simulador num companheiro de entrega é a última milha do caso de uso doméstico.

## Requisitos

1. Estender o `FieldSpec` com um mapeamento `modelo3` explícito (anexo, quadro, campo/código) — a maior parte já existe informalmente nas hints.
2. Nova vista "Guia de preenchimento" gerada a partir dos grupos ativos de um exercício: tabela input → anexo → quadro/campo → valor (formatEUR), mais a lista de anexos a juntar.
3. Acessível a partir do resultado da Calculadora e de cada item do ExerciciosPanel.
4. Amigável para impressão (folha de estilos `@media print`) e exportável via print-to-PDF do browser; sem novas dependências.
5. Disclaimer claramente delimitado: códigos de campo verificados contra o Modelo 3 corrente; mapeamentos desconhecidos aparecem como "verificar no portal", nunca inventados.

## Critérios de aceitação

- [ ] Para um exercício guardado com cat. A + H + deduções, a vista lista cada valor com o seu anexo/quadro/campo e os anexos a juntar.
- [ ] Imprimir produz uma cábula limpa de uma a duas páginas por pessoa.
- [ ] Campos sem mapeamento verificado são explicitamente sinalizados, nunca inventados.

## Áreas afetadas

`src/ui/components/Calculator.ts` (FieldSpec), novo `src/ui/components/GuiaPreenchimento.{ts,css}`, `src/ui/components/ExerciciosPanel.ts`
