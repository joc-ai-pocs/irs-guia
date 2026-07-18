# SPEC-013 — Conclusão da acessibilidade: tabs, BracketBar, contraste, resultados anunciados

- **Prioridade**: P1 · **Esforço**: M · **Origem**: Arquiteto de Software, UX Designer · **Estado**: Proposto

## Problema

As fundações são boas (labels via `for`, `prefers-reduced-motion`, `aria-pressed` em YearSelector/ThemeToggle/AnexosHeader), mas as interações-assinatura são só-rato e o ARIA está a meio:

- `TabsNav.ts` define `role="tablist"`/`role="tab"` mas nunca `aria-selected`, pares `aria-controls`/`id`, `role="tabpanel"`, nem navegação por setas — anunciar semântica de tabs sem a implementar é pior do que botões simples.
- `BracketBar.ts` sincroniza o destaque exclusivamente via `mouseenter`; os segmentos são `div`s com tooltips `title` — utilizadores de teclado nunca conseguem acionar o destaque, utilizadores de touch nunca veem o intervalo.
- O output da Calculadora re-renderiza a cada tecla sem `aria-live`, pelo que a tecnologia de apoio nunca ouve o resultado mudar. `Calculator.css` remove o `outline` de foco, deixando só uma mudança de cor na borda inferior (WCAG 2.4.7).
- Contraste: `--ink-faint` (#8a7d72) sobre `--paper` é ~3,5:1 — abaixo de AA — e é usado no texto mais pequeno (labels de campo de 11px, eyebrows/badges de 10–11px). `ExerciciosPanel.css` tem `#fff` hardcoded nos botões brick (~2,9:1 em dark mode), violando a própria regra do projeto de "sem literais hex".
- Os saltos entre tabs (`TableOfContents`, `ResumoCard`) chamam `scrollIntoView` sem mover o foco.

## Requisitos

1. Completar o padrão de tabs: `aria-selected`, `id`/`aria-controls`, `role="tabpanel"` nos painéis, roving `tabindex` com setas Esquerda/Direita.
2. Os segmentos da BracketBar passam a `<button>`; `:focus-visible` aciona o mesmo `setActive`; mover o texto do intervalo do `title` para o label visível do segmento ou um `aria-label`.
3. Marcar `calculator__final` (ou o contentor de output) com `aria-live="polite"`.
4. Repor os outlines `:focus-visible` usando o padrão existente de `AnexosHeader.css`; adicionar `aria-expanded` ao toggle do ExerciciosPanel (com a SPEC-007).
5. Tokens: escurecer `--ink-faint` para ≥4,5:1 contra `--paper` em ambos os temas (claro ≈ #75685c) ou promover labels/hints a `--ink-soft`; substituir todos os `#fff` em `ExerciciosPanel.css` por `var(--paper)`.
6. Após saltos de âncora entre tabs, `target.focus({ preventScroll: true })` no título da secção (`tabindex="-1"`).

## Critérios de aceitação

- [ ] Percurso completo por teclado: mudar de tab com setas, percorrer escalões com Tab/setas, ouvir o resultado recalculado anunciado.
- [ ] Todo o texto ≥4,5:1 em ambos os temas (verificar em particular o mono de 10–12px).
- [ ] Não resta nenhum literal hex no CSS dos componentes.

## Áreas afetadas

`src/ui/components/TabsNav.ts`, `BracketBar.ts/.css`, `Calculator.ts/.css`, `ExerciciosPanel.ts/.css`, `TableOfContents.ts`, `src/styles/tokens.css`
