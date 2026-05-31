import type { FonteOficial } from '@/tax-data/types';
import { h } from '@/ui/dom';
import './SourceBox.css';

/**
 * Props for {@link SourceBox}.
 */
export interface SourceBoxProps {
  /** Label above the source list. Defaults to "Fontes oficiais". */
  readonly label?: string;
  /** Sources to render — typically pulled from a {@link TaxYearConfig.fontes} entry. */
  readonly fontes: readonly FonteOficial[];
}

/**
 * Renders a bordered box listing official sources (Portal das Finanças,
 * Segurança Social, etc.) for the surrounding pedagogical content. Each item
 * is an external link with the "↗" affordance.
 */
export function SourceBox(props: SourceBoxProps): HTMLElement {
  const label = props.label ?? 'Fontes oficiais';

  return h(
    'div',
    { class: 'source-box' },
    h('span', { class: 'source-box__label' }, label),
    h(
      'ul',
      { class: 'source-box__list' },
      ...props.fontes.map((fonte) =>
        h(
          'li',
          { class: 'source-box__item' },
          h(
            'a',
            {
              class: 'source-box__link',
              href: fonte.url,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            fonte.label,
          ),
        ),
      ),
    ),
  );
}
