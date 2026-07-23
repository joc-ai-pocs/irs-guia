# SPEC-024 — Conversão no Hero: gancho de resultado, CTA principal, bloco de diferenciação

- **Prioridade**: P2 (P1 se publicado publicamente) · **Esforço**: S · **Origem**: Marketing · **Estado**: Proposto

## Problema

O Hero — eyebrow "Guia pedagógico · Rendimentos de 2025", título "Como se calcula o IRS, passo a passo.", linha meta "Fonte / Tabela / IAS", badge "ART. 68.º CIRS" — é um belo enquadramento editorial para os curiosos, mas um contribuinte stressado em abril está a perguntar "vou receber ou pagar, e quanto?". Não há CTA above-the-fold: a Calculadora é um tab que o visitante tem de descobrir. E embora o tab Recursos ligue generosamente a concorrência (Doutor Finanças, DECO, bancos), nenhuma página articula a diferenciação real: três métodos de coleta lado a lado, uma nota de liquidação descodificada linha a linha, a visualização das fatias, fontes oficiais em cada constante — "o único que te mostra *porquê*, não só *quanto*".

## Requisitos

1. Manter o título editorial; adicionar um sub-gancho orientado ao resultado e um botão CTA principal ("Simula o teu IRS em 2 minutos →") que muda para o tab Calculadora (reutilizar `CtaButton` + o plumbing de troca de tab; href real conforme a SPEC-015).
2. Eyebrow consciente da época (da SPEC-016): contagem decrescente do prazo durante abr–jun.
3. Adicionar um bloco compacto "Porquê este guia?" (Hero ou topo do Resumo): simulador da AT = decisão final; este guia = perceber o cálculo; três bullets sobre as mecânicas únicas (três métodos, nota linha a linha, fontes em cada número).
4. Reutilizar esse enquadramento textualmente como pitch canónico no README/materiais de lançamento (SPEC-025).

## Critérios de aceitação

- [ ] Um visitante de primeira vez chega a um resultado calculado com um clique a partir do Hero.
- [ ] O bloco de diferenciação existe e afirma o posicionamento em ≤3 bullets.
- [ ] Direção visual editorial (papel/tijolo/tinta, Fraunces) inalterada.

## Áreas afetadas

`src/ui/components/Hero.ts/.css`, `CtaButton.ts`, `src/ui/sections/TabResumo.ts`, `src/main.ts`
