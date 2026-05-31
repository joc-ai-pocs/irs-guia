import { h } from '@/ui/dom';
import './ResourceGroup.css';

export interface ResourceCardSpec {
  /** Small mono tag (e.g. "CIRS · ART. 68.º (2025)"). */
  readonly tag: string;
  /** Card title — Fraunces serif. */
  readonly title: string;
  /** Short description in body font. */
  readonly description: string;
  /** External URL — opens in new tab. */
  readonly url: string;
}

export interface ResourceGroupProps {
  /** Section title (e.g. "Código do IRS — artigos fundamentais"). */
  readonly title: string;
  /** Mono subtitle (e.g. "Portal das Finanças"). */
  readonly subtitle: string;
  readonly cards: readonly ResourceCardSpec[];
}

/**
 * Grouped 2-column grid of {@link ResourceCardSpec}s. Used to assemble the
 * "Recursos e fontes" tab.
 */
export function ResourceGroup(props: ResourceGroupProps): HTMLElement {
  return h(
    'section',
    { class: 'resource-group' },
    h('h3', { class: 'resource-group__title' }, props.title),
    h('div', { class: 'resource-group__sub' }, props.subtitle),
    h(
      'div',
      { class: 'resource-group__list' },
      ...props.cards.map((c) =>
        h(
          'a',
          {
            class: 'resource-card',
            href: c.url,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          h('div', { class: 'resource-card__tag' }, c.tag),
          h('div', { class: 'resource-card__title' }, c.title),
          h('div', { class: 'resource-card__desc' }, c.description),
        ),
      ),
    ),
  );
}
