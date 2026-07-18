# SPEC-007 — Save/load flow overhaul: inline dialogs, collision guard, visible errors

- **Priority**: P0 · **Effort**: M · **Origin**: Software Architect, UX Designer · **Status**: Proposed

## Problem

Three compounding issues in `ExerciciosPanel.ts`:

1. **Silent data loss.** `slugify` in `src/state/types.ts` documents that name collisions must be handled by callers ("overwrite?" prompt) — but no caller does. `saveAs` and `duplicate` call `storage.save()` unconditionally, and `fs-storage.ts` opens with `{ create: true }` and truncates. Saving "Perfil A!" when "Perfil A?" exists destroys the older file with zero warning, and the list afterwards shows one entry — the loss looks like a mystery.
2. **OS dialogs.** The whole flow runs on `window.prompt`/`confirm`/`alert` — unstyled, clashing with the editorial design, unlabelable for screen readers, suppressed in some embedded contexts.
3. **Invisible failures.** `list()` catches per-file read/parse errors and only `console.warn`s them; `refresh()` `console.error`s and renders as if nothing happened. A skipped corrupted file is indistinguishable from data loss. The panel itself hides behind a collapsed "Não conectado" toggle, far from the result it saves.

## Proposed solution

Inline, state-driven save UI inside the panel (the component already re-renders itself), an explicit overwrite confirmation, and corrupted files rendered as inert explanatory rows.

## Requirements

1. Replace `prompt` with an inline name field + "Guardar" button in the panel body; replace `confirm` on delete with an inline two-step destructive confirm; replace `alert` errors with an inline status row.
2. Before writing in `saveAs`/`duplicate`: `storage.list()`, compute the new name's slug; if a different `nome` maps to the same slug, require explicit confirmation ("Vai substituir '<X>'. Continuar?").
3. `list()` returns `{ items, skipped: { name, error }[] }`; skipped files render as inert rows ("ficheiro inválido — <motivo>") using the existing `ParseResult` error strings.
4. Add a "Guardar este exercício" button next to `calculator__final` that expands/connects the panel on demand.
5. `aria-expanded` on the panel collapse toggle (coordinates with SPEC-013).

## Acceptance criteria

- [ ] Saving a name whose slug collides with a different exercício asks before overwriting.
- [ ] No `window.prompt`/`confirm`/`alert` remains in the panel.
- [ ] A hand-corrupted JSON file appears in the list as invalid with a reason, and other files still load.
- [ ] Save is reachable from the result box in one click.

## Touched areas

`src/ui/components/ExerciciosPanel.ts`, `src/ui/components/ExerciciosPanel.css`, `src/state/fs-storage.ts`, `src/state/types.ts`
