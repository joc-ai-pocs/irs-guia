# SPEC-005 — Inputs numéricos pt-PT com validação a sério (sem zeros silenciosos)

- **Prioridade**: P0 · **Esforço**: M · **Origem**: UX Designer, Arquiteto de Software · **Estado**: Proposto

## Problema

`Calculator.ts` usa `<input type="number">` cru com valores como `13054.76`, enquanto todo o output usa `formatEUR` ("13 054,76 €"). Um utilizador português que escreva `1.436,05` obtém rejeição ou truncagem dependente do browser. Depois, `getInputs()` coage qualquer valor não finito para 0 — um campo vazio ou inválido zera silenciosamente um rendimento e toda a liquidação é recalculada como se ele tivesse desaparecido: sem estado de erro, sem `aria-invalid`, sem mensagem. Valores negativos são aceites em todos os campos exceto `quocienteFamiliar` (o único com `min`/`max`).

## Solução proposta

Uma camada de parse/formatação pt-PT sobre inputs de texto, com estados de erro visíveis por campo, e semântica de "último valor válido" em vez de coerção para zero.

## Requisitos

1. Passar os campos monetários para `type="text"` + `inputmode="decimal"`; aceitar `,` como separador decimal e espaços/pontos como milhares; formatar no blur segundo as convenções pt-PT já em `src/ui/format.ts`.
2. Input inválido mostra estado de erro inline: borda `.calculator__field--invalid` + mensagem curta a substituir a hint (ex.: "Insere um valor em euros, ex.: 1 436,05") + `aria-invalid="true"`.
3. Enquanto um campo está inválido, o cálculo mantém o último valor válido — nunca colapsa silenciosamente para 0.
4. Impor semântica `min: 0` em todos os campos monetários (valores negativos rejeitados com o estado de erro).
5. Estender o `FieldSpec` em `Calculator.ts` com as restrições, para que os limites vivam num só sítio (também usado pela validação de ficheiros da SPEC-010).

## Critérios de aceitação

- [ ] Escrever `1.436,05` produz 1436.05; o blur re-renderiza como "1 436,05".
- [ ] Limpar um campo a meio da edição não zera o resultado; aparece um erro/hint e o valor anterior mantém-se.
- [ ] Input negativo mostra o estado inválido e não entra no motor.
- [ ] Leitores de ecrã anunciam o estado inválido (`aria-invalid` + mensagem associada via `aria-describedby`).

## Áreas afetadas

`src/ui/components/Calculator.ts`, `src/ui/components/Calculator.css`, `src/ui/format.ts`
