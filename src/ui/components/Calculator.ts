import type { TaxYearConfig } from '@/tax-data/types';
import {
  calcularLiquidacao,
  type DeducaoEspecificaCategoria,
  type DetalheMinimoExistencia,
  type DuracaoContratoF,
  type LiquidacaoInput,
  type LiquidacaoResult,
} from '@/engine';
import { h } from '@/ui/dom';
import { formatEUR, formatPercent } from '@/ui/format';
import { FormulaBlock, type FormulaSegment } from './FormulaBlock';
import './Calculator.css';

/**
 * Sub-groups of input fields, driven by which Modelo 3 anexos the user has
 * opted in to. When a group is hidden, its inputs are removed from the engine
 * payload (so the calculation reflects the chosen scope) but their DOM stays
 * mounted with the values preserved — re-enabling restores the prior state.
 */
export interface VisibleGroups {
  /** Cat. A inputs (trabalho dependente + contribuições). */
  readonly trabalho: boolean;
  /** Cat. H input (pensões). */
  readonly pensoes: boolean;
  /** Cat. F inputs (rendas brutas + despesas + taxa + retenção + englobamento). */
  readonly catF: boolean;
  /** Cat. B / Anexo D inputs (imputação especial + retenção + pag. por conta). */
  readonly catB: boolean;
  /** Anexo H inputs (deduções à coleta + benefício municipal). */
  readonly deducoesColeta: boolean;
}

export const DEFAULT_VISIBLE_GROUPS: VisibleGroups = {
  trabalho: true,
  pensoes: true,
  catF: false,
  catB: false,
  deducoesColeta: true,
};

/**
 * Display-only section spec used to group the input fields into visually
 * distinct blocks that mirror the {@link AnexosHeader} cards. Each section
 * carries an eyebrow label (matching its card) and a tone driving the accent
 * color. Sections corresponding to toggleable groups disappear when the user
 * deselects the matching card; "rosto" and "retencoes" are always visible.
 */
type GroupKey =
  | 'rosto'
  | 'trabalho'
  | 'pensoes'
  | 'catF'
  | 'catB'
  | 'deducoesColeta'
  | 'retencoes';

interface SectionSpec {
  readonly key: GroupKey;
  /** Mono uppercase label shown above the section (e.g. "ANEXO A · CAT. A"). */
  readonly eyebrow: string;
  /** Plain-language title shown next to the eyebrow. */
  readonly title: string;
  /**
   * Visual tone driving the accent color:
   *  - "obrigatorio": brick (matches always-required cards)
   *  - "conforme":    gold (matches "Conforme aplicável" cards)
   *  - "meta":        muted (Rosto sub-data and Retenções — not anexos themselves)
   */
  readonly tone: 'obrigatorio' | 'conforme' | 'meta';
}

const SECTIONS: readonly SectionSpec[] = [
  { key: 'rosto', eyebrow: 'Rosto', title: 'Folha de rosto', tone: 'meta' },
  { key: 'trabalho', eyebrow: 'Anexo A · cat. A', title: 'Trabalho dependente', tone: 'obrigatorio' },
  { key: 'pensoes', eyebrow: 'Anexo A · cat. H', title: 'Pensões', tone: 'conforme' },
  { key: 'deducoesColeta', eyebrow: 'Anexo H', title: 'Deduções à coleta', tone: 'conforme' },
  { key: 'catF', eyebrow: 'Anexo F', title: 'Rendimentos prediais (rendas)', tone: 'conforme' },
  { key: 'catB', eyebrow: 'Anexo D', title: 'Transparência fiscal (imputação cat. B)', tone: 'conforme' },
  { key: 'retencoes', eyebrow: 'Retenções', title: 'Retidas pela entidade pagadora', tone: 'meta' },
];

export interface CalculatorProps {
  readonly config: TaxYearConfig;
  /** Defaults pre-populating the inputs (matches the canonical demo case). */
  readonly initial?: Partial<LiquidacaoInput>;
  /** Mono badge text shown in the top-right (e.g. "Cat. A/H · Individual"). */
  readonly badge?: string;
  /** Which input groups are visible initially. Defaults to all groups visible. */
  readonly visibleGroups?: VisibleGroups;
  /**
   * Optional callback invoked whenever the active bracket changes — used to
   * sync the BracketBar with the live calculation.
   */
  readonly onEscalaoChange?: (numero: number | null) => void;
  /**
   * Optional callback invoked after every recompute (initial mount + each
   * input change). The exercícios panel uses this to refresh the snapshot
   * shown for the live (unsaved) state.
   */
  readonly onChange?: (snapshot: { inputs: LiquidacaoInput; result: LiquidacaoResult }) => void;
}

/**
 * Imperative handle returned by {@link Calculator}.
 *
 * Components that own a Calculator (like the exercícios panel) need to read
 * the current inputs, set them programmatically when loading a saved
 * exercício, and access the most recent computed result for snapshots.
 */
export interface CalculatorHandle {
  /** Inputs section (header + form fields). */
  readonly element: HTMLElement;
  /** Settlement-note style breakdown (line 01–25). Placed by the parent layout. */
  readonly outputElement: HTMLElement;
  /** Final result box ("X € a pagar" / "a receber"). Placed by the parent layout. */
  readonly finalElement: HTMLElement;
  /** Current input values reflected in the DOM. */
  readonly getInputs: () => LiquidacaoInput;
  /** Imperatively replace the inputs and recompute. */
  readonly setInputs: (input: LiquidacaoInput) => void;
  /** Most recent {@link LiquidacaoResult}. Always defined after mount. */
  readonly getLastResult: () => LiquidacaoResult;
  /** Update which input groups are visible and recompute. */
  readonly setVisibleGroups: (groups: VisibleGroups) => void;
}


