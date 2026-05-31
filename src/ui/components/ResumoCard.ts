import { h, type Child } from '@/ui/dom';
import { Markdown } from './Markdown';
import './ResumoCard.css';

export interface ResumoCardProps {
  /** Card number in the resumo grid (e.g. "01"). */
  readonly num: string;
  /** Mono category line (e.g. "VISTA GERAL"). */
  readonly tag: string;
  /** Card title. */
  readonly title: string;
  /**
   * Bullet list rendered from raw markdown. Each top-level `<li>` becomes a
   * card bullet. Use the markdown `<a data-tab="…" href="#anchor">` pattern
   * (or HTML inline) for cross-tab anchor links — TabsNav listens for that.
   */
  readonly bulletsMd: string;
}

/**
 * Card used inside the "Resumo navegável" tab. Each card collapses one
 * section of the full guide into a short, link-rich summary.
 */
export function ResumoCard(props: ResumoCardProps): HTMLElement {
  const body = Markdown({ source: props.bulletsMd, className: 'resumo-card__body' });

  // Intercept anchor clicks within bullets to switch tabs when requested.
  body.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLAnchorElement)) return;
    const tab = target.dataset['tab'];
    if (!tab) return;
    e.preventDefault();
    const href = target.getAttribute('href') ?? undefined;
    window.__irsSwitchTab?.(tab, href ?? undefined);
  });

  return h(
    'article',
    { class: 'resumo-card' },
    h(
      'div',
      { class: 'resumo-card__num' },
      `${props.num} / ${props.tag}`,
    ),
    h('h3', { class: 'resumo-card__title' }, props.title),
    body as Child,
  );
}
