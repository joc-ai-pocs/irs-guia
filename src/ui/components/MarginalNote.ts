import { h } from '@/ui/dom';
import './MarginalNote.css';

export interface MarginalNoteProps {
  /** The note's text — italic editorial commentary. */
  readonly content: string | HTMLElement;
}

/**
 * "Editor's comment" style aside — italic Fraunces with a brick-colored mark.
 * Use sparingly for tangential observations that don't deserve a Callout.
 */
export function MarginalNote(props: MarginalNoteProps): HTMLElement {
  return h('div', { class: 'marginal-note' }, h('div', null, props.content));
}
