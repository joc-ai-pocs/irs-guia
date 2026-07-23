# SPEC-001 — Dependentes no modelo do agregado familiar

- **Prioridade**: P0 · **Esforço**: M · **Origem**: Product Owner, Marketing · **Estado**: Proposto

## Problema

O cartão Rosto em `TabCalculadora.ts` anuncia "dependentes", mas nada os modela: `LiquidacaoInput` não tem campo de dependentes, `TaxYearConfig` não tem valores de dedução por dependente, e a única alavanca familiar é o `quocienteFamiliar` (1 ou 2). Qualquer agregado com filhos — a maioria das famílias, incluindo o caso de uso do próprio autor — obtém um resultado errado (imposto sobrestimado) sem qualquer aviso.

Pior: `src/content/seccao08_callout_conjunta.md` afirma que os dependentes "adicionam ao quociente em certas condições" — lei desatualizada. O quociente familiar por dependente foi abolido em 2016; hoje os dependentes conferem deduções fixas à coleta (art. 78.º n.º 1 + 78.º-A CIRS, ~600 € cada, com majorações para menores de 3 anos em agregados com 2+ filhos).

## Solução proposta

Modelar os dependentes como deduções à coleta, conforme a lei em vigor, com valores parametrizados por ano em `tax-data/`.

## Requisitos

1. Adicionar `dependentes` a `LiquidacaoInput`: contagem e, opcionalmente, escalões etários por dependente (menos de 3 / menos de 6 / outros) para suportar as majorações.
2. Adicionar os valores fixos de dedução por dependente a `TaxYearConfig` para 2024/2025/2026, cada um com entrada em `fontes` apontando para o art. 78.º-A CIRS (padrão `requireFonte`).
3. Aplicar a dedução por dependente no passo das deduções à coleta de `calcularLiquidacao`, visível como linha própria no detalhe do output.
4. Adicionar um input numérico "Dependentes" ao grupo Rosto em `Calculator.ts` (`min: 0`, inteiro).
5. Corrigir `seccao08_callout_conjunta.md`: os dependentes afetam as deduções à coleta, não o quociente.
6. Testes do motor cobrindo 0, 1 e 3 dependentes, incluindo a interação com o piso da coleta líquida (ver SPEC-008).

## Critérios de aceitação

- [ ] Um declarante individual com 2 dependentes vê a dedução fixa por dependente refletida na coleta líquida, com linha de output identificada.
- [ ] Todas as constantes de dependentes vivem em `tax-data/`, nenhuma no motor ou na UI (regra inviolável).
- [ ] O conteúdo do guia deixa de afirmar que os dependentes alteram o quociente familiar.
- [ ] `npm test` e `npm run typecheck` verdes; novos casos adicionados a `casos/cobertura.json`.

## Áreas afetadas

`src/engine/liquidacao.ts`, `src/tax-data/*.ts`, `src/tax-data/types.ts`, `src/ui/components/Calculator.ts`, `src/content/seccao08_callout_conjunta.md`
