# SPEC-015 — Estado partilhável no URL: tab, secção e cálculo codificado

- **Prioridade**: P1 · **Esforço**: M · **Origem**: Marketing, UX Designer · **Estado**: Proposto

## Problema

`main.ts` só persiste `?ano=` no URL. O tab ativo vive num nome de classe (refresh na Calculadora volta ao Guia); as âncoras de secção existem (`Section.ts` dá ids estáveis) mas nunca se refletem na barra de endereço; os inputs da Calculadora não são codificados em lado nenhum. A entrada "Calculadora interativa" do TOC é `href="#"` — clique do meio dá um link morto. Um utilizador que acabou de perceber "afinal só pago 37% sobre a última fatia" não consegue enviar esse momento exato a ninguém; uma simulação guardada não pode ser enviada aos outros três membros do agregado. As "explorable explanations" espalham-se por deep links; esta não tem nenhum.

## Requisitos

1. Espelhar o padrão `?ano=`: escrever `?tab=<id>` em `TabsNav.activate()` via `history.replaceState`; ler no arranque junto com `anoFromUrl()`.
2. Refletir a secção ativa do guia como `#<id-da-seccao>` no scroll/navegação do TOC; repor a posição de scroll no carregamento.
3. Dar hrefs reais aos links do TOC e cross-tab (`?tab=calculadora`, `#seccao-05`) com interceção JS como melhoria progressiva — o clique do meio tem de funcionar.
4. Codificação compacta de `LiquidacaoInput` num query param (é um objeto tipado pequeno — ex.: base64url de um JSON mínimo versionado): carregar um URL com ele pré-preenche a Calculadora e calcula.
5. Botão "Copiar ligação a este cálculo" junto ao resultado: `navigator.share` quando disponível, fallback para clipboard, com estado de confirmação.
6. Back/forward do browser refletem as mudanças de tab (tratamento de `popstate`).

## Critérios de aceitação

- [ ] Refresh em qualquer tab repõe esse tab, o ano e (se presente) o cálculo codificado.
- [ ] Um link de cálculo colado noutra máquina reproduz exatamente o mesmo resultado.
- [ ] URLs antigos (`?ano=` apenas) continuam a funcionar; o param de codificação de inputs é versionado para futuras mudanças de schema.

## Áreas afetadas

`src/main.ts`, `src/ui/components/TabsNav.ts`, `src/ui/components/TableOfContents.ts`, `src/ui/components/Calculator.ts`, `src/ui/sections/TabGuia.ts`
