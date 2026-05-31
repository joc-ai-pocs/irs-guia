import type { LiquidacaoInput, LiquidacaoResult } from '@/engine';

/**
 * Schema version embedded in every persisted exercício file.
 *
 * Bump this when changing the on-disk shape and add a migration in
 * {@link migrateExercicio}. The "1" baseline below is what ships today.
 */
export const EXERCICIO_SCHEMA_VERSION = 1 as const;

/**
 * A single saved exercício — a named snapshot of the Calculator inputs (and
 * the result computed at save time) for a given fiscal year.
 *
 * Stored as one JSON file per exercício in a user-picked directory, e.g.
 *   ~/Documents/irs-exercicios/exercicio-2025-jose-carpinteiro.json
 */
export interface Exercicio {
  /** Schema version of the persisted file. Used for migrations. */
  readonly schemaVersion: typeof EXERCICIO_SCHEMA_VERSION;
  /** Free-form human name (e.g. "Exercício 2025 — Zé Carpinteiro"). */
  readonly nome: string;
  /** Fiscal year — matches {@link TaxYearConfig.ano}. */
  readonly ano: number;
  /** ISO-8601 timestamp of first save. */
  readonly createdAt: string;
  /** ISO-8601 timestamp of the most recent save. */
  readonly updatedAt: string;
  /** The inputs that produced this snapshot. */
  readonly inputs: LiquidacaoInput;
  /**
   * Snapshot of the computed result at save time. Stored so the user can
   * browse historical exercícios without having to recompute (and so an
   * eventual engine update doesn't silently change historical values).
   */
  readonly snapshotResultado: LiquidacaoResultSnapshot;
}

/**
 * Trimmed view of {@link LiquidacaoResult} kept inside the persisted exercício.
 * We only keep the high-signal numbers that map to the AT settlement note —
 * enough to display the result without re-running the engine, but not so much
 * that we duplicate the engine's contract on disk.
 */
export interface LiquidacaoResultSnapshot {
  readonly rendimentoColetavel: number;
  readonly escalaoNumero: number;
  readonly coletaTotal: number;
  readonly coletaLiquida: number;
  readonly impostoApurado: number;
  readonly taxaMediaEfetiva: number;
}

/**
 * Builds a snapshot from a fresh {@link LiquidacaoResult}.
 */
export function buildSnapshot(result: LiquidacaoResult): LiquidacaoResultSnapshot {
  return {
    rendimentoColetavel: result.rendimentoColetavel,
    escalaoNumero: result.coleta.escalao.numero,
    coletaTotal: result.coletaTotal,
    coletaLiquida: result.coletaLiquida,
    impostoApurado: result.impostoApurado,
    taxaMediaEfetiva: result.taxaMediaEfetiva,
  };
}

/**
 * Result of parsing a JSON blob loaded from disk: either the validated
 * Exercício, or a structured error describing the failure (so the UI can
 * surface useful messages — "this file isn't a v1 exercício", etc.).
 */
export type ParseResult =
  | { readonly ok: true; readonly value: Exercicio }
  | { readonly ok: false; readonly error: string };

/**
 * Validates and migrates raw JSON into an {@link Exercicio}.
 *
 * Today we only have schema v1 — but the function is shaped to make the
 * eventual migration cheap (e.g. v2 might split inputs by tax category).
 */
export function migrateExercicio(raw: unknown): ParseResult {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: 'JSON não é um objeto.' };
  }
  const obj = raw as Record<string, unknown>;
  const v = obj['schemaVersion'];
  if (v !== EXERCICIO_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Schema desconhecido (esperado v${EXERCICIO_SCHEMA_VERSION}, encontrado ${String(v)}).`,
    };
  }
  if (typeof obj['nome'] !== 'string' || obj['nome'].trim() === '') {
    return { ok: false, error: 'Campo "nome" inválido.' };
  }
  if (typeof obj['ano'] !== 'number') {
    return { ok: false, error: 'Campo "ano" inválido.' };
  }
  if (typeof obj['inputs'] !== 'object' || obj['inputs'] === null) {
    return { ok: false, error: 'Campo "inputs" inválido.' };
  }
  if (typeof obj['snapshotResultado'] !== 'object' || obj['snapshotResultado'] === null) {
    return { ok: false, error: 'Campo "snapshotResultado" inválido.' };
  }
  // Trust the shape after the cheap structural checks — at this layer we
  // don't fully validate every numeric field. The engine will reject bad
  // numbers next time the exercício is computed.
  return { ok: true, value: obj as unknown as Exercicio };
}

/**
 * Converts a human name into a safe filename component (no spaces, no
 * accents, no special characters). Two distinct names that slugify to the
 * same string will collide — callers should handle the "overwrite?" prompt.
 */
export function slugify(nome: string): string {
  return nome
    .normalize('NFD')
    // strip combining diacritics (U+0300–U+036F)
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
