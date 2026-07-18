# SPEC-002 — Tributação conjunta com dois declarantes + comparador conjunta vs. separada

- **Prioridade**: P0 · **Esforço**: L · **Origem**: Product Owner, UX Designer · **Estado**: Proposto

## Problema

A tributação conjunta é simulada com um único input numérico `quocienteFamiliar` (`step: 0.5`, que permite o juridicamente absurdo 1,5) e UM só conjunto de campos de cat. A. Para um casal com dois rendimentos, o motor calcula uma única dedução específica combinada — `min(total, max(4 462,15, contribuições combinadas))` — quando a lei confere a cada sujeito passivo a sua própria dedução. Um casal em que cada um ganha ~20 000 € perde ~4 462 € de dedução na simulação.

A decisão mais valiosa para um casal — tributação conjunta vs. separada — não pode sequer ser calculada, apesar de o motor já demonstrar o padrão de "what-if" com a `englobamentoNota` da cat. F.

A UX do formulário agrava o problema: o primeiro campo de todo o formulário pede uma constante interna do motor ("quociente familiar, 1 ou 2") em vez de uma pergunta que um contribuinte entende.

## Solução proposta

Modelar os Sujeitos Passivos A e B separadamente; calcular deduções específicas por SP; adicionar um comparador conjunta vs. separada; substituir o spinner do quociente por um controlo segmentado.

## Requisitos

1. Substituir o input numérico `quocienteFamiliar` por um controlo segmentado de duas opções ao estilo do `YearSelector`: "Tributação individual" / "Tributação conjunta (casal)", mapeado internamente para 1/2. Manter a pedagogia na hint ("isto é o quociente familiar do quadro 5 do Rosto").
2. Com conjunta selecionada, mostrar blocos de input Sujeito Passivo A / B, cada um com rendimento cat. A/H e contribuições próprias.
3. Motor: calcular a dedução específica por sujeito passivo e somar, nos termos do art. 25.º CIRS.
4. Adicionar uma nota comparadora "Conjunta vs. separada" que corre os dois cenários e mostra o delta em €, espelhando o padrão `englobamentoNota` em `liquidacao.ts`.
5. Os snapshots de `Exercicio` capturam os dois blocos de SP (bump de schema; coordenar com a SPEC-011 para o `migrateExercicio`).

## Critérios de aceitação

- [ ] Um casal com dois rendimentos obtém duas deduções específicas, não uma.
- [ ] Introduzir 1,5 como quociente é impossível através da UI.
- [ ] O comparador indica qual a opção mais barata e por quanto, em € (formatEUR).
- [ ] Testes do motor cobrem: ambos os SP acima do piso da dedução, um abaixo, e equivalência do modo individual com os resultados atuais (sem regressão).

## Áreas afetadas

`src/engine/liquidacao.ts`, `src/engine/escaloes.ts`, `src/ui/components/Calculator.ts`, `src/state/types.ts`
