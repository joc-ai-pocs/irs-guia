import { h } from '@/ui/dom';
import './FormulaBlock.css';

/**
 * A segment of the formula body. `text` is rendered verbatim; `op` is a
 * highlighted operator (×, ÷, =, etc.); `result` is a boxed final value.
 */
export type FormulaSegment =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'op'; readonly value: string }
  | { readonly kind: 'result'; readonly value: string };

export interface FormulaBlockProps {
  /** Small label above the formula (e.g. "Dedução específica cat. A/H em 2025"). */
  readonly label: string;
  /** Ordered segments making up the formula. */
  readonly segments: readonly FormulaSegment[];
}

/**
 * Visually distinct block for highlighting a single formula or computation.
 * Mono font, brick accent, boxed result.
 *
 * @example
 *   FormulaBlock({
 *     label: 'Dedução específica cat. A/H em 2025',
 *     segments: [
 *       { kind: 'text', value: '8,54 ' },
 *       { kind: 'op', value: '×' },
 *       { kind: 'text', value: ' IAS = 8,54 ' },
 *       { kind: 'op', value: '×' },
 *       { kind: 'text', value: ' 522,50 € = ' },
 *       { kind: 'result', value: '4 462,15 €' },
 *     ],
 *   })
 */
export function FormulaBlock(props: FormulaBlockProps): HTMLElement {
  return h(
    'div',
    { class: 'formula' },
    h('span', { class: 'formula__label' }, props.label),
    ...props.segments.map((seg) => {
      if (seg.kind === 'op') return h('span', { class: 'formula__op' }, seg.value);
      if (seg.kind === 'result') return h('span', { class: 'formula__result' }, seg.value);
      return document.createTextNode(seg.value);
    }),
  );
}