/**
 * Pseudo-ids used for cat. F deductible expenses. They live on the same input
 * grid as {@link LiquidacaoInput} fields but are aggregated into a
 * {@link DespesasCatF} sub-object before being sent to the engine.
 */
type DespesaCatFKey = 'despesaIMI' | 'despesaCondominio' | 'despesaConservacao';

interface FieldSpec {
  readonly id: keyof Required<LiquidacaoInput> | DespesaCatFKey;
  readonly label: string;
  readonly hint: string;
  readonly step: string;
  readonly initialValue: number;
  readonly min?: number;
  readonly max?: number;
  /**
   * Which scope group this field belongs to. Fields in a group that is
   * currently hidden stay in the DOM but their `.calculator__field` wrapper
   * is collapsed via CSS and their value is omitted from the engine payload.
   */
  readonly group: GroupKey;
  /** Maps the raw input field value (display) into the engine field value. */
  readonly fromField?: (raw: number) => number;
  /** Maps the engine field value into the input field value (display). */
  readonly toField?: (engine: number) => number;
}

/**
 * Interactive simulator. Mirrors the structure of the AT settlement note line
 * by line (01, 02, 06, 10, 11, 12, 18, 19, 20, 22, 24, 25). Pure UI: all the
 * arithmetic is delegated to {@link calcularLiquidacao}.
 */
