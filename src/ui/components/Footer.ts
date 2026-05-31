import { h, type Child } from '@/ui/dom';
import './Footer.css';

export interface FooterProps {
  /** Main copy line (e.g. fontes oficiais com links). Inline HTML allowed. */
  readonly primary: Child;
  /** Optional second line for legal / pedagogical disclaimers. */
  readonly secondary?: Child;
}

/**
 * Page footer with mono small print, links accented in brick.
 */
export function Footer(props: FooterProps): HTMLElement {
  return h(
    'footer',
    { class: 'site-footer' },
    h('div', null, props.primary),
    props.secondary ? h('div', { class: 'site-footer__secondary' }, props.secondary) : null,
  );
}
