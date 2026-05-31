import { h } from '@/ui/dom';
import './StepTable.css';

export interface StepRow {
  /** Step identifier — typically the AT settlement-note line number ("01", "02", …). */
  readonly num: string;
  /**
   * Description of the step. Plain string or pre-built element (e.g. with
   * `<strong>` and inline `<em class="term">` markers).
   */
  readonly label: string | HTMLElement;
  /**
   * Resulting value for this step (formatted by the caller).
   * Optional — leave empty for purely descriptive rows.
   */
  readonly value?: string;
}

export interface StepTableProps {
  /** Italic caption above the table. Optional. */
  readonly caption?: string;
  /** Column headers — defaults to ["Passo", "Operação", "Valor"]. */
  readonly headers?: readonly [string, string, string];
  readonly rows: readonly StepRow[];
}

/**
 * Numbered table mapping to the AT settlement note's vertical structure.
 * Mono numbering, body description, mono right-aligned value.
 */
export function StepTable(props: StepTableProps): HTMLElement {
  const [hStep, hOp, hValue] = props.headers ?? ['Passo', 'Operação', 'Valor'];

  return h(
    'table',
    { class: 'step-table' },
    props.caption
      ? h('caption', { class: 'step-table__caption' }, props.caption)
      : null,
    h(
      'thead',
      null,
      h('tr', null, h('th', null, hStep), h('th', null, hOp), h('th', null, hValue)),
    ),
    h(
      'tbody',
      null,
      ...props.rows.map((row) =>
        h(
          'tr',
          null,
          h('td', { class: 'step-table__num' }, row.num),
          h('td', { class: 'step-table__label' }, row.label),
          h('td', { class: 'step-table__value' }, row.value ?? ''),
        ),
      ),
    ),
  );
}