export function Calculator(props: CalculatorProps): CalculatorHandle {
  // Defaults reproduce a real cat. A + H settlement note out of the box, so the
  // simulator opens already matching the user's IRS:
  //   cat. A 13 054,76 € (contribuições 1 436,05 €) + cat. H 3 571,62 €
  //   → dedução específica 8 033,77 €, coletável 8 592,61 €.
  // The municipal benefit is 1% applied to the collection AFTER deductions to
  // the collection — (1 092,75 − 307,97) × 1% = 7,85 €, reproducing that note's
  // "Benefício Municipal". Adjust per município (0%–5%) as needed.
  //
  // Cat. F defaults are illustrative (used only when the user activates the
  // anexo); they represent a small rental property with typical expenses.
  const defaults = {
    rendimentoTrabalho: props.initial?.rendimentoTrabalho ?? 13054.76,
    contribuicoesTrabalho: props.initial?.contribuicoesTrabalho ?? 1436.05,
    rendimentoPensoes: props.initial?.rendimentoPensoes ?? 3571.62,
    rendasBrutas: props.initial?.rendasBrutas ?? 9600,
    despesaIMI: props.initial?.despesasCatF?.imi ?? 320,
    despesaCondominio: props.initial?.despesasCatF?.condominio ?? 480,
    despesaConservacao: props.initial?.despesasCatF?.conservacao ?? 0,
    duracaoCatF: (props.initial?.duracaoCatF ?? 'padrao') as DuracaoContratoF,
    retencaoCatF: props.initial?.retencaoCatF ?? 0,
    englobarCatF: props.initial?.englobarCatF ?? false,
    // Cat. B / Anexo D defaults — illustrative single-shareholder case.
    imputacaoCatB: props.initial?.imputacaoCatB ?? 5000,
    retencaoCatB: props.initial?.retencaoCatB ?? 0,
    pagamentosContaCatB: props.initial?.pagamentosContaCatB ?? 0,
    deducoesColeta: props.initial?.deducoesColeta ?? 307.97,
    beneficioMunicipalPct: props.initial?.beneficioMunicipalPct ?? 0.01,
    retencaoFonte: props.initial?.retencaoFonte ?? 103,
    quocienteFamiliar: props.initial?.quocienteFamiliar ?? 1,
  };

  const pctToField = (engine: number): number => engine * 100;
  const fieldToPct = (raw: number): number => raw / 100;

  const fields: readonly FieldSpec[] = [
    {
      id: 'rendimentoTrabalho',
      label: 'Rendimento cat. A — trabalho (€)',
      hint: 'Rendimento bruto anual do trabalho dependente (Anexo A, quadro 4)',
      step: '100',
      initialValue: defaults.rendimentoTrabalho,
      group: 'trabalho',
    },
    {
      id: 'contribuicoesTrabalho',
      label: 'Contribuições obrigatórias cat. A (€)',
      hint: 'Segurança Social / CGA / ADSE retidas sobre o trabalho (Anexo A)',
      step: '10',
      initialValue: defaults.contribuicoesTrabalho,
      group: 'trabalho',
    },
    {
      id: 'rendimentoPensoes',
      label: 'Rendimento cat. H — pensões (€)',
      hint: 'Pensões brutas anuais (Anexo A, quadro 4 — códigos 4xx)',
      step: '100',
      initialValue: defaults.rendimentoPensoes,
      group: 'pensoes',
    },
    {
      id: 'rendasBrutas',
      label: 'Rendas brutas cat. F (€)',
      hint: 'Total recebido durante o ano (Anexo F, quadro 4)',
      step: '100',
      initialValue: defaults.rendasBrutas,
      group: 'catF',
    },
    {
      id: 'despesaIMI',
      label: 'IMI pago (€)',
      hint: 'Despesa dedutível — art. 41.º CIRS',
      step: '10',
      initialValue: defaults.despesaIMI,
      group: 'catF',
    },
    {
      id: 'despesaCondominio',
      label: 'Condomínio (€)',
      hint: 'Despesa dedutível — art. 41.º CIRS',
      step: '10',
      initialValue: defaults.despesaCondominio,
      group: 'catF',
    },
    {
      id: 'despesaConservacao',
      label: 'Conservação / manutenção (€)',
      hint: 'Obras nos 24 meses antes do arrendamento ou durante — art. 41.º',
      step: '10',
      initialValue: defaults.despesaConservacao,
      group: 'catF',
    },
    {
      id: 'retencaoCatF',
      label: 'Retenção na fonte cat. F (€)',
      hint: 'Total retido sobre rendas (inquilino-empresa, 25%)',
      step: '10',
      initialValue: defaults.retencaoCatF,
      group: 'catF',
    },
    {
      id: 'imputacaoCatB',
      label: 'Matéria coletável imputada (€)',
      hint: 'Lucro/prejuízo imputado pela sociedade transparente — valor dado pelo contabilista (Anexo D, quadro 4)',
      step: '100',
      initialValue: defaults.imputacaoCatB,
      group: 'catB',
    },
    {
      id: 'retencaoCatB',
      label: 'Retenções na fonte imputadas (€)',
      hint: 'IRC retido sobre rendimentos da sociedade, imputado ao sócio',
      step: '10',
      initialValue: defaults.retencaoCatB,
      group: 'catB',
    },
    {
      id: 'pagamentosContaCatB',
      label: 'Pagamentos por conta imputados (€)',
      hint: 'PPC efetuados pela sociedade transparente — abate na linha 23 da nota',
      step: '10',
      initialValue: defaults.pagamentosContaCatB,
      group: 'catB',
    },
    {
      id: 'deducoesColeta',
      label: 'Deduções à coleta (€)',
      hint: 'Saúde, educação, e-fatura — apuradas pela AT',
      step: '10',
      initialValue: defaults.deducoesColeta,
      group: 'deducoesColeta',
    },
    {
      id: 'beneficioMunicipalPct',
      label: 'Benefício municipal (%)',
      hint: 'Taxa de devolução do município (0% a 5%)',
      step: '0.1',
      initialValue: pctToField(defaults.beneficioMunicipalPct),
      group: 'deducoesColeta',
      fromField: fieldToPct,
      toField: pctToField,
    },
    {
      id: 'retencaoFonte',
      label: 'Retenção na fonte (€)',
      hint: 'Total retido sobre rendimentos cat. A/H (entidade pagadora). A retenção cat. F tem campo próprio.',
      step: '10',
      initialValue: defaults.retencaoFonte,
      group: 'retencoes',
    },
    {
      id: 'quocienteFamiliar',
      label: 'Quociente familiar',
      hint: '1 = individual · 2 = tributação conjunta de casal (Rosto, quadro 5)',
      step: '0.5',
      initialValue: defaults.quocienteFamiliar,
      group: 'rosto',
      min: 1,
      max: 2,
    },
  ];

  // Track which groups are currently visible. Mutated by setVisibleGroups()
  // and used by getInputs() to decide what to send to the engine.
  let visibleGroups: VisibleGroups = {
    ...DEFAULT_VISIBLE_GROUPS,
    ...(props.visibleGroups ?? {}),
  };

  function isGroupVisible(g: GroupKey): boolean {
    // "rosto" and "retencoes" are not user-toggleable — they're always visible
    // (Rosto = identification, Retenções = transversal final-line input). The
    // remaining keys map 1:1 onto the {@link VisibleGroups} toggles driven by
    // the card row.
    if (g === 'rosto' || g === 'retencoes') return true;
    return visibleGroups[g];
  }

  const inputs = new Map<FieldSpec['id'], HTMLInputElement>();
  const fieldSpecs = new Map<FieldSpec['id'], FieldSpec>();
  for (const spec of fields) fieldSpecs.set(spec.id, spec);

  const output = h('div', { class: 'calculator__output' });
  const finalResult = h('div', { class: 'calculator__final' }, '—');

  let lastResult: LiquidacaoResult | null = null;

  function getInputs(): LiquidacaoInput {
    function val(id: FieldSpec['id']): number {
      const el = inputs.get(id);
      if (!el) return 0;
      const v = parseFloat(el.value);
      const raw = Number.isFinite(v) ? v : 0;
      const spec = fieldSpecs.get(id);
      return spec?.fromField ? spec.fromField(raw) : raw;
    }
    // Per-group reads: when a group is hidden, its inputs are excluded from
    // the engine payload so the calculation reflects the chosen scope.
    const rendimentoTrabalho = visibleGroups.trabalho ? val('rendimentoTrabalho') : undefined;
    const contribuicoesTrabalho =
      visibleGroups.trabalho ? val('contribuicoesTrabalho') : undefined;
    const rendimentoPensoes = visibleGroups.pensoes ? val('rendimentoPensoes') : undefined;
    const deducoesColeta = visibleGroups.deducoesColeta ? val('deducoesColeta') : 0;
    const beneficioMunicipalPct =
      visibleGroups.deducoesColeta ? val('beneficioMunicipalPct') : 0;

    // Cat. F is opt-in (default off). When on, the deductible expenses are
    // packed into a DespesasCatF sub-object — the engine handles the rest.
    const rendasBrutas = visibleGroups.catF ? val('rendasBrutas') : undefined;
    const despesasCatF =
      visibleGroups.catF
        ? {
            imi: val('despesaIMI'),
            condominio: val('despesaCondominio'),
            conservacao: val('despesaConservacao'),
          }
        : undefined;
    const duracaoCatF: DuracaoContratoF | undefined = visibleGroups.catF
      ? (duracaoSelect.value as DuracaoContratoF)
      : undefined;
    const retencaoCatF = visibleGroups.catF ? val('retencaoCatF') : undefined;
    const englobarCatF = visibleGroups.catF ? englobarInput.checked : undefined;

    // Cat. B / Anexo D — opt-in.
    const imputacaoCatB = visibleGroups.catB ? val('imputacaoCatB') : undefined;
    const retencaoCatB = visibleGroups.catB ? val('retencaoCatB') : undefined;
    const pagamentosContaCatB = visibleGroups.catB ? val('pagamentosContaCatB') : undefined;

    return {
      // Canonical combined field — derived from the per-category inputs so that
      // persisted exercícios stay backward-compatible and self-describing.
      rendimentoBruto: (rendimentoTrabalho ?? 0) + (rendimentoPensoes ?? 0),
      ...(rendimentoTrabalho !== undefined ? { rendimentoTrabalho } : {}),
      ...(contribuicoesTrabalho !== undefined ? { contribuicoesTrabalho } : {}),
      ...(rendimentoPensoes !== undefined ? { rendimentoPensoes } : {}),
      ...(rendasBrutas !== undefined ? { rendasBrutas } : {}),
      ...(despesasCatF !== undefined ? { despesasCatF } : {}),
      ...(duracaoCatF !== undefined ? { duracaoCatF } : {}),
      ...(retencaoCatF !== undefined ? { retencaoCatF } : {}),
      ...(englobarCatF !== undefined ? { englobarCatF } : {}),
      ...(imputacaoCatB !== undefined ? { imputacaoCatB } : {}),
      ...(retencaoCatB !== undefined ? { retencaoCatB } : {}),
      ...(pagamentosContaCatB !== undefined ? { pagamentosContaCatB } : {}),
      deducoesColeta,
      beneficioMunicipalPct,
      retencaoFonte: val('retencaoFonte'),
      quocienteFamiliar: Math.max(1, Math.min(2, val('quocienteFamiliar') || 1)),
    };
  }

  function setInputs(input: LiquidacaoInput): void {
    function setField(id: FieldSpec['id'], engineValue: number | undefined): void {
      const el = inputs.get(id);
      if (!el || engineValue === undefined) return;
      const spec = fieldSpecs.get(id);
      const display = spec?.toField ? spec.toField(engineValue) : engineValue;
      el.value = String(display);
    }
    // Legacy (v1) exercícios only carry `rendimentoBruto` — map that combined
    // value into cat. A so they keep loading without a schema migration.
    setField('rendimentoTrabalho', input.rendimentoTrabalho ?? input.rendimentoBruto);
    setField('contribuicoesTrabalho', input.contribuicoesTrabalho ?? 0);
    setField('rendimentoPensoes', input.rendimentoPensoes ?? 0);
    setField('rendasBrutas', input.rendasBrutas ?? 0);
    setField('despesaIMI', input.despesasCatF?.imi ?? 0);
    setField('despesaCondominio', input.despesasCatF?.condominio ?? 0);
    setField('despesaConservacao', input.despesasCatF?.conservacao ?? 0);
    setField('retencaoCatF', input.retencaoCatF ?? 0);
    duracaoSelect.value = input.duracaoCatF ?? 'padrao';
    englobarInput.checked = input.englobarCatF ?? false;
    setField('imputacaoCatB', input.imputacaoCatB ?? 0);
    setField('retencaoCatB', input.retencaoCatB ?? 0);
    setField('pagamentosContaCatB', input.pagamentosContaCatB ?? 0);
    // Loaded inputs may target a different scope than the current one — sync
    // visibility flags from what the snapshot actually carries.
    visibleGroups = {
      trabalho:
        input.rendimentoTrabalho !== undefined ||
        input.contribuicoesTrabalho !== undefined ||
        input.rendimentoBruto > 0,
      pensoes: input.rendimentoPensoes !== undefined,
      catF: input.rendasBrutas !== undefined,
      catB: input.imputacaoCatB !== undefined,
      deducoesColeta:
        (input.deducoesColeta ?? 0) > 0 || (input.beneficioMunicipalPct ?? 0) > 0,
    };
    applyGroupVisibility();
    setField('deducoesColeta', input.deducoesColeta ?? 0);
    setField('beneficioMunicipalPct', input.beneficioMunicipalPct ?? 0);
    setField('retencaoFonte', input.retencaoFonte ?? 0);
    setField('quocienteFamiliar', input.quocienteFamiliar ?? 1);
    recompute();
  }

  function recompute(): void {
    const input = getInputs();
    const r = calcularLiquidacao(input, props.config);
    lastResult = r;
    const benefPct = input.beneficioMunicipalPct ?? 0;
    const quociente = input.quocienteFamiliar ?? 1;

    const linhas: (HTMLElement | null)[] = [
      // Line 01 — gross income now includes cat. B imputado (per AT note).
      row('01 Rendimento global', formatEUR(r.rendimentoBruto)),
      row('02 Dedução específica', `− ${formatEUR(r.deducaoEspecifica)}`),
      r.deducaoEspecificaDetalhe
        ? deducaoBreakdown(r.deducaoEspecificaDetalhe, r.deducaoEspecifica, props.config.deducaoEspecificaCoef)
        : null,
      // Line 04 — abatimento por mínimo de existência. Only rendered when > 0
      // (the most common case, especially for AT-generated notes, is zero).
      r.abatimentoMinimoExistencia > 0
        ? row(
            '04 − Abatimento por mín. de existência',
            `− ${formatEUR(r.abatimentoMinimoExistencia)}`,
          )
        : null,
      r.abatimentoMinimoExistencia > 0
        ? minExistenciaBreakdown(r.abatimentoMinimoExistenciaDetalhe, props.config)
        : null,
      row('05 Rendimento coletável', formatEUR(r.rendimentoColetavel), { total: true }),
      row(`10 ÷ Quociente familiar (${quociente})`, formatEUR(r.baseParaTaxa), { gap: true }),
      row(
        '→ Escalão',
        `${r.coleta.escalao.numero}º (${formatPercent(r.coleta.escalao.taxaNormal)})`,
      ),
      row(
        `11 × Taxa normal ${formatPercent(r.coleta.escalao.taxaNormal)}`,
        formatEUR(r.coleta.importanciaApurada),
      ),
      row('12 − Parcela a abater', `− ${formatEUR(r.coleta.parcelaAbater)}`),
      row('× Quociente familiar', `× ${quociente}`),
      // Cat. F autonomous taxation (art. 72.º) — folded into the coleta total,
      // exactly as the AT note sums "Imposto de tribut. autónomas" into "Coleta
      // total". The breakdown card explains how the autonomous collection was
      // computed; the summary line shows it joining the coleta total.
      r.catF && !r.catF.englobada && r.catF.coletaAutonoma > 0
        ? catFBreakdown(r.catF, props.config)
        : null,
      r.catF && !r.catF.englobada && r.catF.coletaAutonoma > 0
        ? row(
            '16 + Imposto de tribut. autónomas (cat. F)',
            `+ ${formatEUR(r.catF.coletaAutonoma)}`,
          )
        : null,
      row('18 Coleta total', formatEUR(r.coletaTotal), { total: true }),
      row('19 − Deduções à coleta', `− ${formatEUR(r.deducoesColeta)}`, { gap: true }),
      row(
        `20 − Benefício municipal (${(benefPct * 100).toFixed(1)}%)`,
        `− ${formatEUR(r.beneficioMunicipal)}`,
      ),
      row('22 Coleta líquida', formatEUR(r.coletaLiquida), { total: true }),
      // Line 23 — only shown when there's something to abate (cat. B today).
      r.pagamentosConta > 0
        ? row('23 − Pagamentos por conta', `− ${formatEUR(r.pagamentosConta)}`, { gap: true })
        : null,
      row(
        '24 − Retenção na fonte',
        `− ${formatEUR(r.retencaoFonte)}`,
        r.pagamentosConta > 0 ? {} : { gap: true },
      ),
      row(
        'Taxa média efetiva (sobre o bruto)',
        formatPercent(r.taxaMediaEfetiva),
        { gap: true },
      ),
      // Pedagogical "what if you had englobed?" note — only when cat. F is on.
      r.catF
        ? englobamentoNota(input, props.config, r)
        : null,
    ];
    output.replaceChildren(...linhas.filter((n): n is HTMLElement => n !== null));

    const apurado = r.impostoApurado;
    finalResult.className = 'calculator__final';
    if (apurado > 0.01) {
      finalResult.classList.add('calculator__final--pagar');
      finalResult.replaceChildren(
        document.createTextNode(`${formatEUR(apurado)} a pagar `),
        h('small', null, 'linha 25 (positivo)'),
      );
    } else if (apurado < -0.01) {
      finalResult.classList.add('calculator__final--receber');
      finalResult.replaceChildren(
        document.createTextNode(`${formatEUR(-apurado)} a receber `),
        h('small', null, 'linha 25 (reembolso)'),
      );
    } else {
      finalResult.replaceChildren(
        document.createTextNode(`${formatEUR(0)} `),
        h('small', null, 'saldo nulo'),
      );
    }

    props.onEscalaoChange?.(r.coleta.escalao.numero);
    props.onChange?.({ inputs: input, result: r });
  }

  // Per-field DOM wrappers indexed by FieldSpec id, so applyGroupVisibility()
  // can collapse them via CSS without rebuilding the form. Cat. F also has
  // two non-numeric controls (lease-duration select + englobamento switch);
  // they're tracked here under stable ids so they participate in the same
  // visibility logic.
  const fieldElements = new Map<string, HTMLElement>();

  // Cat. F — lease-duration select. Values map 1:1 onto DuracaoContratoF.
  const duracaoSelect = h('select', { id: 'calc-duracaoCatF' }) as HTMLSelectElement;
  ([
    ['padrao', 'Sem prazo / curta duração — 25%'],
    ['duracao5a10', '> 5 e ≤ 10 anos — 15%'],
    ['duracao10a20', '> 10 e ≤ 20 anos — 10%'],
    ['duracao20mais', '> 20 anos — 5%'],
  ] as const).forEach(([value, label]) => {
    const opt = h('option', { value }, label);
    duracaoSelect.appendChild(opt);
  });
  duracaoSelect.value = defaults.duracaoCatF;
  duracaoSelect.addEventListener('change', recompute);
  const duracaoField = h(
    'div',
    { class: 'calculator__field', 'data-group': 'catF' },
    h('label', { for: 'calc-duracaoCatF' }, 'Duração do contrato'),
    duracaoSelect,
    h(
      'div',
      { class: 'calculator__hint' },
      'Art. 72.º n.º 2 — taxas reduzidas para contratos de longa duração',
    ),
  );
  fieldElements.set('duracaoCatF', duracaoField);

  // Cat. F — englobamento switch (checkbox). When ON, the engine routes the
  // cat. F net income through the progressive brackets instead of taxing it
  // autonomously. Useful only when the marginal rate is below the autonomous
  // rate (typically lower brackets).
  const englobarInput = h('input', {
    type: 'checkbox',
    id: 'calc-englobarCatF',
  }) as HTMLInputElement;
  englobarInput.checked = defaults.englobarCatF;
  englobarInput.addEventListener('change', recompute);
  const englobarField = h(
    'div',
    { class: 'calculator__field calculator__field--switch', 'data-group': 'catF' },
    englobarInput,
    h(
      'label',
      { for: 'calc-englobarCatF' },
      'Optar pelo englobamento (art. 22.º)',
    ),
    h(
      'div',
      { class: 'calculator__hint' },
      'Soma as rendas líquidas aos rendimentos cat. A/H. Só compensa em escalões baixos.',
    ),
  );
  fieldElements.set('englobarCatF', englobarField);

  // Build each FieldSpec's DOM up-front (without attaching), then assemble
  // them inside per-anexo sections below. The two non-FieldSpec controls
  // (duracaoField, englobarField) already exist from the cat. F setup above.
  const builtFields = new Map<FieldSpec['id'], HTMLElement>();
  for (const spec of fields) {
    const input = h('input', {
      type: 'number',
      id: `calc-${spec.id}`,
      value: String(spec.initialValue),
      step: spec.step,
      min: spec.min !== undefined ? String(spec.min) : null,
      max: spec.max !== undefined ? String(spec.max) : null,
    });
    inputs.set(spec.id, input);
    input.addEventListener('input', recompute);
    const field = h(
      'div',
      { class: 'calculator__field', 'data-group': spec.group },
      h('label', { for: `calc-${spec.id}` }, spec.label),
      input,
      h('div', { class: 'calculator__hint' }, spec.hint),
    );
    fieldElements.set(spec.id, field);
    builtFields.set(spec.id, field);
  }

  // Section elements by group key — used by applyGroupVisibility() to hide/
  // show the whole anexo block (eyebrow + fields together).
  const sectionElements = new Map<GroupKey, HTMLElement>();

  /**
   * Build one anexo-aware section: eyebrow + title + every field belonging to
   * this group, in declaration order. Cat. F's section also receives the
   * lease-duration select and the englobamento switch.
   */
  function buildSection(spec: SectionSpec): HTMLElement {
    const groupFields = fields
      .filter((f) => f.group === spec.key)
      .map((f) => builtFields.get(f.id))
      .filter((el): el is HTMLElement => el !== undefined);

    const children: HTMLElement[] = [
      h(
        'div',
        { class: `calculator__section-header calculator__section-header--${spec.tone}` },
        h('span', { class: 'calculator__section-eyebrow' }, spec.eyebrow),
        h('span', { class: 'calculator__section-title' }, spec.title),
      ),
      ...groupFields,
    ];

    if (spec.key === 'catF') {
      children.push(duracaoField, englobarField);
    }

    const section = h(
      'section',
      {
        class: `calculator__section calculator__section--${spec.tone}`,
        'data-group': spec.key,
      },
      ...children,
    );
    sectionElements.set(spec.key, section);
    return section;
  }

  const grid = h(
    'div',
    { class: 'calculator__grid' },
    ...SECTIONS.map(buildSection),
  );

  function applyGroupVisibility(): void {
    // Individual fields still get their `hidden` flag set — defensive in case
    // anything outside the section box queries them — but the visible/hidden
    // unit is the section as a whole.
    for (const spec of fields) {
      const el = fieldElements.get(spec.id);
      if (!el) continue;
      el.hidden = !isGroupVisible(spec.group);
    }
    duracaoField.hidden = !isGroupVisible('catF');
    englobarField.hidden = !isGroupVisible('catF');
    for (const [key, section] of sectionElements) {
      section.hidden = !isGroupVisible(key);
    }
  }
  applyGroupVisibility();

  function setVisibleGroups(groups: VisibleGroups): void {
    visibleGroups = { ...groups };
    applyGroupVisibility();
    recompute();
  }

  // Inputs section — the main `element` exposed by the handle. The output and
  // final-result are rendered as siblings so the parent layout can place them
  // wherever it likes (e.g. in a separate column under the BracketBar).
  const root = h(
    'div',
    { class: 'calculator' },
    h(
      'div',
      { class: 'calculator__header' },
      h('h3', null, `Simulador IRS — rendimentos ${props.config.ano}`),
      props.badge ? h('div', { class: 'calculator__badge' }, props.badge) : null,
    ),
    grid,
  );

  recompute();

  return {
    element: root,
    outputElement: output,
    finalElement: finalResult,
    setVisibleGroups,
    getInputs,
    setInputs,
    getLastResult: () => {
      if (!lastResult) throw new Error('Calculator not mounted yet');
      return lastResult;
    },
  };
}

