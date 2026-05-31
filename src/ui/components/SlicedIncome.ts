import type { TaxYearConfig } from '@/tax-data/types';
import { calcularColetaMetodo2 } from '@/engine';
import { h } from '@/ui/dom';
import { formatEUR, formatPercent } from '@/ui/format';
import './SlicedIncome.css';

export interface SlicedIncomeProps {
  /** Taxable income (in euros) to slice by bracket. */
  readonly coletavel: number;
  readonly config: TaxYearConfig;
}

/**
 * Horizontal bar visualizing how a given taxable income is sliced across the
 * progressive brackets (method 2). Each segment's flex-grow is proportional to
 * the euros falling in that bracket; coloring matches the BracketBar.
 */
export function SlicedIncome(props: SlicedIncomeProps): HTMLElement {
  const { fatias, coleta } = calcularColetaMetodo2(props.coletavel, props.config);

  const totalImposto = coleta;

  return h(
    'div',
    { class: 'sliced-income' },
    h(
      'div',
      { class: 'sliced-income__caption' },
      `Exemplo: rendimento coletável de ${formatEUR(props.coletavel)}`,
    ),
    h(
      'div',
      { class: 'sliced-income__bar' },
      ...fatias.map((f) =>
        h(
          'div',
          {
            class: 'sliced-income__slice',
            dataset: { escalao: String(f.escalao.numero) },
            style: `flex: ${f.fatia};`,
          },
          h('div', null, formatEUR(f.fatia)),
          h(
            'div',
            { class: 'sliced-income__slice-imposto' },
            `× ${formatPercent(f.escalao.taxaNormal)} = ${formatEUR(f.imposto)}`,
          ),
        ),
      ),
    ),
    h(
      'p',
      { class: 'sliced-income__total' },
      `Total: ${formatEUR(props.coletavel)} · Coleta: `,
      h('strong', null, formatEUR(totalImposto)),
    ),
  );
}
