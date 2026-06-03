/**
 * Tax data layer — type definitions
 *
 * These types form the contract between the static tax configuration
 * (per fiscal year) and the calculation engine. The engine MUST work
 * against these types only, never against hardcoded constants.
 *
 * Adding support for a new tax year means dropping a new file in this
 * folder that satisfies {@link TaxYearConfig} — no engine changes.
 */

/**
 * A single bracket in the progressive income tax table (art. 68.º CIRS).
 *
 * The three method-3 fields ({@link taxaNormal}, {@link parcelaAbater})
 * are sufficient to compute the canonical collection used by the AT.
 * {@link taxaMedia} is provided for didactic reference (methods 1–2).
 */
export interface Escalao {
  /** 1-indexed bracket number (1 to N). */
  readonly numero: number;

  /** Inclusive upper limit, in euros. Use {@link Number.POSITIVE_INFINITY} for the last bracket. */
  readonly limiteSuperior: number;

  /** Marginal rate applied to income falling in this bracket (e.g. 0.215 for 21.5%). */
  readonly taxaNormal: number;

  /**
   * Effective cumulative rate at the upper limit of the PREVIOUS bracket.
   * {@link null} for the last bracket (no closed upper limit).
   */
  readonly taxaMedia: number | null;

  /** Amount to subtract after applying {@link taxaNormal} to the full taxable income (method 3). */
  readonly parcelaAbater: number;
}

/**
 * Reference to an official source (Portal das Finanças, Diário da República, etc.)
 * Used inline in {@link TaxYearConfig.fontes} so every fiscal constant can be traced.
 */
export interface FonteOficial {
  readonly id: string;
  readonly label: string;
  readonly url: string;
}

/**
 * A "deduction to the collection" (post-tax credit, e.g. health, education).
 * These are conceptually mostly authority-computed (via e-fatura) but the
 * legal limits are well-known per year.
 */
export interface DeducaoColeta {
  readonly id: string;
  readonly label: string;
  /** Percentage of the expense that is deductible (0–1). */
  readonly percentagem: number;
  /** Maximum euro amount deductible. */
  readonly tetoEuros: number;
  /** Free-form note (limits per dependent, age conditions, etc.). */
  readonly nota?: string;
  /** ID into {@link TaxYearConfig.fontes}. */
  readonly fonteId: string;
}

/**
 * Full fiscal-year configuration. One file per year under tax-data/.
 *
 * @example
 *   import { config2025 } from '@/tax-data/2025';
 *   import { calcularColeta } from '@/engine/coleta';
 *   const result = calcularColeta(15650, config2025);
 */
export interface TaxYearConfig {
  /** The year the income was earned (e.g. 2025 for the declaration filed in 2026). */
  readonly ano: number;
  /** The civil year in which the declaration is filed. */
  readonly anoDeclaracao: number;
  /**
   * True while this year's values are provisional — i.e. not yet verified
   * against the official Portal das Finanças sources. The UI uses this to
   * warn users before they rely on the numbers. Omit once verified.
   */
  readonly provisorio?: boolean;
  /** Human-readable label for the controlling statute. */
  readonly diplomaLegal: string;
  /** Value of IAS (Indexante dos Apoios Sociais) in euros. */
  readonly ias: number;
  /** Coefficient applied to {@link ias} to determine cat. A/H specific deduction (currently 8.54). */
  readonly deducaoEspecificaCoef: number;
  /**
   * Minimum specific deduction in euros for cat. A/H.
   * Derived from {@link ias} × {@link deducaoEspecificaCoef}, but materialized here
   * so callers don't have to recompute (and so historical rounding is preserved).
   */
  readonly deducaoEspecificaMinima: number;
  /**
   * Valor de referência do mínimo de existência (art. 70.º n.º 1 CIRS).
   * Equals `max(14 × RMMG do ano, 1.5 × 14 × IAS)` (e.g. 11 480 em 2024,
   * 12 180 em 2025, 12 880 em 2026). Stored as a materialized euro figure so
   * historical rounding is preserved.
   */
  readonly valorReferenciaMinimoExistencia: number;
  /**
   * Limite anual da dedução à coleta para "Despesas gerais familiares"
   * (art. 78.º-B CIRS), in euros — used by art. 70.º n.º 2 b) and c) as part
   * of the abatimento formula. Currently €250 per sujeito passivo.
   */
  readonly limiteDespesasGerais: number;
  /**
   * Autonomous taxation rates for category F (rendimentos prediais), per
   * art. 72.º n.º 1 al. e) and n.º 2 a 5 CIRS. The 25% standard rate is the
   * AT default; reduced rates apply when the lease contract has a minimum
   * duration as listed below.
   */
  readonly taxasCatF: {
    /** Default rate (short-term or open-ended leases) — currently 25%. */
    readonly padrao: number;
    /** Lease duration {@code >5 ≤ 10} years. */
    readonly duracao5a10: number;
    /** Lease duration {@code >10 ≤ 20} years. */
    readonly duracao10a20: number;
    /** Lease duration {@code >20} years. */
    readonly duracao20mais: number;
  };
  /** Progressive brackets of art. 68.º CIRS. Must be ordered by {@link Escalao.numero}. */
  readonly escaloes: readonly Escalao[];
  /** Known limits for deductions to the collection. */
  readonly deducoesColeta: readonly DeducaoColeta[];
  /** Indexed registry of official source URLs referenced elsewhere in this config. */
  readonly fontes: Readonly<Record<string, FonteOficial>>;
}
