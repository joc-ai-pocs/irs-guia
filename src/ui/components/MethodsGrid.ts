import type { TaxYearConfig } from '@/tax-data/types';
import {
  calcularColetaMetodo1,
  calcularColetaMetodo2,
  calcularColetaMetodo3,
} from '@/engine';
import { h } from '@/ui/dom';
import { formatEUR, formatPercent } from '@/ui/format';
import './MethodsGrid.css';

export interface MethodsGridProps {
  /** Taxable income to use in the worked example (e.g. 15 650 €). */
  readonly exemploColetavel: number;
  readonly config: TaxYearConfig;
}

/**
 * Three side-by-side cards demonstrating the equivalent methods of computing
 * the coleta for the same taxable income. The arithmetic is driven by the
 * engine — never hardcoded — so the example stays in sync with the bracket
 * table in {@link TaxYearConfig}.
 */
export function MethodsGrid(props: MethodsGridProps): HTMLElement {
  const m1 = calcularColetaMetodo1(props.exemploColetavel, props.config);
  const m2 = calcularColetaMetodo2(props.exemploColetavel, props.config);
  const m3 = calcularColetaMetodo3(props.exemploColetavel, props.config);

  return h(
    'div',
    { class: 'methods-grid' },
    methodCard({
      tag: 'Método 1',
      title: 'Limite anterior × taxa média + excedente × taxa normal',
      lead:
        'Divide-se o coletável em duas partes: o limite superior do escalão anterior (taxa média) e o excedente (taxa normal do escalão atual).',
      example: h(
        'div',
        null,
        `parcela 1: ${formatEUR(m1.limiteAnterior)} × ${formatPercent(m1.taxaMediaAnterior)}`,
        h('br', null),
        `= ${formatEUR(m1.parcela1)}`,
        h('br', null),
        `parcela 2: ${formatEUR(m1.excedente)} × ${formatPercent(m3.escalao.taxaNormal)}`,
        h('br', null),
        `= ${formatEUR(m1.parcela2)}`,
        h('br', null),
        h('strong', null, `coleta = ${formatEUR(m1.coleta)}`),
      ),
    }),
    methodCard({
      tag: 'Método 2',
      title: 'Fatiar por todos os escalões aplicando taxas normais',
      lead:
        'Para cada escalão até onde o coletável chega, multiplica-se a fatia pela taxa normal. Soma-se tudo.',
      example: h(
        'div',
        null,
        ...m2.fatias.flatMap((f, i) => [
          `${f.escalao.numero}º: ${formatEUR(f.fatia)} × ${formatPercent(f.escalao.taxaNormal)} = ${formatEUR(f.imposto)}`,
          i < m2.fatias.length - 1 ? h('br', null) : null,
        ]),
        h('br', null),
        h('strong', null, `coleta = ${formatEUR(m2.coleta)}`),
      ),
    }),
    methodCard({
      tag: 'Método 3',
      badge: 'AT',
      title: 'Coletável × taxa normal − parcela a abater',
      lead:
        'Multiplica-se o coletável inteiro pela taxa normal do escalão onde caiu e subtrai-se a parcela a abater. Uma só operação.',
      example: h(
        'div',
        null,
        `${formatEUR(props.exemploColetavel)} × ${formatPercent(m3.escalao.taxaNormal)} = ${formatEUR(m3.importanciaApurada)}`,
        h('br', null),
        `${formatEUR(m3.importanciaApurada)} − ${formatEUR(m3.parcelaAbater)}`,
        h('br', null),
        h('strong', null, `coleta = ${formatEUR(m3.coleta)}`),
      ),
    }),
  );
}

interface MethodCardSpec {
  readonly tag: string;
  readonly title: string;
  readonly lead: string;
  readonly example: HTMLElement;
  readonly badge?: string;
}

function methodCard(spec: MethodCardSpec): HTMLElement {
  return h(
    'div',
    { class: 'method-card' },
    h('div', { class: 'method-card__tag' }, spec.tag),
    h(
      'h5',
      { class: 'method-card__title' },
      spec.title,
      spec.badge
        ? h('span', { class: 'method-card__badge' }, spec.badge)
        : null,
    ),
    h('p', { class: 'method-card__lead' }, spec.lead),
    h('div', { class: 'method-card__example' }, spec.example),
  );
}
