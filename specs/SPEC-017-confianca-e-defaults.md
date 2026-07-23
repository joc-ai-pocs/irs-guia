# SPEC-017 — Superfície de confiança: metodologia, fontes por linha, valores de exemplo neutros

- **Prioridade**: P1 · **Esforço**: S · **Origem**: Marketing, Product Owner, UX Designer · **Estado**: Proposto

## Problema

Dois lados da mesma moeda de confiança:

1. **A prova é invisível.** A evidência genuinamente persuasiva — motor verificado contra a Lei 55-A/2025 e a Lei 33/2024, 73 testes, um harness `casos/` que reconcilia contra notas de liquidação reais da AT ao cêntimo, cada constante rastreável a um URL `FonteOficial` — não aparece em lado nenhum da UI. Nem a autoria: em fiscalidade, "quem és tu para me explicar o IRS?" é a primeira objeção. O disclaimer do Footer e os links para fontes oficiais são bons mas incompletos.
2. **Os defaults são dados reais do autor.** `Calculator.ts` vem pré-preenchido com a nota de liquidação verdadeira de um membro da família (13 054,76 € / 1 436,05 € / 3 571,62 € / 307,97 € / 103 € — idêntica ao gitignorado `exercicio-2025-mae.json`), sem marcador de que são exemplos e sem forma de os limpar. O "Anexos a usar nos 4 IRS da família" de `resumo05.md` verte o mesmo enquadramento pessoal.

## Requisitos

1. Substituir os defaults por valores neutros, redondos, obviamente sintéticos (ex.: 15 000 / 1 650 / 0), marcados com um chip junto ao cabeçalho da Calculadora: "Valores de exemplo — substitui pelos teus".
2. Adicionar uma ação secundária "Limpar valores" que zera todos os campos.
3. Adicionar uma secção "Sobre este guia" (link no footer): autor, propósito, metodologia — "cada constante tem fonte oficial; motor com testes automáticos; valores 2024–2025 verificados contra os diplomas" — data de última verificação por ano (já existe em `TaxYearConfig`), link para o repositório.
4. Faixa de confiança junto ao resultado: "Motor validado contra notas de liquidação reais · N testes", com link para a metodologia.
5. Adicionar links `fontes` por linha (art. 25.º, 68.º, 70.º, 72.º, 78.º) às linhas de output correspondentes, usando `requireFonte`.
6. Reformular `resumo05.md` para enquadramento neutro ("Anexos por perfil de contribuinte").

## Critérios de aceitação

- [ ] Não restam valores financeiros pessoais no código commitado.
- [ ] Um visitante de primeira vez responde a "quem fez isto e porque devo confiar nos números" em dois cliques.
- [ ] Cada linha principal do output liga à sua base legal.

## Áreas afetadas

`src/ui/components/Calculator.ts`, `Footer.ts`, `src/ui/sections/`, `src/content/resumo05.md`, `src/tax-data/index.ts`
