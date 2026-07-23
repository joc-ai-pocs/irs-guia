# SPEC-009 — Suite de testes de invariantes do tax-data (atualização anual segura por construção)

- **Prioridade**: P1 · **Esforço**: S · **Origem**: Arquiteto de Software · **Estado**: Proposto

## Problema

A arquitetura existe para que adicionar `tax-data/2027.ts` seja a única alteração anual — mas `src/tax-data/index.test.ts` só valida os ids de `fontes` e a ordenação do registo. Nada garante a consistência interna de uma tabela `Escalao[]`. Um único dígito mal transcrito numa `parcelaAbater` da lei de 2027 publicaria montantes de imposto errados com todos os testes atuais verdes (os casos só fixam meia dúzia de rendimentos de 2024/2025).

## Solução proposta

Um teste parametrizado sobre `TAX_YEARS` que verifica as invariantes matemáticas que qualquer tabela de escalões válida tem de satisfazer. Um ficheiro de teste, zero alterações ao código de produção.

## Requisitos

1. Para cada ano registado, verificar:
   - limites dos escalões estritamente crescentes; exatamente um `POSITIVE_INFINITY`, na última linha;
   - todas as taxas em (0, 1); taxas normais não decrescentes;
   - a identidade de continuidade que torna o método 3 correto: `parcelaAbater[n] ≈ parcelaAbater[n−1] + limiteSuperior[n−1] × (taxaNormal[n] − taxaNormal[n−1])` (tolerância: cêntimos);
   - `deducaoEspecificaMinima ≈ ias × deducaoEspecificaCoef` onde ambos estejam definidos.
2. Varrimento cruzado de métodos por ano: `calcularColetaMetodo2` vs `calcularColetaMetodo3` concordam a poucos cêntimos em cada fronteira de escalão ±1 € e num conjunto de pontos interiores.
3. Os anos provisórios (`provisorio: true`) correm as mesmas invariantes (um stub tem de ser internamente consistente na mesma).
4. Integrar no `npm test` normal (já apanha `src/tax-data/*.test.ts`).

## Critérios de aceitação

- [ ] Corromper um dígito de qualquer `parcelaAbater` numa cópia de trabalho faz a suite falhar com mensagem que nomeia o ano e o escalão.
- [ ] A suite passa para 2024, 2025 e 2026 tal como estão commitados.

## Áreas afetadas

`src/tax-data/index.test.ts` (ou um novo `invariants.test.ts`)
