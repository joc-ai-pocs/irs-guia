import type { Escalao } from '@/tax-data/types';
import { h } from '@/ui/dom';
import { formatPercent } from '@/ui/format';
import './BracketBar.css';

export interface BracketBarProps {
  /** The bracket table. Typically `config.escaloes`. */
  readonly escaloes: readonly Escalao[];
  /** Bracket initially active (1..N) or null for no highlight. */
  readonly initialActive?: number | null;
}

export interface BracketBarHandle {
  /** The composed DOM element to mount. */
  readonly element: HTMLElement;
  /** Programmatically set the active bracket (e.g. from the Calculator). */
  readonly setActive: (numero: number | null) => void;
}

/**
 * Interactive visualization of the progressive bracket table — a 9-segment
 * color bar synced with a detail table. Hovering a segment or row highlights
 * both; the {@link BracketBarHandle.setActive} method allows external
 * components (e.g. the Calculator) to drive the highlight.
 */
export function BracketBar(props: BracketBarProps): BracketBarHandle {
  const segments = props.escaloes.map((escalao) =>
    h(
      'div',
      {
        class: 'bracket-bar__seg',
        dataset: { escalao: String(escalao.numero) },
        title: rangeLabel(escalao, props.escaloes),
      },
      h('span', { class: 'bracket-bar__seg-label' }, `${escalao.numero}º`),
      formatPercent(escalao.taxaNormal),
      escalao.limiteSuperior !== Number.POSITIVE_INFINITY
        ? h(
            'span',
            { class: 'bracket-bar__seg-limit' },
            formatThousands(escalao.limiteSuperior),
          )
        : null,
    ),
  );

  const bar = h('div', { class: 'bracket-bar__bar' }, ...segments);

  const tbody = h(
    'tbody',
    null,
    ...props.escaloes.map((escalao, idx) => {
      const prev = idx === 0 ? 0 : props.escaloes[idx - 1]?.limiteSuperior ?? 0;
      return h(
        'tr',
        { dataset: { row: String(escalao.numero) } },
        h(
          'td',
          null,
          h('span', { class: 'bracket-bar__dot', dataset: { dot: String(escalao.numero) } }),
        ),
        h('td', null, `${escalao.numero}º`),
        h('td', { class: 'bracket-bar__range' }, rangeLabel(escalao, props.escaloes, prev)),
        h('td', { class: 'bracket-bar__tax' }, formatPercent(escalao.taxaNormal)),
        h(
          'td',
          { class: 'bracket-bar__tax' },
          escalao.taxaMedia === null ? '—' : formatPercent(escalao.taxaMedia),
        ),
        h('td', { class: 'bracket-bar__tax' }, formatEuroPlain(escalao.parcelaAbater)),
      );
    }),
  );

  const table = h(
    'table',
    { class: 'bracket-bar__table' },
    h(
      'thead',
      null,
      h(
        'tr',
        null,
        h('th', null, ''),
        h('th', null, 'Escalão'),
        h('th', null, 'Rendimento coletável (€)'),
        h('th', { class: 'bracket-bar__th-right' }, 'Taxa normal'),
        h('th', { class: 'bracket-bar__th-right' }, 'Taxa média'),
        h('th', { class: 'bracket-bar__th-right' }, 'Parcela a abater (€)'),
      ),
    ),
    tbody,
  );

  const caption = h(
    'div',
    { class: 'bracket-bar__caption' },
    'Distribuição dos 9 escalões (escala não linear) — rendimento coletável em €',
  );

  const wrap = h('div', { class: 'bracket-bar' }, caption, bar, table);

  function setActive(numero: number | null): void {
    for (const seg of wrap.querySelectorAll<HTMLElement>('.bracket-bar__seg')) {
      seg.classList.toggle(
        'bracket-bar__seg--active',
        numero !== null && seg.dataset['escalao'] === String(numero),
      );
    }
    for (const row of wrap.querySelectorAll<HTMLElement>('tbody tr')) {
      row.classList.toggle(
        'bracket-bar__row--active',
        numero !== null && row.dataset['row'] === String(numero),
      );
    }
  }

  for (const seg of segments) {
    seg.addEventListener('mouseenter', () => {
      const n = Number(seg.dataset['escalao']);
      setActive(n);
    });
  }
  for (const row of tbody.querySelectorAll<HTMLElement>('tr')) {
    row.addEventListener('mouseenter', () => {
      const n = Number(row.dataset['row']);
      setActive(n);
    });
  }

  if (props.initialActive !== undefined && props.initialActive !== null) {
    setActive(props.initialActive);
  }

  return { element: wrap, setActive };
}

// ─────────────────────────────────────────────────────────────────────────
// helpers (local to this component — display formatting only)
// ─────────────────────────────────────────────────────────────────────────

function rangeLabel(
  e: Escalao,
  all: readonly Escalao[],
  prevLimit?: number,
): string {
  if (prevLimit === undefined) {
    const idx = all.findIndex((x) => x.numero === e.numero);
    prevLimit = idx <= 0 ? 0 : all[idx - 1]?.limiteSuperior ?? 0;
  }
  if (e.limiteSuperior === Number.POSITIVE_INFINITY) {
    return `Superior a ${formatThousands(prevLimit)}`;
  }
  if (prevLimit === 0) return `Até ${formatThousands(e.limiteSuperior)}`;
  return `${formatThousands(prevLimit)} – ${formatThousands(e.limiteSuperior)}`;
}

function formatThousands(value: number): string {
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(value);
}

function formatEuroPlain(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
