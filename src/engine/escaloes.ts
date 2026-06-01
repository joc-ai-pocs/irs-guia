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

/** Income tax categories handled by the specific-deduction logic. */
export type CategoriaRendimento = 'A' | 'H';

/**
 * Detailed breakdown of the specific deduction for ONE income category.
 *
 * Exposes every intermediate value so the UI can explain how the final
 * {@link valor} was reached (which branch of the `max` won, and whether the
 * deduction was capped at the category's own income).
 */
export interface DeducaoEspecificaCategoria {
  /** The income category this breakdown refers to. */
  readonly categoria: CategoriaRendimento;
  /** Gross income of this category, in euros. */
  readonly rendimento: number;
  /** IAS-based minimum ({@link TaxYearConfig.deducaoEspecificaMinima}). */
  readonly minimo: number;
  /** Mandatory social-security contributions considered (0 when not applicable). */
  readonly contribuicoes: number;
  /** Uncapped deduction — `max(minimo, contribuicoes)`. */
  readonly valorBruto: number;
  /** `true` when {@link rendimento} is below {@link valorBruto}, so the deduction was capped. */
  readonly limitadoPorRendimento: boolean;
  /** Effective deduction — `min(rendimento, valorBruto)`. */
  readonly valor: number;
}

/**
 * Computes the specific deduction for a SINGLE income category (cat. A or H),
 * capped at the category's own gross income.
 *
 * Per art. 25.º (cat. A) / art. 53.º (cat. H) CIRS, the deduction is the
 * greater of the IAS-based minimum and the mandatory contributions, but it can
 * never exceed the category's income — a pension of 3 571,62 € cannot generate
 * a deduction larger than 3 571,62 €.
 *
 * Unlike {@link calcularDeducaoEspecifica}, which treats all income as one
 * stream, this function must be applied per category and summed, otherwise the
 * income cap is lost for low-income categories (e.g. a small pension alongside
 * a larger salary).
 *
 * @param rendimento gross income of the category, in euros
 * @param config the fiscal year configuration
 * @param contribuicoesObrigatorias mandatory contributions for this category (default 0)
 * @param categoria the income category (for labelling the breakdown)
 * @returns the full breakdown, including the capped {@link DeducaoEspecificaCategoria.valor}
 */
export function calcularDeducaoEspecificaCategoria(
  rendimento: number,
  config: TaxYearConfig,
  contribuicoesObrigatorias: number = 0,
  categoria: CategoriaRendimento = 'A',
): DeducaoEspecificaCategoria {
  const minimo = config.deducaoEspecificaMinima;
  const rendimentoNaoNegativo = Math.max(0, rendimento);
  const valorBruto = Math.max(minimo, contribuicoesObrigatorias);
  const valor = Math.min(rendimentoNaoNegativo, valorBruto);
  return {
    categoria,
    rendimento: rendimentoNaoNegativo,
    minimo,
    contribuicoes: contribuicoesObrigatorias,
    valorBruto,
    limitadoPorRendimento: rendimentoNaoNegativo < valorBruto,
    valor,
  };
}
