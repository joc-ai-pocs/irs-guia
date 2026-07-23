# SPEC-011 — Perfis do agregado + transporte ano-sobre-ano

- **Prioridade**: P1 · **Esforço**: M · **Origem**: Product Owner · **Estado**: Proposto

## Problema

O objetivo declarado do produto é uma ferramenta reutilizável todos os anos para as 4 declarações do agregado (BRIEFING.md), mas o `Exercicio` (schema v1) é um ficheiro plano com um `nome` livre — a identidade da pessoa vive apenas em convenções de nomes como `exercicio-2025-mae.json`. Não há agrupamento por pessoa, nem ligação "mesma pessoa, ano anterior", nem transporte. Cada ano fiscal, as 4 declarações são reescritas do zero, e "mãe 2024 vs mãe 2025" não pode ser comparado.

## Solução proposta

Schema v2 com campo opcional `perfil`, um painel agrupado, e um "Duplicar para {ano+1}" de um clique que recalcula com o novo ano e mostra o delta.

## Requisitos

1. Subir `EXERCICIO_SCHEMA_VERSION` para 2: adicionar `perfil: string` opcional. `migrateExercicio` migra ficheiros v1 (perfil ausente) — o primeiro uso real do hook de migração.
2. O `ExerciciosPanel` agrupa a lista por perfil (secção "sem perfil" para ficheiros sem ele); o fluxo de gravação (formulário inline da SPEC-007) ganha um campo perfil opcional com datalist dos perfis conhecidos.
3. Ação "Duplicar para {ano+1}": copia os inputs, re-estampa o `ano`, recalcula com a config do ano de destino (tem de existir e, idealmente, não ser `provisorio` — avisar conforme a SPEC-016), guarda como novo exercício.
4. Vista de delta ano-sobre-ano quando um perfil tem exercícios em anos consecutivos: imposto apurado, escalão, taxa efetiva — calculados a partir dos snapshots guardados, mostrados na meta do item do painel.
5. Coordenar as alterações de schema com a SPEC-002 (inputs de dois declarantes) para evitar dois bumps consecutivos.

## Critérios de aceitação

- [ ] Ficheiros v1 carregam, aparecem sem grupo, e regravam como v2 sem perda de dados.
- [ ] Duplicar "mãe 2025" para 2026 produz um exercício de 2026 guardado com inputs idênticos e resultados recalculados.
- [ ] O painel mostra delta em € e em pontos percentuais entre anos consecutivos do mesmo perfil.

## Áreas afetadas

`src/state/types.ts`, `src/ui/components/ExerciciosPanel.ts`, `src/engine/` (apenas reutilização)
