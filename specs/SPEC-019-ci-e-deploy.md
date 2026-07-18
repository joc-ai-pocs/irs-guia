# SPEC-019 — CI and deploy hygiene

- **Priority**: P1 · **Effort**: S · **Origin**: Software Architect · **Status**: Proposed

## Problem

`.github/workflows/deploy-pages.yml` still deploys on pushes to `feat/year-filter`, marked "Temporary… until it is merged" — that branch merged long ago (the year selector is in `main.ts`). A stray push to the stale branch would overwrite the production site with old code. There is also no standalone CI: tests/typecheck run only inside the deploy job, so PRs (which the repo uses — see merge commits `1a82fb1`, `b8dc845`) get no checks before merge. Broken engine changes reaching `main` eventually become published wrong numbers.

## Requirements

1. Remove the `feat/year-filter` trigger from `deploy-pages.yml`; deploy only from `main`.
2. Add `ci.yml` running on `pull_request` (and pushes to `main`): `npm ci && npm run test:run && npm run typecheck`.
3. Include `npm run casos` in CI — `scripts/casos.ts` already exits non-zero on failure, making the AT-note reconciliation a merge gate.
4. Optional: make the deploy job depend on the same checks rather than duplicating them.

## Acceptance criteria

- [ ] Pushing to any branch other than `main` never deploys.
- [ ] A PR with a failing engine test or caso shows a red check before merge.

## Touched areas

`.github/workflows/deploy-pages.yml`, `.github/workflows/ci.yml` (new)