interface RowOpts {
  readonly total?: boolean;
  readonly gap?: boolean;
}

const NOME_CATEGORIA: Record<DeducaoEspecificaCategoria['categoria'], string> = {
  A: 'cat. A — trabalho dependente',
  H: 'cat. H — pensões',
};

/**
 * Expandable explanation of how the specific deduction was reached, one
 * {@link FormulaBlock} per income category, plus a short note on which branch
 * of the `máx` won (or whether the deduction was capped at the income).
 */
function deducaoBreakdown(
  detalhe: readonly DeducaoEspecificaCategoria[],
  total: number,
  coef: number,
): HTMLElement {
  const coefLabel = coef.toLocaleString('pt-PT');
  const cats = detalhe.map((d) => {
    const formula = FormulaBlock({
      label: `Dedução específica — ${NOME_CATEGORIA[d.categoria]}`,
      segments: [
        { kind: 'text', value: `mín( rend. ${formatEUR(d.rendimento)} ; máx( ${coefLabel}×IAS ` },
        { kind: 'op', value: '=' },
        {
          kind: 'text',
          value: ` ${formatEUR(d.minimo)} ; contrib. ${formatEUR(d.contribuicoes)} ) )`,
        },
        { kind: 'op', value: '=' },
        { kind: 'result', value: formatEUR(d.valor) },
      ],
    });
    const nota = h(
      'p',
      { class: 'calculator__deducao-nota' },
      d.limitadoPorRendimento
        ? `Limitada ao rendimento da categoria — ${formatEUR(d.rendimento)} é inferior a ${formatEUR(d.valorBruto)}.`
        : d.contribuicoes > d.minimo
          ? `As contribuições obrigatórias (${formatEUR(d.contribuicoes)}) superam ${coefLabel}×IAS.`
          : `Vence o mínimo ${coefLabel}×IAS (≥ contribuições obrigatórias).`,
    );
    return h('div', { class: 'calculator__deducao-cat' }, formula, nota);
  });

  return h(
    'details',
    { class: 'calculator__deducao-detalhe' },
    h('summary', null, `Como se chega a ${formatEUR(total)}?`),
    ...cats,
    h(
      'p',
      { class: 'calculator__deducao-total' },
      `Total = ${detalhe.map((d) => formatEUR(d.valor)).join(' + ')} = ${formatEUR(total)}`,
    ),
  );
}

