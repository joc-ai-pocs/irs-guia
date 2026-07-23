# SPEC-016 — Propagação do ano provisório + consciência da época (e verificar 2026)

- **Prioridade**: P1 · **Esforço**: S · **Origem**: Arquiteto de Software, Product Owner · **Estado**: Proposto

## Problema

O `provisorio` é honrado em exatamente dois sítios: `defaultAno()` salta-o e o `YearSelector` mostra um asterisco + um aviso de uma linha. Mas seleciona 2026 e abre a Calculadora: o simulador renderiza uma nota de liquidação totalmente confiante a partir de escalões placeholder que o próprio `2026.ts` diz para não usar. O `ExerciciosPanel.saveAs` persiste alegremente um exercício estampado `ano: 2026` sem marcador provisório — a ressalva perde-se no momento em que os dados saem do ecrã.

Entretanto, 2026 é o ano fiscal corrente e continua um stub (escalões copiados de 2025, IAS por confirmar face à Lei 73-A/2025), e a app não tem consciência da época: o Hero tem "A declarar até 30/06" hardcoded, mesmo depois de o prazo ter passado.

## Requisitos

1. Quando `config.provisorio`, renderizar um banner de aviso persistente dentro de `TabCalculadora` e um badge no cabeçalho da Calculadora (a prop `badge` existe): "Tabela provisória — valores não verificados".
2. Guardar um exercício de um ano provisório ou exige confirmação e grava `provisorio: true` (mostrado na meta do item da lista), ou é recusado — escolher um e documentar.
3. Verificar `src/tax-data/2026.ts` contra a Lei 73-A/2025 / Portal das Finanças (fontes já ligadas); remover `provisorio` quando confirmado; a suite de invariantes da SPEC-009 tem de passar na tabela verificada.
4. Banner de época derivado de `config.anoDeclaracao` + data atual: "Entrega decorre até 30/06/AAAA" durante abr–jun, "Prazo terminou a 30/06/AAAA" depois — substituindo o texto hardcoded do eyebrow do Hero.

## Critérios de aceitação

- [ ] Selecionar um ano provisório mostra o aviso no próprio tab da Calculadora, não só no YearSelector.
- [ ] Um exercício provisório guardado é identificável como tal depois de recarregar.
- [ ] O texto do prazo no Hero está correto em julho sem edições manuais.

## Áreas afetadas

`src/ui/sections/TabCalculadora.ts`, `src/ui/components/Calculator.ts`, `ExerciciosPanel.ts`, `Hero.ts`, `src/state/types.ts`, `src/tax-data/2026.ts`
