import type { TaxYearConfig } from '@/tax-data/types';
import { calcularColetaMetodo3, type ColetaResult } from './coleta';
import { calcularDeducaoEspecifica } from './escaloes';

/**
 * Inputs for a settlement-note-style calculation.
 *
 * Mirrors (a subset of) the fields a contribuinte fills in the Modelo 3.
 * Optional fields default to zero / sensible neutral values.
 */
export interface LiquidacaoInput {
  /** Gross income (sum of all category A/H rendimentos do agregado). */
  readonly rendimentoBruto: number;
  /**
   * Optional override for the specific deduction. If omitted,
   * {@link calcularDeducaoEspecifica} is used with the year's IAS-based minimum.
   */
  readonly deducaoEspecifica?: number;
  /** Sum of "deductions to the collection" (saúde, educação, etc.). */
  readonly deducoesColeta?: number;
  /** Municipal devolution rate (0–0.05 for the 5% maximum). */
  readonly beneficioMunicipalPct?: number;
  /** Total tax withheld at source during the year. */
  readonly retencaoFonte?: number;
  /**
   * "Quociente familiar" — 1 for individual taxation, 2 for joint of a married couple.
   * Defaults to 1.
   */
  readonly quocienteFamiliar?: number;
}

/**
 * Detailed output of a settlement-note-style calculation.
 *
 * Field names map deliberately to the AT settlement note rubrics, so a
 * contribuinte can place the engine output side-by-side with the document
 * received from the tax authority and reconcile each line.
 */
export interface LiquidacaoResult {
  // line 01–06
  readonly rendimentoBruto: number;
  readonly deducaoEspecifica: number;
  readonly rendimentoColetavel: number;

  // line 10–18
  readonly baseParaTaxa: number;
  readonly coleta: ColetaResult;
  readonly coletaTotal: number;

  // line 19–22
  readonly deducoesColeta: number;
  readonly beneficioMunicipal: number;
  readonly coletaLiquida: number;

  // line 23–25
  readonly retencaoFonte: number;
  /** Negative => reembolso; positive => imposto a pagar. */
  readonly impostoApurado: number;

  // useful derived metrics
  readonly taxaMediaEfetiva: number;
}

/**
 * Orchestrates the full IRS calculation pipeline as represented in the AT
 * settlement note. Reuses {@link calcularColetaMetodo3} for the bracket logic
 * and adds the surrounding accounting (withholdings, municipal benefit, etc.).
 *
 * Currently covers cat. A/H income in individual or joint regime.
 * Cat. F (rendas), Cat. B (Anexo D/transparência fiscal) and dependents
 * are NOT yet modeled and live in dedicated engine modules to be added.
 *
 * @param input the contribuinte's situation
 * @param config the fiscal year configuration
 * @returns a fully expanded settlement-note-style result
 */
export function calcularLiquidacao(
  input: LiquidacaoInput,
  config: TaxYearConfig,
): LiquidacaoResult {
  const {
    rendimentoBruto,
    deducaoEspecifica = calcularDeducaoEspecifica(config),
    deducoesColeta = 0,
    beneficioMunicipalPct = 0,
    retencaoFonte = 0,
    quocienteFamiliar = 1,
  } = input;

  // line 06 — rendimento coletável
  const rendimentoColetavel = Math.max(0, rendimentoBruto - deducaoEspecifica);

  // line 10 — base para taxa (após quociente familiar)
  const baseParaTaxa = rendimentoColetavel / quocienteFamiliar;

  // lines 11–18 — coleta total (multiplica de volta pelo quociente)
  const coleta = calcularColetaMetodo3(baseParaTaxa, config);
  const coletaTotal = coleta.coleta * quocienteFamiliar;

  // lines 19–22 — coleta líquida
  const beneficioMunicipal = coletaTotal * beneficioMunicipalPct;
  const coletaLiquida = coletaTotal - deducoesColeta - beneficioMunicipal;

  // line 25 — imposto apurado (negativo = reembolso)
  const impostoApurado = coletaLiquida - retencaoFonte;

  // derived
  const taxaMediaEfetiva = rendimentoBruto > 0 ? coletaLiquida / rendimentoBruto : 0;

  return {
    rendimentoBruto,
    deducaoEspecifica,
    rendimentoColetavel,
    baseParaTaxa,
    coleta,
    coletaTotal,
    deducoesColeta,
    beneficioMunicipal,
    coletaLiquida,
    retencaoFonte,
    impostoApurado,
    taxaMediaEfetiva,
  };
}
