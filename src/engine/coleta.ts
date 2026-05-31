import type { Escalao, TaxYearConfig } from '@/tax-data/types';
import { findEscalao } from './escaloes';

/**
 * Detailed result of a collection ("coleta") calculation, regardless of method.
 */
export interface ColetaResult {
  /** The bracket the taxable income fell into. */
  readonly escalao: Escalao;
  /** Coletável × {@link Escalao.taxaNormal} — line 11 of the AT settlement note. */
  readonly importanciaApurada: number;
  /** {@link Escalao.parcelaAbater} — line 12. */
  readonly parcelaAbater: number;
  /** Final collection in euros (line 18 of the AT settlement note). */
  readonly coleta: number;
}

/**
 * One sliced contribution when computing the collection by method 2 (didactic).
 */
export interface FatiaColeta {
  readonly escalao: Escalao;
  /** Width of the income slice falling in this bracket, in euros. */
  readonly fatia: number;
  /** {@link fatia} × {@link Escalao.taxaNormal}. */
  readonly imposto: number;
}

/**
 * Computes the collection by Method 3 (art. 68.º n.º 2 CIRS) — the canonical
 * approach used by the AT: collection = coletavel × taxaNormal − parcelaAbater.
 *
 * This is a pure function: same input → same output, no side effects.
 *
 * @param coletavel taxable income in euros (after quociente familiar division)
 * @param config the fiscal year configuration
 * @returns detailed breakdown of the calculation
 *
 * @example
 *   const result = calcularColetaMetodo3(15650, config2025);
 *   // result.escalao.numero === 3
 *   // result.coleta ≈ 2413.84
 */
export function calcularColetaMetodo3(
  coletavel: number,
  config: TaxYearConfig,
): ColetaResult {
  const escalao = findEscalao(coletavel, config.escaloes);
  const importanciaApurada = coletavel * escalao.taxaNormal;
  const coleta = importanciaApurada - escalao.parcelaAbater;
  return {
    escalao,
    importanciaApurada,
    parcelaAbater: escalao.parcelaAbater,
    coleta,
  };
}

/**
 * Computes the collection by Method 2 (didactic) — slice the income across
 * brackets and apply each bracket's marginal rate to its slice.
 *
 * Mathematically equivalent to {@link calcularColetaMetodo3}, may differ by
 * a few cents due to rounding in {@link Escalao.taxaMedia}. Useful for
 * visualization (the "sliced income" component in the UI).
 *
 * @param coletavel taxable income in euros
 * @param config the fiscal year configuration
 * @returns the per-bracket slices and total collection
 */
export function calcularColetaMetodo2(
  coletavel: number,
  config: TaxYearConfig,
): { readonly fatias: readonly FatiaColeta[]; readonly coleta: number } {
  const fatias: FatiaColeta[] = [];
  let restante = coletavel;
  let limiteAnterior = 0;

  for (const escalao of config.escaloes) {
    if (restante <= 0) break;

    const larguraDoEscalao =
      escalao.limiteSuperior === Number.POSITIVE_INFINITY
        ? restante
        : escalao.limiteSuperior - limiteAnterior;
    const fatia = Math.min(restante, larguraDoEscalao);
    const imposto = fatia * escalao.taxaNormal;

    fatias.push({ escalao, fatia, imposto });
    restante -= fatia;
    limiteAnterior = escalao.limiteSuperior;
  }

  const coleta = fatias.reduce((sum, f) => sum + f.imposto, 0);
  return { fatias, coleta };
}
