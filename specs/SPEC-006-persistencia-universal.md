# SPEC-006 — Universal persistence: fallback storage + JSON export/import

- **Priority**: P0 · **Effort**: M · **Origin**: Software Architect, Product Owner, Marketing · **Status**: Proposed

## Problem

The entire save/load feature depends on the File System Access API, which is Chromium-only. `fs-storage.ts` (`isFsAccessSupported`) and `ExerciciosPanel.ts` handle the unsupported case by telling the user "Usa Chrome, Edge, Brave ou Arc" — on Firefox, Safari, and all of iOS there is no way to persist an exercício at all. For the household goal (4 declarations, family members' machines) this is a hard availability gap; for any public release it excludes roughly half of visitors, most of them mobile. The genuine privacy differentiator — data never leaves the browser — is never stated in the UI.

## Proposed solution

Extract the storage contract into an interface with a universal fallback adapter, plus explicit export/import that works everywhere and doubles as backup.

## Requirements

1. Define a `ExercicioStorage` interface from the current `fs-storage.ts` surface (`list`, `save`, `load`, `delete`); keep the FSA implementation as the enhanced path.
2. Add an IndexedDB (or localStorage) adapter selected automatically when FSA is unavailable; `ExerciciosPanel` works identically over either.
3. Add "Exportar JSON" (Blob + `<a download>`) and "Importar JSON" (`<input type="file">`) actions available in ALL browsers, reusing `migrateExercicio` for validation on import.
4. Replace the dead-end unsupported message with the fallback experience; mention FSA-connected folders as the power-user option.
5. Surface the privacy note where saving happens: "Os ficheiros ficam apenas no teu computador — nada é enviado."

## Acceptance criteria

- [ ] In Firefox/Safari: save, list, load, delete, export, and import all work.
- [ ] In Chromium: existing FSA folder flow unchanged; export/import also available.
- [ ] An exported file re-imports losslessly (`migrateExercicio` round-trip).
- [ ] No new runtime dependencies.

## Touched areas

`src/state/fs-storage.ts`, `src/state/` (new adapter), `src/state/types.ts`, `src/ui/components/ExerciciosPanel.ts`
