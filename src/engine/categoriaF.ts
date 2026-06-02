import type { TaxYearConfig } from '@/tax-data/types';

/**
 * Lease-duration bucket driving the cat. F autonomous tax rate
 * (art. 72.º n.º 1 al. e) + n.º 2 a 5 CIRS).
 *
 *  - `padrao`        : default 25% — short-term or open-ended leases
 *  - `duracao5a10`   : 15% — lease term > 5 and ≤ 10 years
 *  - `duracao10a20`  : 10% — lease term > 10 and ≤ 20 years
 *  - `duracao20mais` :  5% — lease term > 20 years
 */
export type DuracaoContratoF =
  | 'padrao'
  | 'duracao5a10'
  | 'duracao10a20'
  | 'duracao20mais';

/**
 * Deductible expenses for category F (art. 41.º CIRS).
 *
 * Each field corresponds to a row in the Anexo F's expenses table. Negative
 * values are clamped to zero — passing `undefined` and `0` is equivalent.
 */
export interface DespesasCatF {
  /** IMI (municipal property tax) paid on the rented property, in euros. */
  readonly imi?: number;
  /** Condominium fees paid during the year, in euros. */
  readonly condominio?: number;
  /**
   * Conservation/maintenance works on the property, in euros. Per art. 41.º
   * the works must have been carried out in the 24 months before the lease
   * started (or during it). The engine does not enforce that constraint —
   * the user is expected to enter only the deductible part.
   */
  readonly conservacao?: number;
}

/**
 * Detailed breakdown of the cat. F specific deduction. Exposes each input so
 * the UI can render the formula (R − Σdespesas).
 */
export interface DeducaoCategoriaF {
  readonly rendasBrutas: number;
  readonly imi: number;
  readonly condominio: number;
  readonly conservacao: number;
  /** Sum of all deductible expenses (capped at the gross rent). */
  readonly despesasTotal: number;
  /**
   * Net category F income — `max(0, rendasBrutas − despesasTotal)`. The
   * engine clamps at zero because cat. F losses are reported in a separate
   * dedicated flow ("perdas a recuperar") which is not yet modelled.
   */
  readonly rendimentoLiquido: number;
  /** `true` when the expenses sum exceeded the gross rent — informational. */
  readonly perdaPotencial: boolean;
}

/**
 * Computes the cat. F net income from gross rents and deductible expenses.
 *
 * @param rendasBrutas total gross rents collected during the year (€)
 * @param despesas itemized deductible expenses (defaults all 0)
 * @returns breakdown with every input and the clamped net income
 */
export function calcularDeducaoCategoriaF(
  rendasBrutas: number,
  despesas: DespesasCatF = {},
): DeducaoCategoriaF {
  const brutas = Math.max(0, rendasBrutas);
  const imi = Math.max(0, despesas.imi ?? 0);
  const condominio = Math.max(0, despesas.condominio ?? 0);
  const conservacao = Math.max(0, despesas.conservacao ?? 0);
  const despesasTotal = imi + condominio + conservacao;
  const rendimentoLiquido = Math.max(0, brutas - despesasTotal);
  return {
    rendasBrutas: brutas,
    imi,
    condominio,
    conservacao,
    despesasTotal,
    rendimentoLiquido,
    perdaPotencial: despesasTotal > brutas,
  };
}

/**
 * Looks up the autonomous tax rate applicable to a cat. F lease, given the
 * lease-duration bucket selected by the contribuinte.
 */
export function obterTaxaCatF(
  config: TaxYearConfig,
  duracao: DuracaoContratoF = 'padrao',
): number {
  return config.taxasCatF[duracao];
}

/**
 * Computes the autonomous collection on cat. F income (art. 72.º CIRS).
 *
 * @param rendimentoLiquido net cat. F income (after deductible expenses)
 * @param taxa autonomous rate to apply (e.g. 0.25 for the 25% standard rate)
 * @returns the cat. F autonomous collection, in euros (always ≥ 0)
 */
export function calcularColetaAutonomaF(
  rendimentoLiquido: number,
  taxa: number,
): number {
  return Math.max(0, rendimentoLiquido) * taxa;
}
