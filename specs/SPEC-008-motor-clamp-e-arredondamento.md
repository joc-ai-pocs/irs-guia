# SPEC-008 — Correção do motor: piso da coleta líquida + política de arredondamento aos cêntimos

- **Prioridade**: P0 · **Esforço**: S · **Origem**: Arquiteto de Software · **Estado**: Proposto

## Problema

Duas lacunas de correção ao nível do motor que produzem valores em euros errados:

1. **Coleta líquida negativa.** `liquidacao.ts:384`: `coletaLiquida = coletaTotal - deducoesColeta - beneficioMunicipal` não é limitada a zero (ao contrário de `baseBeneficioMunicipal`, que é). Nos termos do art. 78.º CIRS, as deduções não podem exceder a coleta. Um rendimento baixo (coleta ~300 €) com 1 500 € de deduções de saúde/educação — cenário plausível de pensionista — produz uma coleta líquida negativa que alimenta um valor "a receber" fictício. Nenhum teste cobre deduções > coleta.
2. **Sem política de arredondamento.** O motor transporta floats IEEE crus de ponta a ponta; `exercises/exercicio-2025-mae.json` mostra `"coletaTotal": 1092.7476000000001` persistido em disco. A nota da AT arredonda linhas específicas aos cêntimos. O `formatEUR` esconde o ruído na UI, mas o harness de reconciliação `casos` (tolerância 0,01 €) está a meio cêntimo acumulado de ficar instável, e futuras comparações snapshot-vs-recalculado terão diffs espúrios.

## Solução proposta

Limitar ao piso legal com uma nota explicativa, e arredondar nas linhas documentadas da nota de liquidação através de um único helper.

## Requisitos

1. `coletaLiquida = Math.max(0, …)`; quando o limite atua, emitir uma nota de detalhe (padrão existente: `abatimentoMinimoExistenciaDetalhe`) explicando que as deduções à coleta não podem, por si só, gerar reembolso (os reembolsos vêm da retenção, não de coleta negativa).
2. Introduzir `roundCents()` no motor; aplicar nas linhas da nota de liquidação: coleta, coleta total, coleta líquida, imposto apurado.
3. Aplicar o mesmo arredondamento em `buildSnapshot` (`src/state/types.ts`) para que os ficheiros persistidos tenham cêntimos limpos.
4. Adicionar um caso a `casos/cobertura.json` fixando o comportamento deduções > coleta; correr `npm run casos` para confirmar ausência de regressões nos casos existentes.
5. Documentar a política de arredondamento em comentário no `roundCents()` (que linhas arredondam, quais ficam cruas).

## Critérios de aceitação

- [ ] Coleta 300 € + deduções 1 500 € → coleta líquida 0 €, com nota visível; "a receber" reflete apenas a retenção.
- [ ] Nenhum snapshot persistido contém mais de 2 casas decimais nas linhas arredondadas.
- [ ] Todos os testes e casos existentes passam sem alterações (dentro da tolerância de 0,01 €).

## Áreas afetadas

`src/engine/liquidacao.ts`, `src/state/types.ts`, `casos/cobertura.json`
