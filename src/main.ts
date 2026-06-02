/**
 * Application entry point — mounts the full pedagogical guide:
 *
 *   Hero
 *     YearSelector (filters the whole guide by fiscal year)
 *     Tabs (Guia · Calculadora · Resumo · Recursos)
 *       TabGuia    → 8 sections + Calculator + BracketBar (synced)
 *       TabResumo  → 8 navigable summary cards
 *       TabRecursos → 4 grouped link collections
 *   Footer
 *
 * Every tax constant comes from `tax-data/`, every formula from `engine/`.
 * The UI layer composes the result — never duplicates the arithmetic.
 *
 * The selected fiscal year is kept in the `?ano=` URL parameter so a given
 * view can be reloaded and shared. Changing year re-renders the whole app
 * with that year's `TaxYearConfig`.
 */

import '@/styles/base.css';

import type { TaxYearConfig } from '@/tax-data/types';
import { TAX_YEARS, getTaxYearConfig, listTaxYearConfigs, requireFonte } from '@/tax-data';
import { Hero, TabsNav, Footer, YearSelector } from '@/ui/components';
import { h, mount } from '@/ui/dom';
import { TabGuia } from '@/ui/sections/TabGuia';
import { TabResumo } from '@/ui/sections/TabResumo';
import { TabRecursos } from '@/ui/sections/TabRecursos';
import { TabCalculadora } from '@/ui/sections/TabCalculadora';
import { formatEUR } from '@/ui/format';

/**
 * Default income year: the most recent year whose values are verified
 * (non-provisional), falling back to the most recent registered year.
 */
function defaultAno(): number {
  const configs = listTaxYearConfigs();
  const verificados = configs.filter((c) => !c.provisorio);
  const pool = verificados.length > 0 ? verificados : configs;
  const last = pool[pool.length - 1];
  if (!last) throw new Error('Nenhum ano fiscal registado em TAX_YEARS.');
  return last.ano;
}

/** Reads the income year from `?ano=`, ignoring values without a registered config. */
function anoFromUrl(): number | null {
  const param = new URLSearchParams(window.location.search).get('ano');
  if (!param) return null;
  const ano = Number(param);
  return TAX_YEARS[ano] ? ano : null;
}

/** Persists the selected income year in the URL (no page reload, no history entry). */
function setAnoInUrl(ano: number): void {
  const url = new URL(window.location.href);
  url.searchParams.set('ano', String(ano));
  window.history.replaceState(null, '', url);
}

function App(config: TaxYearConfig, activeTab?: string): HTMLElement {
  const fonteArt68 = requireFonte(config, 'art68');
  const fonteArt25 = requireFonte(config, 'art25');

  const hero = Hero({
    eyebrow: `Guia pedagógico · Rendimentos de ${config.ano} · A declarar até 30/06/${config.anoDeclaracao}`,
    title: h(
      'span',
      null,
      'Como se calcula ',
      h('em', null, 'o IRS'),
      ', passo a passo.',
    ),
    lede: `Do rendimento bruto ao reembolso (ou pagamento) final, seguindo o método oficial do artigo 68.º do CIRS. Com a tabela em vigor para os rendimentos de ${config.ano}, três métodos de cálculo lado a lado, e uma calculadora interativa.`,
    badge: 'ART. 68.º CIRS',
    meta: [
      { label: 'Fonte', value: 'Portal das Finanças (CIRS)' },
      { label: 'Tabela', value: config.diplomaLegal },
      { label: `IAS ${config.ano}`, value: formatEUR(config.ias) },
    ],
  });

  const yearSelector = YearSelector({
    configs: listTaxYearConfigs(),
    selected: config.ano,
    onSelect: (ano) => {
      setAnoInUrl(ano);
      // Preserve the active tab across the year switch.
      const currentTab = document.querySelector<HTMLElement>('.tabs-nav__btn--active')?.dataset['tab'];
      renderApp(ano, currentTab);
    },
  });

  const tabs = TabsNav({
    defaultTab: activeTab ?? 'guia',
    tabs: [
      { id: 'guia', label: 'Guia completo', render: () => TabGuia(config) },
      { id: 'calculadora', label: 'Calculadora', render: () => TabCalculadora(config) },
      { id: 'resumo', label: 'Resumo navegável', render: () => TabResumo() },
      { id: 'recursos', label: 'Recursos e fontes', render: () => TabRecursos() },
    ],
  });

  const footer = Footer({
    primary: h(
      'span',
      null,
      'Fontes oficiais · ',
      h(
        'a',
        { href: fonteArt68.url, target: '_blank', rel: 'noopener noreferrer' },
        `Artigo 68.º CIRS (rendimentos ${config.ano})`,
      ),
      ' · ',
      h(
        'a',
        { href: fonteArt25.url, target: '_blank', rel: 'noopener noreferrer' },
        'Artigo 25.º CIRS (dedução cat. A)',
      ),
      ' · ',
      h(
        'a',
        {
          href: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/IRS_2025_Principais_prazos_2026.pdf',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        'Prazos IRS 2026 (AT)',
      ),
    ),
    secondary: `Tabela em vigor: ${config.diplomaLegal} · IAS ${config.ano}: ${formatEUR(config.ias)} · Documento pedagógico — não substitui o simulador oficial da AT.`,
  });

  return h('div', { class: 'page' }, hero, yearSelector, tabs, footer);
}

const host = document.getElementById('app');
if (!host) {
  throw new Error('Root element #app not found in index.html');
}

function renderApp(ano: number, activeTab?: string): void {
  mount(host!, App(getTaxYearConfig(ano), activeTab));
}

renderApp(anoFromUrl() ?? defaultAno());
