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
  /** Reference value V = max(14 × RMMG, 1.5 × 14 × IAS). */
  readonly valorReferencia: number;
  /** Upper bound L per n.º 3 — derived from V, LDG, T1 and L1. */
  readonly limiteSuperior: number;
  /** Limite superior do 1.º escalão (L1) — only used by alínea c). */
  readonly limiteEscalao1: number;
  /** `LDG / T1` term — abated in alíneas a) and b) (NOT in c)). */
  readonly ldgSobreTaxa: number;
  /**
   * Deduction term abated by the chosen alínea: `DE + LDG/T1` for a) and b),
   * just `DE` for c). Surfaced so the UI can show exactly what was subtracted.
   */
  readonly termoDeducoes: number;
  /** Multiplier on the income excess: 2.60 (b), 1.35 (c), or `null` (a). */
  readonly coeficiente: number | null;
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
 * The article distinguishes three branches based on the gross income RB. Note
 * the asymmetry of the `LDG/T1` term: it is abated in a) and b) but NOT in c):
 *
 *   a) RB ≤ V          → abatimento = max(0, V − (DE + LDG/T1))
 *   b) V < RB ≤ L      → abatimento = max(0, V − 2.60 × (RB − V) − (DE + LDG/T1))
 *   c) RB > L          → abatimento = max(0, (L − L1) − 1.35 × (RB − L) − DE)
 *
 * In all branches the final value is then capped at `RB − DE` (n.º 2 d)) so
 * the abatement never exceeds the deductible income.
 *
 * Where:
 *   V   = valor de referência (max(14 × RMMG, 1.5 × 14 × IAS))
 *   L   = V − LDG / (T1 × 3.60) + L1 / 3.60 (interpreted so L > V)
 *   LDG = limite das despesas gerais familiares (art. 78.º-B)
 *   T1  = taxa do 1.º escalão
 *   L1  = limite superior do 1.º escalão
 *
 * Verified against a real AT settlement note (RB = 14 381.99, DE = 4 462.15,
 * 2025 constants): with V = 12 180 the income falls in alínea c) and the
 * formula yields 641.34 €, matching the AT to the cent. The coefficients (2.60,
 * 1.35) are the redação dada pela Lei 33/2024; earlier years used different
 * values (see the GPEARI study "A reforma do mínimo de existência", 2023).
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
  // `max(14 × RMMG, 1.5 × 14 × IAS)` decision.
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

  // The `LDG/T1` term, abated only in alíneas a) and b).
  const ldgSobreTaxa = ldg / t1;

  let alinea: AlineaMinimoExistencia;
  let coeficiente: number | null;
  let termoDeducoes: number;
  let valorBruto: number;
  if (rb <= v) {
    // n.º 2 a) — abatimento = V − (DE + LDG/T1).
    alinea = 'a';
    coeficiente = null;
    termoDeducoes = de + ldgSobreTaxa;
    valorBruto = v - termoDeducoes;
  } else if (rb <= limiteSuperior) {
    // n.º 2 b) — abatimento = V − 2.60 × (RB − V) − (DE + LDG/T1).
    alinea = 'b';
    coeficiente = 2.6;
    termoDeducoes = de + ldgSobreTaxa;
    valorBruto = v - coeficiente * (rb - v) - termoDeducoes;
  } else {
    // n.º 2 c) — abatimento = (L − L1) − 1.35 × (RB − L) − DE.
    // The LDG/T1 term is NOT abated here (asymmetry of the law).
    alinea = 'c';
    coeficiente = 1.35;
    termoDeducoes = de;
    valorBruto = limiteSuperior - l1 - coeficiente * (rb - limiteSuperior) - termoDeducoes;
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
    limiteEscalao1: l1,
    ldgSobreTaxa,
    termoDeducoes,
    coeficiente,
    valorBruto,
    capAlineaD,
    valor,
    capAplicado,
  };
}
