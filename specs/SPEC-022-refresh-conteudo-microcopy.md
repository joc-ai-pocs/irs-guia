# SPEC-022 — Refresh de conteúdo e microcopy: matriz de cobertura, enquadramento, jargão

- **Prioridade**: P2 · **Esforço**: S · **Origem**: Product Owner, UX Designer · **Estado**: Proposto

## Problema

O conteúdo do guia divergiu do produto em três eixos:

1. **Afirmações de cobertura obsoletas.** A Secção 08 intitula-se "O que esta calculadora não cobre" mas os callouts descrevem cat. F, Anexo D e tributação conjunta — tudo coisas que o motor agora cobre. Subvende o produto e confunde o leitor sobre em que pode confiar. (O erro sobre dependentes em `seccao08_callout_conjunta.md` é tratado na SPEC-001.)
2. **Enquadramento do autor.** `tab_calculadora_intro.md` abre com "Os teus 4 IRS deste ano…" — enquadramento pessoal do autor sem significado para qualquer outro leitor. A mesma fuga em `resumo05.md` (SPEC-017) e no tab Resumo, que hardcoda referências de ano enquanto o YearSelector promete conteúdo filtrado por ano (`TabResumo.ts` não recebe config; "ESCALÕES 2025", prazos em `resumo06.md`).
3. **Jargão da AT e falsas affordances.** Os badges do `AnexosHeader.ts` dizem "Conforme aplicável" / "Fora do âmbito" — registo administrativo que um contribuinte não descodifica; o cartão "Rosto" bloqueado é um `<div>` que ainda recebe o fundo de hover, sinalizando clicabilidade que não tem; os nove segmentos de largura igual da BracketBar sugerem visualmente escalões de amplitude igual (a legenda admite o contrário em mono de 11px).

## Requisitos

1. Reescrever a Secção 08 como matriz de cobertura derivada da capacidade real ("Coberto: A/H/F/D, conjunta, mínimo de existência · Não coberto: dependentes, Anexo B/E/G/J, IRS Jovem") — idealmente gerada de uma única fonte de verdade (uma constante de capacidades junto ao motor) para não voltar a divergir.
2. Passagem de audiência sobre `src/content/`: remover formulações específicas do autor; segunda pessoa neutra em todo o lado.
3. Passar `config` a `TabResumo(config)`; interpolar `config.ano`/`anoDeclaracao` nos títulos dos cartões; templatizar valores específicos do ano a partir de `tax-data` ou estampar os cartões com "Referente a rendimentos de AAAA" quando não seguem o seletor.
4. Reescrever os badges do AnexosHeader em segunda pessoa ("Preenche sempre" / "Só se tiveres" / "Ainda não coberto"); limitar os estilos de hover aos chips `--toggleable`; remover os `title` redundantes.
5. BracketBar: largura proporcional à amplitude do escalão com um mínimo de largura (manter larguras iguais só na tabela), ou um marcador visual de quebra explícito para o último escalão aberto.

## Critérios de aceitação

- [ ] As afirmações da Secção 08 correspondem à cobertura real do motor, verificadas contra os exports de `engine/index.ts`.
- [ ] Selecionar 2024 não deixa nenhum "2025" visível que não se declare como tal.
- [ ] Não resta copy na primeira pessoa do autor em `src/content/`.

## Áreas afetadas

`src/content/*.md`, `src/ui/sections/TabResumo.ts`, `Seccao08_Avisos.ts`, `src/ui/components/AnexosHeader.ts/.css`, `BracketBar.ts/.css`