const NOME_ALINEA: Record<DetalheMinimoExistencia['alinea'], string> = {
  a: 'alínea a) — rendimento ≤ valor de referência',
  b: 'alínea b) — entre o valor de referência e L',
  c: 'alínea c) — rendimento acima de L',
};

/**
 * Builds the FormulaBlock segments for the chosen alínea of art. 70.º. The
 * three branches differ in shape (and in whether the LDG/T1 term is abated),
 * so each gets its own substitution string ending in the gross formula value.
 */
function segmentosMinExistencia(d: DetalheMinimoExistencia): FormulaSegment[] {
  const V = formatEUR(d.valorReferencia);
  const RB = formatEUR(d.rendimentosBrutos);
  const DE = formatEUR(d.deducaoEspecifica);
  const ldg = formatEUR(d.ldgSobreTaxa);
  const res: FormulaSegment = { kind: 'result', value: formatEUR(d.valorBruto) };

  if (d.alinea === 'a') {
    return [
      { kind: 'text', value: `${V} − ( ${DE} + ${ldg} )` },
      { kind: 'op', value: '=' },
      res,
    ];
  }
  if (d.alinea === 'b') {
    return [
      { kind: 'text', value: `${V} − 2,60 × ( ${RB} − ${V} ) − ( ${DE} + ${ldg} )` },
      { kind: 'op', value: '=' },
      res,
    ];
  }
  // alínea c) — note: only DE is abated, not the LDG/T1 term.
  const L = formatEUR(d.limiteSuperior);
  const L1 = formatEUR(d.limiteEscalao1);
  return [
    { kind: 'text', value: `( ${L} − ${L1} ) − 1,35 × ( ${RB} − ${L} ) − ${DE}` },
    { kind: 'op', value: '=' },
    res,
  ];
}

