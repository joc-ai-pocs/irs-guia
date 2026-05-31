import { h } from '@/ui/dom';
import './Hero.css';

export interface HeroMetaItem {
  readonly label: string;
  readonly value: string;
}

export interface HeroProps {
  /** Small mono eyebrow line above the title. */
  readonly eyebrow: string;
  /** Main display title. Accepts inline HTML (e.g. `<em>` for accents). */
  readonly title: string | HTMLElement;
  /** Subtitle / lede paragraph. */
  readonly lede: string | HTMLElement;
  /** Mono metadata items rendered as `Label: Value` pairs. */
  readonly meta?: readonly HeroMetaItem[];
  /** Optional mono badge text shown in the top-right corner. */
  readonly badge?: string;
}

/**
 * Editorial hero for the top of the page. Sets the tone with eyebrow, oversized
 * Fraunces title, lede, and a row of mono metadata.
 */
export function Hero(props: HeroProps): HTMLElement {
  return h(
    'header',
    { class: 'hero' },
    props.badge ? h('div', { class: 'hero__badge' }, props.badge) : null,
    h('div', { class: 'hero__eyebrow' }, props.eyebrow),
    h('h1', { class: 'hero__title' }, props.title),
    h('p', { class: 'hero__lede' }, props.lede),
    props.meta && props.meta.length > 0
      ? h(
          'div',
          { class: 'hero__meta' },
          ...props.meta.map((m) =>
            h(
              'span',
              { class: 'hero__meta-item' },
              `${m.label}: `,
              h('strong', null, m.value),
            ),
          ),
        )
      : null,
  );
}
