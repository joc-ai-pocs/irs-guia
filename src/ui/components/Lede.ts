import { h } from '@/ui/dom';
import './Lede.css';

/**
 * Props for {@link Lede} — the editorial intro paragraph after a SectionHeader.
 */
export interface LedeProps {
  /** Plain string or pre-built element (e.g. with inline <em> spans). */
  readonly content: string | HTMLElement | readonly (string | HTMLElement)[];
}

/**
 * Magazine-style intro paragraph, larger and lighter than body copy,
 * using the display serif. Emphasis (<em>) renders in deep brick.
 */
export function Lede(props: LedeProps): HTMLElement {
  const children = Array.isArray(props.content)
    ? (props.content as readonly (string | HTMLElement)[])
    : [props.content as string | HTMLElement];
  return h('p', { class: 'lede' }, ...children);
}
