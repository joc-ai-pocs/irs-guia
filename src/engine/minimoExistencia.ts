import type { TaxYearConfig } from '@/tax-data/types';

/**
 * Discriminates which branch of art. 70.º n.º 2 CIRS applies to a given
 * taxpayer, given their gross income RB relative to the threshold V and the
 * upper bound L.
 */
export type AlineaMinimoExistencia = 'a' | 'b' | 'c';

/**
 * Pedagogical breakdown of the art. 70.º calculation. Every intermediate is
 * exposed so the UI / didactic guide can show which branch fired, with which
 * constants, and whether the alínea d) cap kicked in.
 */
export interface DetalheMinimoExistencia {
  /** Branch of n.º 2 that applied (a/b/c). */
  readonly alinea: AlineaMinimoExistencia;
  /** Gross income (rendimentos brutos) used in the comparison. */
  readonly rendimentosBrutos: number;
  /** Specific deduction passed to the formula. */
  readonly deducaoEspecifica: number;
  /** Reference value V = max(materialized, 1.5 × 14 × IAS). */
  readonly valorReferencia: number;
  /** Upper bound L per n.º 3 — derived from V, LDG, T1 and L1. */
  readonly limiteSuperior: number;
  /** `LDG / T1` — the "soma das deduções específicas com Limite despesas gerais/taxa 1.º escalão". */
  readonly termoDeducoes: number;
  /** Raw output of the alínea formula, before the n.º 2 d) cap. */
  readonly valorBruto: number;
  /** Cap from alínea d): `RB − DE` (the upper bound on the abatement). */
  readonly capAlineaD: number;
  /** Final abatement applied. */
  readonly valor: number;
  /** `true` when the alínea d) cap clamped the formula's output. */
  readonly capAplicado: boolean;
}

/**
 * Computes the "abatimento por mínimo de existência" per art. 70.º CIRS in the
 * redação dada pela Lei 73-A/2024 (e Lei 82/2023 + Lei 34/2024 nas alíneas b)
 * e c)).
 *
 * The article distinguishes three branches based on the gross income RB:
 *
 *   a) RB ≤ V          → abatimento = max(0, V − DE)
 *   b) V < RB ≤ L      → abatimento = max(0, V − 2.60 × (RB − V) − (DE + LDG/T1))
 *   c) RB > L          → abatimento = max(0, L − L1 − 1.35 × (RB − L) − (DE + LDG/T1))
 *
 * In all branches the final value is then capped at `RB − DE` (n.º 2 d)) so
 * the abatement never exceeds the deductible income.
 *
 * Where:
 *   V   = valor de referência (max(12 880, 1.5 × 14 × IAS))
 *   L   = V − (LDG / T1) × 3.60 + L1 / 3.60 (interpreted so L > V)
 *   LDG = limite das despesas gerais familiares (art. 78.º-B)
 *   T1  = taxa do 1.º escalão
 *   L1  = limite superior do 1.º escalão
 *
 * **Caveat — known divergence from AT.** A real AT settlement note (a case the
 * user shared with RB = 14 381.99, DE = 4 462.15) produces abatement 641.34 €,
 * whereas this literal formula yields ~2 512.68 €. The discrepancy hints that
 * the `LDG/T1` term may use a different value than the literal art. 78.º-B
 * limit, or that an additional coefficient is missing in the published text we
 * read. The formula here is the best-effort transcription of the law as
 * available in the Portal das Finanças HTML; refine when the discrepancy is
 * resolved.
 *
 * @param rendimentosBrutos total rendimento bruto (art. 70.º "RB")
 * @param deducaoEspecifica total dedução específica das categorias relevantes
 *                          (cat. A/H — art. 70.º only applies when income is
 *                          predominantly cat. A, H, or activities of art. 151.º)
 * @param config the fiscal year configuration
 */
export function calcularMinimoExistencia(
  rendimentosBrutos: number,
  deducaoEspecifica: number,
  config: TaxYearConfig,
): DetalheMinimoExistencia {
  const rb = Math.max(0, rendimentosBrutos);
  const de = Math.max(0, deducaoEspecifica);

  // n.º 1 — valor de referência. The materialized field already encodes the
  // `max(12 880, 1.5 × 14 × IAS)` decision.
  const v = config.valorReferenciaMinimoExistencia;

  // Constants needed for L (n.º 3) and for the deduction term in alíneas b/c.
  const ldg = config.limiteDespesasGerais;
  const firstBracket = config.escaloes[0];
  if (!firstBracket) throw new Error('Bracket table is empty — configuration error.');
  const t1 = firstBracket.taxaNormal;
  const l1 = firstBracket.limiteSuperior;

  // n.º 3 — L = V − LDG/(T1 × 3.60) + L1/3.60. Two parses of the text are
  // possible; we pick the one that yields L > V (the alternative collapses
  // alíneas b/c into a single sub-interval, which contradicts the law's
  // tripartite structure).
  const limiteSuperior = v - ldg / (t1 * 3.6) + l1 / 3.6;

  // Common deduction term for alíneas b) and c).
  const termoDeducoes = de + ldg / t1;

  let alinea: AlineaMinimoExistencia;
  let valorBruto: number;
  if (rb <= v) {
    // n.º 2 a)
    alinea = 'a';
    valorBruto = v - de;
  } else if (rb <= limiteSuperior) {
    // n.º 2 b)
    alinea = 'b';
    valorBruto = v - 2.6 * (rb - v) - termoDeducoes;
  } else {
    // n.º 2 c)
    alinea = 'c';
    valorBruto = limiteSuperior - l1 - 1.35 * (rb - limiteSuperior) - termoDeducoes;
  }

  // n.º 2 d) — clamp to [0, RB − DE].
  const capAlineaD = Math.max(0, rb - de);
  const positivo = Math.max(0, valorBruto);
  const valor = Math.min(positivo, capAlineaD);
  const capAplicado = positivo > capAlineaD;

  return {
    alinea,
    rendimentosBrutos: rb,
    deducaoEspecifica: de,
    valorReferencia: v,
    limiteSuperior,
    termoDeducoes,
    valorBruto,
    capAlineaD,
    valor,
    capAplicado,
  };
}
