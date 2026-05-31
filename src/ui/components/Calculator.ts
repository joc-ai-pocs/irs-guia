import type { TaxYearConfig } from '@/tax-data/types';
import {
  calcularLiquidacao,
  type LiquidacaoInput,
  type LiquidacaoResult,
} from '@/engine';
import { h } from '@/ui/dom';
import { formatEUR, formatPercent } from '@/ui/format';
import './Calculator.css';

export interface CalculatorProps {
  readonly config: TaxYearConfig;
  /** Defaults pre-populating the inputs (matches the canonical demo case). */
  readonly initial?: Partial<LiquidacaoInput>;
  /** Mono badge text shown in the top-right (e.g. "Cat. A/H · Individual"). */
  readonly badge?: string;
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
  readonly element: HTMLElement;
  /** Current input values reflected in the DOM. */
  readonly getInputs: () => LiquidacaoInput;
  /** Imperatively replace the inputs and recompute. */
  readonly setInputs: (input: LiquidacaoInput) => void;
  /** Most recent {@link LiquidacaoResult}. Always defined after mount. */
  readonly getLastResult: () => LiquidacaoResult;
}

interface FieldSpec {
  readonly id: keyof Required<LiquidacaoInput>;
  readonly label: string;
  readonly hint: string;
  readonly step: string;
  readonly initialValue: number;
  readonly min?: number;
  readonly max?: number;
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
  const defaults: Required<LiquidacaoInput> = {
    rendimentoBruto: props.initial?.rendimentoBruto ?? 14135.53,
    deducaoEspecifica:
      props.initial?.deducaoEspecifica ?? props.config.deducaoEspecificaMinima,
    deducoesColeta: props.initial?.deducoesColeta ?? 275.41,
    beneficioMunicipalPct: props.initial?.beneficioMunicipalPct ?? 0.01,
    retencaoFonte: props.initial?.retencaoFonte ?? 968,
    quocienteFamiliar: props.initial?.quocienteFamiliar ?? 1,
  };

  const pctToField = (engine: number): number => engine * 100;
  const fieldToPct = (raw: number): number => raw / 100;

  const fields: readonly FieldSpec[] = [
    {
      id: 'rendimentoBruto',
      label: 'Rendimento bruto anual (€)',
      hint: 'Soma dos rendimentos brutos do agregado (cat. A + H)',
      step: '100',
      initialValue: defaults.rendimentoBruto,
    },
    {
      id: 'deducaoEspecifica',
      label: 'Dedução específica (€)',
      hint: `${props.config.deducaoEspecificaCoef} × IAS = ${formatEUR(
        props.config.deducaoEspecificaMinima,
      )} (cat. A/H)`,
      step: '10',
      initialValue: defaults.deducaoEspecifica,
    },
    {
      id: 'deducoesColeta',
      label: 'Deduções à coleta (€)',
      hint: 'Saúde, educação, e-fatura — apuradas pela AT',
      step: '10',
      initialValue: defaults.deducoesColeta,
    },
    {
      id: 'beneficioMunicipalPct',
      label: 'Benefício municipal (%)',
      hint: 'Taxa de devolução do município (0% a 5%)',
      step: '0.1',
      initialValue: pctToField(defaults.beneficioMunicipalPct),
      fromField: fieldToPct,
      toField: pctToField,
    },
    {
      id: 'retencaoFonte',
      label: 'Retenção na fonte (€)',
      hint: 'Total retido pela entidade patronal/pagadora',
      step: '10',
      initialValue: defaults.retencaoFonte,
    },
    {
      id: 'quocienteFamiliar',
      label: 'Quociente familiar',
      hint: '1 = individual · 2 = tributação conjunta de casal',
      step: '0.5',
      initialValue: defaults.quocienteFamiliar,
      min: 1,
      max: 2,
    },
  ];

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
    return {
      rendimentoBruto: val('rendimentoBruto'),
      deducaoEspecifica: val('deducaoEspecifica'),
      deducoesColeta: val('deducoesColeta'),
      beneficioMunicipalPct: val('beneficioMunicipalPct'),
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
    setField('rendimentoBruto', input.rendimentoBruto);
    setField(
      'deducaoEspecifica',
      input.deducaoEspecifica ?? props.config.deducaoEspecificaMinima,
    );
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

    output.replaceChildren(
      row('01 Rendimento global', formatEUR(r.rendimentoBruto)),
      row('02 Dedução específica', `− ${formatEUR(r.deducaoEspecifica)}`),
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
    );

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
      return h(
        'div',
        { class: 'calculator__field' },
        h('label', { for: `calc-${spec.id}` }, spec.label),
        input,
        h('div', { class: 'calculator__hint' }, spec.hint),
      );
    }),
  );

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
    output,
    finalResult,
  );

  recompute();

  return {
    element: root,
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
