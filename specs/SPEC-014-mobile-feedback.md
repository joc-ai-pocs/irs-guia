# SPEC-014 — Mobile: repor o ciclo de feedback (resultado sticky + correções na BracketBar)

- **Prioridade**: P1 · **Esforço**: M · **Origem**: UX Designer · **Estado**: Proposto

## Problema

Abaixo de 900px, `TabCalculadora.css` colapsa para uma coluna: intro → cartões de anexos → painel de exercícios → formulário completo de 7 secções → BracketBar → output linha a linha → resultado final. Editar "Rendimento cat. A" não dá feedback visível nenhum; o utilizador tem de fazer scroll por tudo para ver o número mudar, e voltar atrás para ajustar. A causa-efeito imediata que justifica um simulador interativo desaparece exatamente na plataforma onde vive a audiência pública de "ver o meu IRS" (tráfego vindo do WhatsApp é ~todo mobile).

Além disso: os 9 segmentos iguais da BracketBar a 375px têm ~38px de largura com labels mono de 13px, e a tabela de 6 colunas não tem contentor `overflow-x` — esmaga-se ou transborda da página.

## Requisitos

1. Em <900px, adicionar uma mini-barra sticky no fundo com o resultado final ao vivo ("1 234,56 € a receber" / "a pagar"), alimentada pelo plumbing existente `finalElement` / `onChange`; tocar nela faz scroll até à decomposição completa.
2. A mini-barra respeita os safe-area insets, esconde-se quando o resultado completo já está visível, e é `aria-hidden` (o resultado canónico continua a ser o anunciado — ver o `aria-live` da SPEC-013).
3. Envolver `.bracket-bar__table` num contentor com `overflow-x: auto` (o corpo da página nunca pode ter scroll horizontal).
4. Em ecrãs estreitos, mostrar labels por segmento apenas no segmento ativo; os restantes a pedido.
5. Verificar a grelha de campos da Calculadora, os cartões do AnexosHeader e o ExerciciosPanel a 375px e 768px — sem overflow horizontal em lado nenhum do tab.

## Critérios de aceitação

- [ ] Num viewport de 375px, editar qualquer campo de rendimento mostra o valor final atualizado sem scroll.
- [ ] A tabela da BracketBar faz scroll horizontal dentro do próprio contentor; a página não.
- [ ] Sem overflow de layout a 375/768/1280 em ambos os temas.

## Áreas afetadas

`src/ui/sections/TabCalculadora.ts/.css`, `src/ui/components/Calculator.ts`, `src/ui/components/BracketBar.css`
