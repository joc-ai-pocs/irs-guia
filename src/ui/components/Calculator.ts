import type { TaxYearConfig } from '@/tax-data/types';
import {
  calcularLiquidacao,
  type DeducaoEspecificaCategoria,
  type LiquidacaoInput,
  type LiquidacaoResult,
} from '@/engine';
import { h } from '@/ui/dom';
import { formatEUR, formatPercent } from '@/ui/format';
import { FormulaBlock } from './FormulaBlock';
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
  /** Anexo H inputs (deduções à coleta + benefício municipal). */
  readonly deducoesColeta: boolean;
}

export const DEFAULT_VISIBLE_GROUPS: VisibleGroups = {
  trabalho: true,
  pensoes: true,
  deducoesColeta: true,
};

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

type GroupKey = 'trabalho' | 'pensoes' | 'deducoesColeta' | 'always';

interface FieldSpec {
  readonly id: keyof Required<LiquidacaoInput>;
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
  const defaults = {
    rendimentoTrabalho: props.initial?.rendimentoTrabalho ?? 13054.76,
    contribuicoesTrabalho: props.initial?.contribuicoesTrabalho ?? 1436.05,
    rendimentoPensoes: props.initial?.rendimentoPensoes ?? 3571.62,
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
      hint: 'Total retido pela entidade patronal/pagadora',
      step: '10',
      initialValue: defaults.retencaoFonte,
      group: 'always',
    },
    {
      id: 'quocienteFamiliar',
      label: 'Quociente familiar',
      hint: '1 = individual · 2 = tributação conjunta de casal',
      step: '0.5',
      initialValue: defaults.quocienteFamiliar,
      group: 'always',
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
    if (g === 'always') return true;
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

    return {
      // Canonical combined field — derived from the per-category inputs so that
      // persisted exercícios stay backward-compatible and self-describing.
      rendimentoBruto: (rendimentoTrabalho ?? 0) + (rendimentoPensoes ?? 0),
      ...(rendimentoTrabalho !== undefined ? { rendimentoTrabalho } : {}),
      ...(contribuicoesTrabalho !== undefined ? { contribuicoesTrabalho } : {}),
      ...(rendimentoPensoes !== undefined ? { rendimentoPensoes } : {}),
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
    // Loaded inputs may target a different scope than the current one — sync
    // visibility flags from what the snapshot actually carries.
    visibleGroups = {
      trabalho:
        input.rendimentoTrabalho !== undefined ||
        input.contribuicoesTrabalho !== undefined ||
        input.rendimentoBruto > 0,
      pensoes: input.rendimentoPensoes !== undefined,
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
      row('01 Rendimento global', formatEUR(r.rendimentoBruto)),
      row('02 Dedução específica', `− ${formatEUR(r.deducaoEspecifica)}`),
      r.deducaoEspecificaDetalhe
        ? deducaoBreakdown(r.deducaoEspecificaDetalhe, r.deducaoEspecifica, props.config.deducaoEspecificaCoef)
        : null,
      row('06 Rendimento coletável', formatEUR(r.rendimentoColetavel), { total: true }),
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
      row('18 Coleta total', formatEUR(r.coletaTotal), { total: true }),
      row('19 − Deduções à coleta', `− ${formatEUR(r.deducoesColeta)}`, { gap: true }),
      row(
        `20 − Benefício municipal (${(benefPct * 100).toFixed(1)}%)`,
        `− ${formatEUR(r.beneficioMunicipal)}`,
      ),
      row('22 Coleta líquida', formatEUR(r.coletaLiquida), { total: true }),
      row('24 − Retenção na fonte', `− ${formatEUR(r.retencaoFonte)}`, { gap: true }),
      row(
        'Taxa média efetiva (sobre o bruto)',
        formatPercent(r.taxaMediaEfetiva),
        { gap: true },
      ),
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
  // can collapse them via CSS without rebuilding the form.
  const fieldElements = new Map<FieldSpec['id'], HTMLElement>();

  const grid = h(
    'div',
    { class: 'calculator__grid' },
    ...fields.map((spec) => {
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
      return field;
    }),
  );

  function applyGroupVisibility(): void {
    for (const spec of fields) {
      const el = fieldElements.get(spec.id);
      if (!el) continue;
      el.hidden = !isGroupVisible(spec.group);
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
