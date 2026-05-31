/**
 * Application entry point — mounts the full pedagogical guide:
 *
 *   Hero
 *     Tabs (Guia · Resumo · Recursos)
 *       TabGuia    → 8 sections + Calculator + BracketBar (synced)
 *       TabResumo  → 8 navigable summary cards
 *       TabRecursos → 4 grouped link collections
 *   Footer
 *
 * Every tax constant comes from `tax-data/`, every formula from `engine/`.
 * The UI layer composes the result — never duplicates the arithmetic.
 */

import '@/styles/base.css';

import { config2025 } from '@/tax-data/2025';
import { Hero, TabsNav, Footer } from '@/ui/components';
import { h, mount } from '@/ui/dom';
import { TabGuia } from '@/ui/sections/TabGuia';
import { TabResumo } from '@/ui/sections/TabResumo';
import { TabRecursos } from '@/ui/sections/TabRecursos';
import { TabCalculadora } from '@/ui/sections/TabCalculadora';
import { formatEUR } from '@/ui/format';

const config = config2025;

function App(): HTMLElement {
  const hero = Hero({
    eyebrow: `Guia pedagógico · Rendimentos de ${config.ano} · A declarar até 30/06/${config.anoDeclaracao}`,
    title: h(
      'span',
      null,
      'Como se calcula ',
      h('em', null, 'o IRS'),
      ', passo a passo.',
    ),
    lede:
      'Do rendimento bruto ao reembolso (ou pagamento) final, seguindo o método oficial do artigo 68.º do CIRS. Com a tabela em vigor para os rendimentos de 2025, três métodos de cálculo lado a lado, e uma calculadora interativa.',
    badge: 'ART. 68.º CIRS',
    meta: [
      { label: 'Fonte', value: 'Portal das Finanças (CIRS)' },
      { label: 'Tabela', value: config.diplomaLegal },
      { label: `IAS ${config.ano}`, value: formatEUR(config.ias) },
    ],
  });

  const tabs = TabsNav({
    defaultTab: 'guia',
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
        {
          href: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/ra/Pages/irs68ra_202512.aspx',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        'Artigo 68.º CIRS (rendimentos 2025)',
      ),
      ' · ',
      h(
        'a',
        {
          href: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs25.aspx',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
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

  return h('div', { class: 'page' }, hero, tabs, footer);
}

const host = document.getElementById('app');
if (!host) {
  throw new Error('Root element #app not found in index.html');
}
mount(host, App());