/**
 * Expandable explanation of the abatimento por mínimo de existência (art. 70.º
 * CIRS), mirroring {@link deducaoBreakdown}: shows which alínea fired, the
 * substituted formula, what the LDG/T1 term means, and any cap.
 */
function minExistenciaBreakdown(
  d: DetalheMinimoExistencia,
  config: TaxYearConfig,
): HTMLElement {
  const t1 = config.escaloes[0]?.taxaNormal ?? 0;
  const formula = FormulaBlock({
    label: `Abatimento por mín. de existência — ${NOME_ALINEA[d.alinea]}`,
    segments: segmentosMinExistencia(d),
  });

  const notas: HTMLElement[] = [];

  // Why this branch — RB compared with V and L.
  const comparacao =
    d.alinea === 'a'
      ? `é inferior ou igual ao valor de referência (${formatEUR(d.valorReferencia)})`
      : d.alinea === 'b'
        ? `está entre o valor de referência (${formatEUR(d.valorReferencia)}) e o limiar L (${formatEUR(d.limiteSuperior)})`
        : `é superior ao limiar L (${formatEUR(d.limiteSuperior)})`;
  notas.push(
    h(
      'p',
      { class: 'calculator__deducao-nota' },
      `O rendimento bruto (${formatEUR(d.rendimentosBrutos)}) ${comparacao}, por isso aplica-se a ${NOME_ALINEA[d.alinea]}.`,
    ),
  );

  // The LDG/T1 term, only relevant for alíneas a) and b).
  if (d.alinea !== 'c') {
    notas.push(
      h(
        'p',
        { class: 'calculator__deducao-nota' },
        `LDG/T1 = limite das despesas gerais ${formatEUR(config.limiteDespesasGerais)} ÷ taxa do 1.º escalão ${formatPercent(t1)} = ${formatEUR(d.ldgSobreTaxa)}.`,
      ),
    );
  } else {
    notas.push(
      h(
        'p',
        { class: 'calculator__deducao-nota' },
        'Na alínea c) o termo LDG/T1 não é abatido — só a dedução específica.',
      ),
    );
  }

  // Clamps: negative formula → 0, or cap d) (RB − DE).
  if (d.valorBruto < 0) {
    notas.push(
      h(
        'p',
        { class: 'calculator__deducao-nota' },
        `A fórmula deu um valor negativo, por isso o abatimento fica em ${formatEUR(0)}.`,
      ),
    );
  } else if (d.capAplicado) {
    notas.push(
      h(
        'p',
        { class: 'calculator__deducao-nota' },
        `Limitado a rendimento − dedução = ${formatEUR(d.capAlineaD)} (art. 70.º n.º 2 d): o abatimento nunca torna o rendimento coletável negativo).`,
      ),
    );
  }

  return h(
    'details',
    { class: 'calculator__deducao-detalhe' },
    h('summary', null, `Como se chega a ${formatEUR(d.valor)}?`),
    formula,
    ...notas,
  );
}

