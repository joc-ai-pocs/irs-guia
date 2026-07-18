# SPEC-014 — Mobile: restore the feedback loop (sticky result + BracketBar fixes)

- **Priority**: P1 · **Effort**: M · **Origin**: UX Designer · **Status**: Proposed

## Problem

Below 900px, `TabCalculadora.css` collapses to one column: intro → anexos cards → exercícios panel → full 7-section form → BracketBar → line-by-line output → final result. Editing "Rendimento cat. A" gives zero visible feedback; the user must scroll past everything to see the number change, then scroll back. The immediate cause-and-effect that justifies an interactive simulator is gone exactly on the platform where a public "check my IRS" audience mostly lives (WhatsApp-referred traffic is ~all mobile).

Additionally: BracketBar's 9 equal segments at 375px are ~38px wide with 13px mono labels, and its 6-column table has no `overflow-x` container — it squishes or overflows the page.

## Requirements

1. On <900px, add a sticky bottom mini-bar showing the live final result ("1 234,56 € a receber" / "a pagar"), fed from the existing `finalElement` / `onChange` plumbing; tapping it scrolls to the full breakdown.
2. The mini-bar respects safe-area insets, hides when the full result is already in view, and is `aria-hidden` (the canonical result remains the announced one — see SPEC-013's `aria-live`).
3. Wrap `.bracket-bar__table` in an `overflow-x: auto` scroll container (page body must never scroll horizontally).
4. On narrow screens, show per-segment labels only for the active segment; others on demand.
5. Verify the Calculator's field grid, AnexosHeader cards, and ExerciciosPanel at 375px and 768px — no horizontal overflow anywhere in the tab.

## Acceptance criteria

- [ ] On a 375px viewport, editing any income field shows the updated final amount without scrolling.
- [ ] BracketBar table scrolls horizontally within its own container; page does not.
- [ ] No layout overflow at 375/768/1280 in either theme.

## Touched areas

`src/ui/sections/TabCalculadora.ts/.css`, `src/ui/components/Calculator.ts`, `src/ui/components/BracketBar.css`
