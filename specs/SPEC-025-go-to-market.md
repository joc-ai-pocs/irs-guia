# SPEC-025 — Go-to-market: decisão de nome/domínio, analytics privacy-first, captura sazonal, kit de lançamento

- **Prioridade**: P2 · **Esforço**: M · **Origem**: Marketing · **Estado**: Proposto — exige primeiro uma decisão explícita de produto

## Problema

Tudo aqui está condicionado a uma decisão que o BRIEFING deixa em aberto: **ferramenta pessoal ou produto público?** Se for público:

1. **Nome.** "irs-guia" em `*.github.io/irs-guia/` é um slug de repositório, não uma marca — não memorável, impronunciável numa conversa, e "guia IRS" como termo genérico está disputado pelo Doutor Finanças, DECO e o content marketing de todos os bancos. Difícil de mudar depois de os links se acumularem.
2. **Medição.** Zero analytics: não há forma de saber se o tab Calculadora sequer é encontrado. Nenhum gancho de retenção: cada visitante sazonal é readquirido do zero no ano seguinte, num produto cuja utilização se repete anualmente por imposição legal.
3. **Distribuição.** Nada está preparado para os canais onde isto aterraria: sem screenshots, sem GIF, sem pitch de um parágrafo; o README é documentação de arquitetura. Os dois momentos anuais de tráfego (época de entrega abr–jun; anúncio do OE em outubro, quando as pesquisas por "novos escalões IRS" disparam) estão por explorar — apesar de o diff de config entre ficheiros de ano ser computável por máquina.

## Requisitos

1. **Portão de decisão**: escolher explicitamente pessoal / público. Tudo o que se segue aplica-se apenas a "público".
2. Registar um domínio .pt antes de os links se acumularem; testar 2–3 candidatos de nome que transportem o diferenciador (o ângulo fatias/transparência — ex.: "IRS por dentro", "IRS às fatias"); configurar o domínio próprio no Pages; manter "simulador IRS" / "escalões IRS" como termos SEO ao nível das páginas, não como marca.
3. Analytics privacy-first (Plausible ou GoatCounter — sem banner de cookies, coerente com o ethos sóbrio do site): medir trocas de tab, uso da calculadora, trocas de ano, eventos de guardar/partilhar.
4. Um gancho de captura de email com uma promessa sazonal concreta ("Avisa-me quando a tabela 2026 estiver verificada / quando abrir a entrega").
5. Página "O que muda em {ano}" gerada automaticamente do diff ano-sobre-ano de `TaxYearConfig`, publicada na semana em que a proposta do OE sai (outubro).
6. Kit de lançamento: 3 screenshots (fatias, três métodos, nota de liquidação), um GIF de 20s da calculadora, posts por canal (r/literaciafinanceira — ângulo educativo/fontes; r/devpt — ângulo de arquitetura), calendarizado para o início de abril.

## Critérios de aceitação

- [ ] A decisão pessoal-vs-público está registada (aqui ou no BRIEFING.md) com as suas consequências.
- [ ] Se público: domínio ativo, analytics a responder "os visitantes encontram a calculadora?", captura ativa, e o kit de lançamento existe no repo (`docs/launch/`).

## Áreas afetadas

Documentação do repo, `index.html`, `public/`, novo `docs/launch/`, `scripts/` (gerador da página de diff de config)
