import { h, type Child } from '@/ui/dom';
import './Section.css';

export interface SectionProps {
  /** Anchor id used by the TOC (e.g. `vista-geral`). */
  readonly id: string;
  /** Mono label (e.g. `SECÇÃO 01`). */
  readonly sectionNumber: string;
  /** Section title — string or pre-built element with inline emphasis. */
  readonly title: string | HTMLElement;
  /** Body content (paragraphs, callouts, tables, etc.). */
  readonly children: readonly Child[];
}

/**
 * Wraps a guide section with a stable anchor id and a Fraunces title.
 * Used as the building block of the "Guia completo" tab.
 */
export function Section(props: SectionProps): HTMLElement {
  return h(
    'section',
    { id: props.id, class: 'guide-section' },
    h('div', { class: 'guide-section__num' }, props.sectionNumber),
    h('h2', { class: 'guide-section__title' }, props.title),
    ...props.children,
  );
}
