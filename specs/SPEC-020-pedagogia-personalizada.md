# SPEC-020 — Pedagogia personalizada: os números do utilizador dentro do guia

- **Prioridade**: P2 · **Esforço**: M · **Origem**: UX Designer · **Estado**: Proposto

## Problema

`Seccao05_Fatias.ts` renderiza `SlicedIncome({ coletavel: 15650 })` — um exemplo hardcoded — e a BracketBar da Secção 02 é explicitamente autónoma. Os números do utilizador só aparecem no tab Calculadora; as secções explicativas do guia, onde o "aha" devia acontecer, nunca os refletem. O output da calculadora mostra linhas da nota de liquidação (01, 02, 04, 05, 10, 11…) cuja anatomia completa é explicada na Secção 07 — mas nenhum liga ao outro. A pedagogia declarada — ver o mecanismo aplicado ao *teu* rendimento — só aterra a meio, apesar de o plumbing (`Calculator.onChange`, `__irsSwitchTab(tab, anchor)`) já existir em grande parte.

## Requisitos

1. Manter o último snapshot da calculadora em estado de módulo (já difundido via `Calculator.onChange`; coordenar com o `lastSnapshot` da SPEC-004).
2. O SlicedIncome da Secção 05 ganha um toggle: "Exemplo (15 650 €)" / "O meu rendimento coletável" — a segunda opção ativa apenas quando existe snapshot.
3. A BracketBar da Secção 02 destaca o escalão do utilizador quando existe snapshot, com um pequeno marcador "o teu escalão".
4. No output da calculadora, tornar os números de linha em links que saltam para a linha correspondente da StepTable da Secção 07 via o plumbing cross-tab existente (com gestão de foco conforme a SPEC-013).
5. Estado vazio gracioso: sem snapshot, as secções comportam-se exatamente como hoje.

## Critérios de aceitação

- [ ] Depois de um cálculo, a Secção 05 consegue fatiar o coletável do próprio utilizador e a Secção 02 marca o seu escalão.
- [ ] Clicar na linha "10" do output aterra (e foca) a explicação dessa linha na Secção 07.
- [ ] Nenhuma mudança de comportamento para quem nunca toca na calculadora.

## Áreas afetadas

`src/ui/sections/Seccao02_Escaloes.ts`, `Seccao05_Fatias.ts`, `Seccao07_NotaLiquidacao.ts`, `src/ui/components/SlicedIncome.ts`, `BracketBar.ts`, `Calculator.ts`, `src/main.ts`
