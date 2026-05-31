import { h } from '@/ui/dom';
import './SectionHeader.css';

/**
 * Props for {@link SectionHeader}.
 *
 * The title supports inline emphasis via a `<em>` element, which is rendered
 * with brand color (brick). Pass the title as a HTMLElement to control this.
 */
export interface SectionHeaderProps {
  /** Italic eyebrow text shown above the title (e.g. "Categoria A e H"). */
  readonly eyebrow: string;
  /** Mono small label after the eyebrow (e.g. "SECÇÃO 04"). Optional. */
  readonly sectionNumber?: string;
  /**
   * The main title. Pass a string for plain titles, or a HTMLElement
   * (typically built via `h()`) for titles with emphasis.
   */
  readonly title: string | HTMLElement;
}

/**
 * Opens a section of the guide with editorial styling — eyebrow, section number,
 * and oversized display-serif title.
 */
export function SectionHeader(props: SectionHeaderProps): HTMLElement {
  return h(
    'header',
    { class: 'section-header' },
    h(
      'div',
      { class: 'section-header__eyebrow' },
      props.eyebrow,
      props.sectionNumber
        ? h('span', { class: 'section-header__section-num' }, props.sectionNumber)
        : null,
    ),
    h('h2', { class: 'section-header__title' }, props.title),
  );
}