function row(label: string, value: string, opts: RowOpts = {}): HTMLElement {
  const cls = [
    'calculator__row',
    opts.total ? 'calculator__row--total' : '',
    opts.gap ? 'calculator__row--gap' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return h(
    'div',
    { class: cls },
    h('span', { class: 'calculator__row-label' }, label),
    h('span', { class: 'calculator__row-value' }, value),
  );
}

const NOME_DURACAO: Record<DuracaoContratoF, string> = {
  padrao: 'sem prazo / curta duração',
  duracao5a10: '> 5 e ≤ 10 anos',
  duracao10a20: '> 10 e ≤ 20 anos',
  duracao20mais: '> 20 anos',
};

/**
 * Renders the cat. F autonomous sub-calculation as a nested breakdown:
 * rendas brutas − despesas dedutíveis = rendimento líquido, then × taxa.
 * Only shown when englobamento is OFF (otherwise cat. F lives inside the
 * progressive base and there's no separate autonomous collection to explain).
 */
function catFBreakdown(
  catF: NonNullable<LiquidacaoResult['catF']>,
  _config: TaxYearConfig,
): HTMLElement {
  const d = catF.deducao;
  const formula = FormulaBlock({
    label: `Cat. F (Anexo F) — tributação autónoma a ${formatPercent(catF.taxa)} (${NOME_DURACAO[catF.duracao]})`,
    segments: [
      { kind: 'text', value: `(rendas ${formatEUR(d.rendasBrutas)} − despesas ${formatEUR(d.despesasTotal)})` },
      { kind: 'op', value: '×' },
      { kind: 'text', value: ` ${formatPercent(catF.taxa)} ` },
      { kind: 'op', value: '=' },
      { kind: 'result', value: formatEUR(catF.coletaAutonoma) },
    ],
  });
  const detalhe = h(
    'p',
    { class: 'calculator__deducao-nota' },
    `Despesas: IMI ${formatEUR(d.imi)} + condomínio ${formatEUR(d.condominio)} + conservação ${formatEUR(d.conservacao)} = ${formatEUR(d.despesasTotal)}. Rendimento líquido = ${formatEUR(d.rendimentoLiquido)}.`,
  );
  const aviso = d.perdaPotencial
    ? h(
        'p',
        { class: 'calculator__deducao-nota' },
        'Atenção: despesas superam as rendas — perda potencial (não modelada aqui).',
      )
    : null;
  return h(
    'div',
    { class: 'calculator__catf-block' },
    h(
      'div',
      { class: 'calculator__catf-eyebrow' },
      `Coleta cat. F: ${formatEUR(catF.coletaAutonoma)}${catF.retencao > 0 ? ` · Retenção fonte F: ${formatEUR(catF.retencao)}` : ''}`,
    ),
    formula,
    detalhe,
    aviso,
  );
}

/**
 * "What if you had englobed?" pedagogical note — calculates the alternative
 * scenario and tells the user whether opting for englobamento would lower the
 * imposto apurado. Only useful when the contribuinte has cat. F income.
 */
function englobamentoNota(
  input: LiquidacaoInput,
  config: TaxYearConfig,
  current: LiquidacaoResult,
): HTMLElement | null {
  if (!current.catF) return null;
  const alt = (() => {
    try {
      return calcularLiquidacao({ ...input, englobarCatF: !current.catF.englobada }, config);
    } catch {
      return null;
    }
  })();
  if (!alt) return null;

  const delta = alt.impostoApurado - current.impostoApurado;
  const queremEnglobar = !current.catF.englobada;
  const verb = queremEnglobar ? 'englobando' : 'NÃO englobando';
  const tone =
    delta > 1
      ? `pagas mais ${formatEUR(delta)} — não compensa`
      : delta < -1
        ? `poupas ${formatEUR(-delta)} — compensa`
        : 'o resultado é idêntico';
  return h(
    'p',
    { class: 'calculator__englobamento-nota' },
    `Cenário alternativo: ${verb} a cat. F, ${tone}. (Alt. apurado = ${formatEUR(alt.impostoApurado)}.)`,
  );
}
