# SPEC-007 — Revisão do fluxo de guardar/carregar: diálogos inline, guarda de colisões, erros visíveis

- **Prioridade**: P0 · **Esforço**: M · **Origem**: Arquiteto de Software, UX Designer · **Estado**: Proposto

## Problema

Três problemas que se compõem em `ExerciciosPanel.ts`:

1. **Perda de dados silenciosa.** O `slugify` em `src/state/types.ts` documenta que as colisões de nomes têm de ser tratadas pelos chamadores (prompt de "substituir?") — mas nenhum chamador o faz. `saveAs` e `duplicate` chamam `storage.save()` incondicionalmente, e `fs-storage.ts` abre com `{ create: true }` e trunca. Guardar "Perfil A!" quando existe "Perfil A?" destrói o ficheiro antigo sem qualquer aviso, e a lista mostra depois uma só entrada — a perda parece um mistério.
2. **Diálogos do sistema operativo.** Todo o fluxo assenta em `window.prompt`/`confirm`/`alert` — sem estilo, a destoar da direção editorial, impossíveis de etiquetar para leitores de ecrã, suprimidos nalguns contextos embebidos.
3. **Falhas invisíveis.** `list()` apanha erros de leitura/parse por ficheiro e apenas faz `console.warn`; `refresh()` faz `console.error` e renderiza como se nada fosse. Um ficheiro corrompido saltado é indistinguível de perda de dados. O próprio painel esconde-se atrás de um toggle colapsado "Não conectado", longe do resultado que guarda.

## Solução proposta

UI de gravação inline e orientada a estado dentro do painel (o componente já se re-renderiza a si próprio), confirmação explícita de substituição, e ficheiros corrompidos renderizados como linhas inertes explicativas.

## Requisitos

1. Substituir o `prompt` por um campo de nome + botão "Guardar" inline no corpo do painel; substituir o `confirm` de apagar por uma confirmação destrutiva inline em dois passos; substituir os `alert` de erro por uma linha de estado inline.
2. Antes de escrever em `saveAs`/`duplicate`: `storage.list()`, calcular o slug do novo nome; se um `nome` diferente mapear para o mesmo slug, exigir confirmação explícita ("Vai substituir '<X>'. Continuar?").
3. `list()` devolve `{ items, skipped: { name, error }[] }`; os ficheiros saltados renderizam como linhas inertes ("ficheiro inválido — <motivo>") usando as strings de erro `ParseResult` existentes.
4. Adicionar um botão "Guardar este exercício" junto ao `calculator__final` que expande/liga o painel a pedido.
5. `aria-expanded` no toggle de colapso do painel (coordenar com a SPEC-013).

## Critérios de aceitação

- [ ] Guardar um nome cujo slug colide com um exercício diferente pergunta antes de substituir.
- [ ] Não resta nenhum `window.prompt`/`confirm`/`alert` no painel.
- [ ] Um JSON corrompido à mão aparece na lista como inválido com o motivo, e os restantes ficheiros continuam a carregar.
- [ ] Guardar está a um clique a partir da caixa de resultado.

## Áreas afetadas

`src/ui/components/ExerciciosPanel.ts`, `src/ui/components/ExerciciosPanel.css`, `src/state/fs-storage.ts`, `src/state/types.ts`
