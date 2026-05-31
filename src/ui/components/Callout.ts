import { h } from '@/ui/dom';
import './Callout.css';

export interface CalloutProps {
  /** Italic title above the body (e.g. "Diferença crítica"). */
  readonly title: string;
  /**
   * Body of the callout. Pass a string for plain text, or an array of
   * paragraphs (strings or pre-built elements with inline emphasis).
   */
  readonly body: string | HTMLElement | readonly (string | HTMLElement)[];
}

/**
 * Bordered, paper-toned callout for highlighting an important note or
 * a critical distinction in the surrounding pedagogical text.
 */
export function Callout(props: CalloutProps): HTMLElement {
  const bodies = Array.isArray(props.body)
    ? (props.body as readonly (string | HTMLElement)[])
    : [props.body as string | HTMLElement];

  return h(
    'div',
    { class: 'callout' },
    h('div', { class: 'callout__title' }, props.title),
    ...bodies.map((b) => h('p', { class: 'callout__body' }, b)),
  );
}
