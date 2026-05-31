# TODO

Lista de trabalho versionada (vai no git). Espelha o estado das tasks que o Claude Code mantém em `~/.claude/tasks/<session>/` mas serve como fonte durável entre sessões.

**Convenção:** quando uma task fica concluída, marca `[x]` e move para o fim do ficheiro em `## Concluído`. Quando uma nova entra, adiciona em `## Pendente` com título curto + 2-3 linhas de contexto.

---

## Pendente

### Destacar linhas-chave na nota de liquidação

Na StepTable da Secção 07 (Anatomia da nota de liquidação), aplicar background diferente às linhas que são totais/marcos do cálculo: **01** (Rendimento global), **06** (Rendimento coletável), **09** (Total para determinação da taxa), **11** (Importância apurada), **18** (Coleta total). Provavelmente também **22** (Coleta líquida) e **25** (Imposto apurado) para fechar a hierarquia.

Implementação: prop opcional `highlightRows: string[]` em StepTable + classe CSS própria. Nada hardcoded ao conteúdo da nota de liquidação — fica reutilizável.

---

### Tab Recursos: preview do conteúdo antes de abrir o link

Hoje cada ResourceCard mostra título + descrição curta + abre em nova tab. Falta dar contexto sobre o que se vai *concretamente* encontrar do outro lado (estrutura, secções relevantes, o que procurar).

Opções a explorar antes de implementar:
- (a) expandir a descrição com 2-3 bullets do que esperar;
- (b) accordion/peek interno que abre uma preview antes do clique externo;
- (c) screenshot/thumbnail do destino.

Considerar que muitos links vão para PDFs e páginas grandes do Portal das Finanças onde o utilizador se perde sem saber em que ponto procurar.

---

### User journey survey para perceber anexos a preencher

---

## Concluído

_Datas no formato AAAA-MM-DD. Detalhe completo no `git log`._

- [x] **2026-05-29** — Merge inicial do guia HTML para a base de código (3 tabs, 8 secções, BracketBar interativa, Calculator interativa, MethodsGrid, SlicedIncome, ResumoCards, ResourceGroups, conteúdo em `.md` separado, `marked` como dep, `calcularColetaMetodo1` no engine).
- [x] **2026-05-29** — Fix do teste `liquidacao.test.ts` mal calibrado (cenário "reembolso" era na verdade pagamento de +9,60 €); renomeado + valor exato asseverado; novo teste cobre reembolso genuíno.
- [x] **2026-05-30** — Calculadora promovida para tab própria (`TabCalculadora`); 4 tabs agora (Guia · Calculadora · Resumo · Recursos). BracketBar duplicada dentro da nova tab com sync local. Secção 06 do Guia vira teaser com `CtaButton` (novo componente reutilizável). `TableOfContents` aceita `tab` para saltar entre tabs.
- [x] **2026-05-30** — Calculadora suporta exercícios persistidos no disco via File System Access API (Chromium-only). Novo módulo `src/state/` (types + schema versionado + IndexedDB para o handle do diretório + wrapper FSA). `Calculator` passa a devolver `CalculatorHandle` (getInputs/setInputs/getLastResult). Novo `ExerciciosPanel` no topo da tab com 4 estados (unsupported/disconnected/needs-permission/connected). Cada exercício é um ficheiro `<slug>.json` na pasta escolhida.
