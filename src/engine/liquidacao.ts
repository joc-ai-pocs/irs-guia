import type { TaxYearConfig } from '@/tax-data/types';
import { calcularColetaMetodo3, type ColetaResult } from './coleta';
import {
  calcularDeducaoEspecifica,
  calcularDeducaoEspecificaCategoria,
  type DeducaoEspecificaCategoria,
} from './escaloes';
import {
  calcularColetaAutonomaF,
  calcularDeducaoCategoriaF,
  obterTaxaCatF,
  type DespesasCatF,
  type DeducaoCategoriaF,
  type DuracaoContratoF,
} from './categoriaF';
import { calcularMinimoExistencia, type DetalheMinimoExistencia } from './minimoExistencia';

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
   * Gross rents (cat. F), in euros. Optional. When present, the engine
   * computes a cat. F autonomous collection (art. 72.º CIRS) by default. The
   * deductible expenses are subtracted before the rate is applied (art. 41.º).
   */
  readonly rendasBrutas?: number;
  /** Itemized deductible expenses for cat. F (IMI, condomínio, conservação). */
  readonly despesasCatF?: DespesasCatF;
  /**
   * Lease-duration bucket selecting the autonomous rate (25/15/10/5%).
   * Defaults to {@link DuracaoContratoF#padrao} (25%).
   */
  readonly duracaoCatF?: DuracaoContratoF;
  /**
   * Tax withheld at source on the rents (typically 25%, only applicable when
   * the tenant is a corporate entity). Subtracted from the total imposto at
   * line 24. Optional, defaults to 0.
   */
  readonly retencaoCatF?: number;
  /**
   * Whether the contribuinte opted to include cat. F income in the progressive
   * brackets (art. 22.º — opção pelo englobamento). When `true`, cat. F net
   * income is added to the progressive base instead of being taxed at the
   * autonomous rate. Defaults to `false` (the AT default).
   */
  readonly englobarCatF?: boolean;
  /**
   * Imputação especial cat. B (Anexo D — art. 20.º CIRS) — matéria coletável
   * imputada ao sócio por sociedade sujeita ao regime de transparência fiscal
   * (art. 6.º CIRC). Já vem como rendimento líquido: soma diretamente ao
   * rendimento coletável progressivo (sem dedução específica).
   */
  readonly imputacaoCatB?: number;
  /**
   * IRC retido na fonte sobre os rendimentos da sociedade transparente,
   * imputado ao sócio (Anexo D, quadro 4). Abate-se à retenção total (linha 24).
   */
  readonly retencaoCatB?: number;
  /**
   * Pagamentos por conta efetuados pela sociedade transparente, imputados ao
   * sócio (Anexo D, quadro 4). Aparecem na linha 23 da nota — abatem-se antes
   * da retenção na fonte.
   */
  readonly pagamentosContaCatB?: number;
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
  // line 01–05
  /**
   * Line 01 — total gross income across all included categories
   * (cat. A + cat. H + cat. B imputado, plus cat. F gross rents when the
   * contribuinte opted for englobamento). Cat. F rents taxed autonomously
   * (englobamento OFF) are NOT counted here — they sit outside the progressive
   * base. Mirrors the "Rendimento global" line of the AT settlement note.
   */
  readonly rendimentoBruto: number;
  readonly deducaoEspecifica: number;
  /**
   * Line 04 — abatimento por mínimo de existência (art. 70.º n.º 1 al. b) CIRS).
   * Automatically derived from the taxable base via {@link calcularMinimoExistencia};
   * see that function for the caveat about the simplified formula.
   */
  readonly abatimentoMinimoExistencia: number;
  /**
   * Full breakdown of the abatimento por mínimo de existência (which alínea
   * fired, V, L, the term subtracted, the cap). Lets the UI explain how the
   * abatement was reached. Always present (mirrors {@link abatimentoMinimoExistencia}).
   */
  readonly abatimentoMinimoExistenciaDetalhe: DetalheMinimoExistencia;
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

  /**
   * Cat. F (rendimentos prediais) sub-result. Present only when the input
   * carried any cat. F field; omitted otherwise. Includes the deduction
   * breakdown, the chosen rate, the autonomous collection (zero when
   * englobamento is on), and the cat. F-specific retention.
   */
  readonly catF?: {
    readonly deducao: DeducaoCategoriaF;
    readonly taxa: number;
    readonly duracao: DuracaoContratoF;
    /** Autonomous collection (€) — `rendimentoLiquido × taxa`. Zero when englobada. */
    readonly coletaAutonoma: number;
    readonly retencao: number;
    readonly englobada: boolean;
  };

  /**
   * Total tax due in the period — `coletaLiquida + (catF.coletaAutonoma ?? 0)`.
   * Equivalent to {@link coletaLiquida} when there is no cat. F or the income
   * was englobed (the cat. F portion is already inside coletaLiquida).
   */
  readonly impostoTotal: number;

  /**
   * Anexo D (imputação especial cat. B — art. 20.º CIRS) sub-result. Present
   * only when the input carried any cat. B field; omitted otherwise. The
   * imputed taxable matter is already inside {@link rendimentoColetavel};
   * retentions feed into {@link retencaoFonte}, and pagamentos por conta are
   * exposed below for the AT settlement-note line 23.
   */
  readonly catB?: {
    readonly imputacao: number;
    readonly retencao: number;
    readonly pagamentosConta: number;
  };

  // line 23–25
  /**
   * Total pagamentos por conta abated at line 23 (currently sourced only from
   * cat. B imputed amounts; zero when no cat. B input is present).
   */
  readonly pagamentosConta: number;
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
 * Currently covers cat. A/H/F income plus cat. B via Anexo D (imputação
 * especial, art. 20.º CIRS), in individual or joint regime. Cat. F is taxed
 * autonomously by default (art. 72.º), with optional englobamento (art. 22.º).
 * Generic cat. B (Anexo B — recibos verdes, art. 31.º coeficientes) and
 * dependents are NOT yet modelled.
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
    rendasBrutas,
    despesasCatF,
    duracaoCatF = 'padrao',
    retencaoCatF = 0,
    englobarCatF = false,
    imputacaoCatB,
    retencaoCatB = 0,
    pagamentosContaCatB = 0,
    deducoesColeta = 0,
    beneficioMunicipalPct = 0,
    retencaoFonte = 0,
    quocienteFamiliar = 1,
  } = input;

  // Cat. F (rendimentos prediais) is opt-in: only computed when any cat. F
  // field is provided. The deduction breakdown drives both the autonomous
  // collection and (when englobada) the addition to the progressive base.
  const temCatF = rendasBrutas !== undefined;
  const catFDeducao = temCatF
    ? calcularDeducaoCategoriaF(rendasBrutas, despesasCatF)
    : null;
  const taxaCatF = obterTaxaCatF(config, duracaoCatF);

  // Cat. B (Anexo D — imputação especial / transparência fiscal). Per art. 20.º
  // CIRS, the imputed amount enters as net income in category B and is added
  // directly to the progressive base — there is no separate "specific deduction"
  // (it is already matéria coletável, not gross income).
  const temCatB = imputacaoCatB !== undefined;
  const valorImputado = temCatB ? Math.max(0, imputacaoCatB) : 0;

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
    // The cat. A/H specific deduction can only absorb cat. A/H income — when
    // the legacy single-income field is 0 (e.g. someone with ONLY cat. B
    // imputado or ONLY cat. F rents), no cat. A/H deduction applies.
    deducaoEspecifica =
      rendimentoBruto > 0
        ? (input.deducaoEspecifica ?? calcularDeducaoEspecifica(config))
        : 0;
  }

  // Income from cat. A/H — the categories art. 70.º protects. Captured BEFORE
  // cat. B and englobed cat. F join the base, for the predominance test below.
  const rendimentoCatAH = rendimentoBruto;

  // Cat. B (Anexo D) — imputação especial joins the GROSS income (line 01) per
  // art. 20.º CIRS. The specific deduction (which only covers cat. A/H) is not
  // applied to it; what it ultimately escapes is the {@link rendimentoColetavel}
  // formula below, which subtracts only deducaoEspecifica (a cat. A/H quantity).
  rendimentoBruto += valorImputado;

  // Cat. F com opção pelo englobamento (art. 22.º): as rendas brutas entram no
  // rendimento global (linha 01) e as despesas dedutíveis (art. 41.º) entram na
  // dedução específica global — espelhando a nota de liquidação da AT, que
  // engloba a cat. F em "Rendimento global" e "Deduções específicas" em vez de
  // somar o líquido à parte. O líquido fica assim dentro de RB − DE.
  const englobaCatF = temCatF && englobarCatF;
  if (englobaCatF && catFDeducao) {
    rendimentoBruto += catFDeducao.rendasBrutas;
    deducaoEspecifica += catFDeducao.despesasTotal;
  }

  // line 04 — abatimento por mínimo de existência (art. 70.º CIRS), computado a
  // partir do rendimento bruto englobado e da dedução específica — ver
  // calcularMinimoExistencia para a fórmula das 3 alíneas (a/b/c).
  // Só se aplica quando o rendimento é predominantemente da cat. A/H (ou
  // art. 151.º, não modelado) — n.º 1. Rendimento predominantemente predial
  // (cat. F) ou de imputação (cat. B) não é protegido, pelo que o abatimento
  // não se aplica (senão a fórmula zerá-lo-ia indevidamente via o teto d)).
  const art70Aplicavel =
    rendimentoCatAH > 0 && rendimentoCatAH >= 0.5 * rendimentoBruto;
  const minExistencia = calcularMinimoExistencia(
    rendimentoBruto,
    deducaoEspecifica,
    config,
  );
  const abatimentoMinimoExistencia = art70Aplicavel ? minExistencia.valor : 0;
  const abatimentoMinimoExistenciaDetalhe = art70Aplicavel
    ? minExistencia
    : { ...minExistencia, valor: 0 };

  // line 05 — rendimento coletável. A cat. F englobada já está dentro de
  // rendimentoBruto − deducaoEspecifica (englobada acima), por isso não há
  // acréscimo separado aqui.
  const rendimentoColetavel = Math.max(
    0,
    rendimentoBruto - deducaoEspecifica - abatimentoMinimoExistencia,
  );

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

  // Cat. F autonomous collection — only when englobamento is OFF. When ON the
  // cat. F net income was already added to the progressive base and is now
  // inside coletaLiquida; no separate autonomous tax applies.
  const coletaAutonomaCatF =
    catFDeducao && !englobaCatF
      ? calcularColetaAutonomaF(catFDeducao.rendimentoLiquido, taxaCatF)
      : 0;

  const impostoTotal = coletaLiquida + coletaAutonomaCatF;

  // line 23 — pagamentos por conta (only sourced from cat. B today).
  const pagamentosConta = temCatB ? pagamentosContaCatB : 0;

  // line 24 — total retentions (cat. A/H + cat. F + cat. B) abated from the imposto.
  const retencaoTotal =
    retencaoFonte + (temCatF ? retencaoCatF : 0) + (temCatB ? retencaoCatB : 0);

  // line 25 — imposto apurado (negativo = reembolso). Pagamentos por conta
  // come off first (line 23), then the retentions (line 24).
  const impostoApurado = impostoTotal - pagamentosConta - retencaoTotal;

  // derived: now uses impostoTotal so cat. F contribution is visible in the
  // effective average rate. rendimentoBruto already includes cat. B imputado
  // (and cat. F gross rents when englobada); we add the cat. F gross rents on
  // top ONLY when they are taxed autonomously (englobamento OFF), since those
  // sit outside the progressive base.
  const baseRendimento =
    rendimentoBruto +
    (temCatF && catFDeducao && !englobaCatF ? catFDeducao.rendasBrutas : 0);
  const taxaMediaEfetiva = baseRendimento > 0 ? impostoTotal / baseRendimento : 0;

  const catF =
    temCatF && catFDeducao
      ? {
          deducao: catFDeducao,
          taxa: englobaCatF ? 0 : taxaCatF,
          duracao: duracaoCatF,
          coletaAutonoma: coletaAutonomaCatF,
          retencao: retencaoCatF,
          englobada: englobaCatF,
        }
      : undefined;

  const catB = temCatB
    ? {
        imputacao: valorImputado,
        retencao: retencaoCatB,
        pagamentosConta: pagamentosContaCatB,
      }
    : undefined;

  return {
    rendimentoBruto,
    deducaoEspecifica,
    ...(deducaoEspecificaDetalhe ? { deducaoEspecificaDetalhe } : {}),
    abatimentoMinimoExistencia,
    abatimentoMinimoExistenciaDetalhe,
    rendimentoColetavel,
    baseParaTaxa,
    coleta,
    coletaTotal,
    deducoesColeta,
    beneficioMunicipal,
    coletaLiquida,
    ...(catF ? { catF } : {}),
    impostoTotal,
    ...(catB ? { catB } : {}),
    pagamentosConta,
    retencaoFonte: retencaoTotal,
    impostoApurado,
    taxaMediaEfetiva,
  };
}
