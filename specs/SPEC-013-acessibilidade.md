# SPEC-013 — Accessibility completion: tabs, BracketBar, contrast, live results

- **Priority**: P1 · **Effort**: M · **Origin**: Software Architect, UX Designer · **Status**: Proposed

## Problem

The foundations are good (labels via `for`, `prefers-reduced-motion`, `aria-pressed` in YearSelector/ThemeToggle/AnexosHeader), but the signature interactions are mouse-only and the ARIA is half-finished:

- `TabsNav.ts` sets `role="tablist"`/`role="tab"` but never `aria-selected`, `aria-controls`/`id` pairs, `role="tabpanel"`, or arrow-key roving focus — announcing tab semantics without implementing them is worse than plain buttons.
- `BracketBar.ts` syncs highlight exclusively via `mouseenter`; segments are `div`s with `title` tooltips — keyboard users can never trigger the highlight, touch users never see the range.
- The Calculator output re-renders on every keystroke with no `aria-live`, so assistive tech never hears the result change. `Calculator.css` removes focus `outline`, leaving only a border-bottom colour change (WCAG 2.4.7).
- Contrast: `--ink-faint` (#8a7d72) on `--paper` is ~3.5:1 — below AA — yet used for the smallest text (11px field labels, 10–11px eyebrows/badges). `ExerciciosPanel.css` hardcodes `#fff` on brick buttons (~2.9:1 in dark mode), violating the project's own no-hex-literals rule.
- Cross-tab jumps (`TableOfContents`, `ResumoCard`) call `scrollIntoView` without moving focus.

## Requirements

1. Complete the tab pattern: `aria-selected`, `id`/`aria-controls`, `role="tabpanel"` on panes, Left/Right arrow roving `tabindex`.
2. BracketBar segments become `<button>`s; `:focus-visible` triggers the same `setActive`; move range text from `title` into the visible seg label or an `aria-label`.
3. Mark `calculator__final` (or the output container) `aria-live="polite"`.
4. Restore `:focus-visible` outlines using the existing pattern from `AnexosHeader.css`; add `aria-expanded` to the ExerciciosPanel toggle (with SPEC-007).
5. Tokens: darken `--ink-faint` to ≥4.5:1 against `--paper` in both themes (light ≈ #75685c) or promote labels/hints to `--ink-soft`; replace every `#fff` in `ExerciciosPanel.css` with `var(--paper)`.
6. After cross-tab anchor jumps, `target.focus({ preventScroll: true })` on the section heading (`tabindex="-1"`).

## Acceptance criteria

- [ ] Full keyboard path: switch tabs with arrows, walk brackets with Tab/arrows, hear the recomputed result announced.
- [ ] All text ≥4.5:1 in both themes (spot-check the 10–12px mono text).
- [ ] No hex literals remain in component CSS.

## Touched areas

`src/ui/components/TabsNav.ts`, `BracketBar.ts/.css`, `Calculator.ts/.css`, `ExerciciosPanel.ts/.css`, `TableOfContents.ts`, `src/styles/tokens.css`
