# SPEC-006 — Persistência universal: storage de fallback + exportar/importar JSON

- **Prioridade**: P0 · **Esforço**: M · **Origem**: Arquiteto de Software, Product Owner, Marketing · **Estado**: Proposto

## Problema

Toda a funcionalidade de guardar/carregar depende da File System Access API, exclusiva de browsers Chromium. `fs-storage.ts` (`isFsAccessSupported`) e `ExerciciosPanel.ts` tratam o caso não suportado dizendo ao utilizador "Usa Chrome, Edge, Brave ou Arc" — em Firefox, Safari e todo o iOS não há forma nenhuma de persistir um exercício. Para o objetivo doméstico (4 declarações, máquinas de vários membros da família) é uma falha dura de disponibilidade; para qualquer publicação exclui cerca de metade dos visitantes, a maioria em mobile. O verdadeiro diferenciador de privacidade — os dados nunca saem do browser — nunca é afirmado na UI.

## Solução proposta

Extrair o contrato de storage para uma interface com um adaptador de fallback universal, mais exportar/importar explícitos que funcionam em todo o lado e servem de backup.

## Requisitos

1. Definir uma interface `ExercicioStorage` a partir da superfície atual de `fs-storage.ts` (`list`, `save`, `load`, `delete`); manter a implementação FSA como caminho avançado.
2. Adicionar um adaptador IndexedDB (ou localStorage) selecionado automaticamente quando a FSA não está disponível; o `ExerciciosPanel` funciona de forma idêntica sobre qualquer um.
3. Adicionar ações "Exportar JSON" (Blob + `<a download>`) e "Importar JSON" (`<input type="file">`) disponíveis em TODOS os browsers, reutilizando `migrateExercicio` para validação na importação.
4. Substituir a mensagem-beco-sem-saída de browser não suportado pela experiência de fallback; mencionar as pastas ligadas por FSA como opção para utilizadores avançados.
5. Mostrar a nota de privacidade onde se guarda: "Os ficheiros ficam apenas no teu computador — nada é enviado."

## Critérios de aceitação

- [ ] Em Firefox/Safari: guardar, listar, carregar, apagar, exportar e importar funcionam todos.
- [ ] Em Chromium: o fluxo de pasta FSA existente mantém-se; exportar/importar também disponíveis.
- [ ] Um ficheiro exportado reimporta sem perdas (round-trip por `migrateExercicio`).
- [ ] Sem novas dependências de runtime.

## Áreas afetadas

`src/state/fs-storage.ts`, `src/state/` (novo adaptador), `src/state/types.ts`, `src/ui/components/ExerciciosPanel.ts`
