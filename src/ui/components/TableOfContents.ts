import { h } from '@/ui/dom';
import './TableOfContents.css';

export interface TocItem {
  /** Anchor href, e.g. `#vista-geral`. */
  readonly href: string;
  /** Link label. */
  readonly label: string;
  /**
   * Optional target tab id. If set, clicking the link switches to that tab
   * (via {@link window.__irsSwitchTab}) and then scrolls to {@link href}.
   * If omitted, the link behaves like a normal in-tab anchor.
   */
  readonly tab?: string;
}

export interface TableOfContentsProps {
  readonly title?: string;
  readonly items: readonly TocItem[];
}

/**
 * Two-column ordered index used at the top of the "Guia completo" tab.
 * Anchors point to {@link Section} ids within the same tab, OR — when
 * {@link TocItem.tab} is set — to anchors in a different tab.
 */
export function TableOfContents(props: TableOfContentsProps): HTMLElement {
  const root = h(
    'nav',
    { class: 'toc' },
    h('h2', { class: 'toc__title' }, props.title ?? 'Índice'),
    h(
      'ol',
      { class: 'toc__list' },
      ...props.items.map((item) =>
        h(
          'li',
          { class: 'toc__item' },
          h(
            'a',
            {
              class: 'toc__link',
              href: item.href,
              ...(item.tab !== undefined ? { dataset: { tab: item.tab } } : {}),
            },
            item.label,
          ),
        ),
      ),
    ),
  );

  root.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLAnchorElement)) return;
    const tab = target.dataset['tab'];
    if (!tab) return;
    e.preventDefault();
    const href = target.getAttribute('href') ?? undefined;
    window.__irsSwitchTab?.(tab, href ?? undefined);
  });

  return root;
}
