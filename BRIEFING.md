# Briefing — handover Claude.ai → Claude Code

Este documento captura o contexto que levou ao estado atual do repo. Anexa-o (ou copia o conteúdo) à primeira sessão de Claude Code para que entres a meio do jogo já a saber porque é que as coisas estão como estão.

## Contexto do utilizador

- **Perfil**: tech lead/staff engineer com background Java/Spring (certificação Spring Core), arquitetura de microserviços, AWS, Oracle/Postgres.
- **Objetivo a médio prazo**: ferramenta reutilizável todos os anos para preparar 4 declarações de IRS do agregado familiar (mãe, padrasto, namorada, próprio).
- **Local**: repo Git em máquina pessoal, editor próprio, npm.
- **Prioridades** (por ordem):
  1. Design/UX e conteúdo pedagógico
  2. Dados editáveis / persistência dos 4 perfis
  3. Cobertura fiscal (cat. F, Anexo D, conjunta)
  4. Qualidade de engenharia (testes, build, estrutura)

## Princípio arquitetural central

Três camadas que mudam a ritmos diferentes:

```
tax-data/   muda 1× por ano    →  configuração fiscal (escalões, IAS, deduções)
engine/     muda raramente     →  funções puras de cálculo
ui/         muda sempre        →  componentes de apresentação
```

A regra inviolável: a UI nunca contém uma constante fiscal nem uma fórmula. Tudo o que é "21,5%" ou "8,54 × IAS" vive na camada de dados; tudo o que é "como combinar esses números" vive no engine. Quando vier o ano 2027, deve bastar adicionar `tax-data/2027.ts` para o resto continuar a funcionar.

## Decisões já tomadas (não reabrir sem motivo)

- **Stack**: Vanilla TS + Vite (sem framework). O utilizador vem de backend Java, queria tipagem forte sem o peso conceptual de React/Svelte. Trade-off aceite: componentes são funções que devolvem `HTMLElement`, usando o micro-helper `h()` em `src/ui/dom.ts`.
- **TypeScript strict máximo** (incluindo `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`). Levou a algumas fricções (helper `requireFonte`) mas apanhou bugs reais durante o scaffold.
- **Direção visual**: editorial sóbrio (paleta papel/tijolo/tinta, Fraunces + Inter). Foi escolhida de uma comparação entre três direções no Artifact `IRS_styleguide_3_direcoes.html`. As outras duas (técnico-pedagógico, almanaque) foram descartadas mas o ficheiro existe como referência.
- **CSS em ficheiros irmãos dos componentes**, importados pelo TS. Vite trata do bundling. Tokens centralizados em `src/styles/tokens.css`.
- **Vitest desde o dia 1** para o engine. Testes não fazem UI — não compensa.
- **Testes do engine validados externamente** com Python antes de empacotar. Aritmética bate certo: coletável 15 650 € → coleta 2 413,84 €.

## Pontos de atenção

1. **`src/tax-data/2026.ts` é um stub** — tem `@todo` claros. Não usar para cálculos reais antes de verificar contra Portal das Finanças (Lei 73-A/2025).
2. **`src/types/*.d.ts`** são shims mínimos para `*.css` e `vitest`. Existiam para o `tsc --noEmit` passar sem `node_modules` no sandbox onde foi gerado o scaffold. Quando `npm install` correr localmente, os types reais sobrepõem-se. Podem ficar — são inofensivos.
3. **Engine só cobre cat. A/H + quociente familiar (1 ou 2)**. Cat. F (rendas), Anexo D (transparência fiscal), dependentes — tudo TODO.
4. **`main.ts` é uma demo, não a aplicação final**. Renderiza a secção 04 do guia (dedução específica) para validar a integração end-to-end das três camadas. Vai ser substituído quando houver mais componentes (Tabs, TOC, etc.).

## Onde está o "guia original" que inspirou isto

O ponto de partida foi um documento HTML pedagógico de página única (`IRS_2025_guia_pedagogico.html`) gerado em sessões anteriores no Claude.ai, com 8 secções + calculadora interativa + 3 tabs. O scaffold atual reconstrói a *infraestrutura* desse documento de forma modular — o conteúdo pedagógico vai ser portado para Markdown ou strings tipadas conforme se for desenhando.

## Roadmap próximo (não fazer tudo de uma vez)

Por ordem sugerida:

1. **Setup e primeira passagem**: descomprimir, `npm install`, correr `npm run typecheck` + `npm test`, fazer primeiro commit. Não fazer mais nada nesta sessão.
2. **BracketBar interativo**: componente visual com a barra horizontal dos 9 escalões, hover sincronizado a uma tabela. Considera fazer Artifact no claude.ai antes para iterar variantes de micro-interação.
3. **Calculator**: componente com inputs + output dinâmico. Consome `calcularLiquidacao` do engine. Pode também beneficiar de Artifact prévio.
4. **Tabs + TableOfContents + Footer**: meta-navegação. Menos interessante visualmente, faz direto no repo.
5. **Persistência dos 4 perfis**: modelar `Profile` em `src/state/`, localStorage com export/import JSON. Tipado, com versão de schema para futuro.
6. **Cat. F (rendas)**: novo módulo `src/engine/categoria-f.ts` com testes. Implementar art. 41.º (despesas dedutíveis) + art. 72.º (taxa autónoma 25% / reduções).
7. **Anexo D**: módulo `src/engine/categoria-b-imputada.ts`. Lê valor de matéria coletável imputada e engloba como cat. B.
8. **Tributação conjunta com dependentes**: alargar o quociente familiar atual.

## Como trabalhar comigo daqui em diante

Algumas práticas que poupam tempo em Claude Code:

- **Uma feature por sessão**. Não acumular tarefas no mesmo loop.
- **Antes de implementar, pedir-me para ler ficheiros relevantes** ("lê `src/engine/coleta.ts` e `src/engine/coleta.test.ts` antes de continuar"). O contexto explícito beat o contexto implícito.
- **Correr testes e typecheck depois de mudanças significativas**. Em vez de "tudo depois", peça-me sempre `npm test` no fim de cada bloco.
- **Para componentes visuais novos**, voltar ao claude.ai como estúdio de desenho. Importar o resultado para o repo só depois de fechado.
- **Não me deixes mexer em ficheiros não relacionados** sem perguntar primeiro. Pequenas mudanças "incidentais" tendem a virar grandes refactorings descontrolados.
