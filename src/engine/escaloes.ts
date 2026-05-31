import type { Escalao, TaxYearConfig } from '@/tax-data/types';

/**
 * Returns the bracket containing the given taxable income amount.
 *
 * The lookup is inclusive on the upper bound: an income of exactly 8 059 €
 * resolves to the 1st bracket (≤ 8 059), not the 2nd. This matches the
 * AT interpretation of "até X" in art. 68.º.
 *
 * @param coletavel positive taxable income in euros (after quociente familiar)
 * @param escaloes the ordered bracket table (typically {@link TaxYearConfig.escaloes})
 * @returns the matching bracket
 * @throws {Error} if {@link escaloes} is empty (config error)
 */
export function findEscalao(
  coletavel: number,
  escaloes: readonly Escalao[],
): Escalao {
  if (escaloes.length === 0) {
    throw new Error('Bracket table is empty — configuration error.');
  }

  for (const e of escaloes) {
    if (coletavel <= e.limiteSuperior) {
      return e;
    }
  }

  // Should be unreachable because the last bracket has Number.POSITIVE_INFINITY,
  // but the fallback protects against malformed configs.
  const last = escaloes[escaloes.length - 1];
  if (!last) {
    throw new Error('Bracket table is empty — configuration error.');
  }
  return last;
}

/**
 * Calculates the specific deduction (cat. A/H) given the year's IAS-based minimum
 * and an optional override from mandatory social-security contributions.
 *
 * Per art. 25.º n.º 1 al. b) CIRS, if obligatory contributions to SS/ADSE/CGA
 * exceed the IAS-based minimum, the larger value is used.
 *
 * @param config the fiscal year configuration
 * @param contribuicoesObrigatorias optional total of mandatory contributions in euros
 * @returns the effective specific deduction in euros
 */
export function calcularDeducaoEspecifica(
  config: TaxYearConfig,
  contribuicoesObrigatorias?: number,
): number {
  const minimo = config.deducaoEspecificaMinima;
  if (contribuicoesObrigatorias === undefined) {
    return minimo;
  }
  return Math.max(minimo, contribuicoesObrigatorias);
}
