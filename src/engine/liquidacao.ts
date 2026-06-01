import type { TaxYearConfig } from '@/tax-data/types';
import { calcularColetaMetodo3, type ColetaResult } from './coleta';
import {
  calcularDeducaoEspecifica,
  calcularDeducaoEspecificaCategoria,
  type DeducaoEspecificaCategoria,
} from './escaloes';

/**
 * Inputs for a settlement-note-style calculation.
 *
 * Mirrors (a subset of) the fields a contribuinte fills in the Modelo 3.
 * Optional fields default to zero / sensible neutral values.
 */
export interface LiquidacaoInput {
  /**
   * Gross income (sum of all category A/H rendimentos do agregado).
   *
   * When the per-category fields ({@link rendimentoTrabalho} /
   * {@link rendimentoPensoes}) are provided, this is derived as their sum and
   * any value passed here is ignored. It remains the canonical persisted field
   * so legacy (single-income) exercises keep loading without a schema bump.
   */
  readonly rendimentoBruto: number;
  /**
   * Gross income of category A (trabalho dependente), in euros. Optional.
   * When present (alongside or instead of {@link rendimentoPensoes}), the
   * engine computes the specific deduction PER category and caps each at its
   * own income — matching the AT settlement note.
   */
  readonly rendimentoTrabalho?: number;
  /** Mandatory social-security contributions for category A, in euros. */
  readonly contribuicoesTrabalho?: number;
  /** Gross income of category H (pensões), in euros. Optional. */
  readonly rendimentoPensoes?: number;
  /**
   * Optional override for the specific deduction. Used only in the legacy
   * single-income path (when no per-category field is provided). If omitted,
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
  /**
   * Per-category breakdown of {@link deducaoEspecifica}. Present only when the
   * input used the per-category fields; omitted in the legacy single-income
   * path. Lets the UI explain how the deduction was reached.
   */
  readonly deducaoEspecificaDetalhe?: readonly DeducaoEspecificaCategoria[];
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
    rendimentoTrabalho,
    contribuicoesTrabalho = 0,
    rendimentoPensoes,
    deducoesColeta = 0,
    beneficioMunicipalPct = 0,
    retencaoFonte = 0,
    quocienteFamiliar = 1,
  } = input;

  // Per-category path: when any category-specific income is provided, the
  // specific deduction is computed for each category and capped at that
  // category's own income (matching the AT settlement note). Otherwise we keep
  // the legacy single-income behaviour.
  const usaCategorias =
    rendimentoTrabalho !== undefined || rendimentoPensoes !== undefined;

  let rendimentoBruto: number;
  let deducaoEspecifica: number;
  let deducaoEspecificaDetalhe: readonly DeducaoEspecificaCategoria[] | undefined;

  if (usaCategorias) {
    const detalhe: DeducaoEspecificaCategoria[] = [];
    if (rendimentoTrabalho !== undefined) {
      detalhe.push(
        calcularDeducaoEspecificaCategoria(
          rendimentoTrabalho,
          config,
          contribuicoesTrabalho,
          'A',
        ),
      );
    }
    if (rendimentoPensoes !== undefined) {
      detalhe.push(
        calcularDeducaoEspecificaCategoria(rendimentoPensoes, config, 0, 'H'),
      );
    }
    rendimentoBruto = detalhe.reduce((sum, d) => sum + d.rendimento, 0);
    deducaoEspecifica = detalhe.reduce((sum, d) => sum + d.valor, 0);
    deducaoEspecificaDetalhe = detalhe;
  } else {
    rendimentoBruto = input.rendimentoBruto;
    deducaoEspecifica = input.deducaoEspecifica ?? calcularDeducaoEspecifica(config);
  }

  // line 06 — rendimento coletável
  const rendimentoColetavel = Math.max(0, rendimentoBruto - deducaoEspecifica);

  // line 10 — base para taxa (após quociente familiar)
  const baseParaTaxa = rendimentoColetavel / quocienteFamiliar;

  // lines 11–18 — coleta total (multiplica de volta pelo quociente)
  const coleta = calcularColetaMetodo3(baseParaTaxa, config);
  const coletaTotal = coleta.coleta * quocienteFamiliar;

  // lines 19–22 — coleta líquida
  // The municipal benefit (participação variável dos municípios) applies to the
  // collection AFTER the deductions to the collection are subtracted — not to
  // the gross coleta total. So deduções à coleta come off first, then the
  // municipal rate applies to whatever remains.
  const coletaAposDeducoes = coletaTotal - deducoesColeta;
  const beneficioMunicipal = Math.max(0, coletaAposDeducoes) * beneficioMunicipalPct;
  const coletaLiquida = coletaAposDeducoes - beneficioMunicipal;

  // line 25 — imposto apurado (negativo = reembolso)
  const impostoApurado = coletaLiquida - retencaoFonte;

  // derived
  const taxaMediaEfetiva = rendimentoBruto > 0 ? coletaLiquida / rendimentoBruto : 0;

  return {
    rendimentoBruto,
    deducaoEspecifica,
    ...(deducaoEspecificaDetalhe ? { deducaoEspecificaDetalhe } : {}),
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
