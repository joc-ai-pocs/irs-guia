/**
 * Entry point — renders a demo page equivalent to the section 04 of the
 * pedagogical guide ("dedução específica cat. A/H"), built entirely from
 * the new components and driven by real data from the engine.
 *
 * This demo exists to prove the architecture works end-to-end:
 * tax-data → engine → format → ui/components → DOM.
 */

import '@/styles/base.css';

import { config2025 } from '@/tax-data/2025';
import { requireFonte } from '@/tax-data';
import { calcularLiquidacao } from '@/engine';
import { formatEUR, formatEURSigned } from '@/ui/format';
import { h, mount } from '@/ui/dom';

import {
  SectionHeader,
  Lede,
  SourceBox,
  FormulaBlock,
  Callout,
  StepTable,
  MarginalNote,
} from '@/ui/components';

// ─────────────────────────────────────────────────────────────────────────
// Pull the sources we need from the typed registry (no hardcoded URLs).
// requireFonte throws early with a clear message if a referenced source is missing.
// ─────────────────────────────────────────────────────────────────────────
const art25 = requireFonte(config2025, 'art25');
const art53 = requireFonte(config2025, 'art53');
const ias = requireFonte(config2025, 'ias');

// ─────────────────────────────────────────────────────────────────────────
// Run a sample calculation that matches the StepTable example in the demo.
// ─────────────────────────────────────────────────────────────────────────
const liquidacao = calcularLiquidacao(
  {
    rendimentoBruto: 14135.53,
    deducoesColeta: 275.41,
    beneficioMunicipalPct: 0.01,
    retencaoFonte: 968,
  },
  config2025,
);

// ─────────────────────────────────────────────────────────────────────────
// Build the page using the component library.
// ─────────────────────────────────────────────────────────────────────────
function App(): HTMLElement {
  const page = h('div', { class: 'page' });

  // 1 — SectionHeader (title with inline emphasis)
  page.appendChild(
    SectionHeader({
      eyebrow: 'Categoria A e H',
      sectionNumber: 'SECÇÃO 04',
      title: h(
        'span',
        null,
        'Dedução específica do ',
        h('em', null, 'trabalho dependente'),
      ),
    }),
  );

  // 2 — Lede with one italic emphasis
  page.appendChild(
    Lede({
      content: [
        'A "dedução automática" que ',
        h('em', null, 'abate'),
        ' ao rendimento bruto antes de chegar ao coletável. Para trabalhadores por conta de outrem e pensionistas, o valor em 2025 é fixo e ancorado no IAS.',
      ],
    }),
  );

  // 3 — SourceBox pulling fontes directly from the typed config
  page.appendChild(SourceBox({ fontes: [art25, art53, ias] }));

  // body paragraph between SourceBox and Formula
  page.appendChild(
    h(
      'div',
      { class: 'body' },
      h(
        'p',
        null,
        'O valor da dedução específica para ',
        h('strong', null, 'categoria A e H'),
        ' em 2025 corresponde a um múltiplo do ',
        h('em', { class: 'term' }, 'IAS'),
        ', conforme a alínea a) do n.º 1 do ',
        h(
          'a',
          {
            class: 'ref',
            href: art25.url,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          'artigo 25.º do CIRS',
        ),
        '.',
      ),
    ),
  );

  // 4 — FormulaBlock with structured segments (label / text / op / result)
  page.appendChild(
    FormulaBlock({
      label: 'Dedução específica cat. A/H em 2025',
      segments: [
        { kind: 'text', value: `${config2025.deducaoEspecificaCoef} ` },
        { kind: 'op', value: '×' },
        { kind: 'text', value: ` IAS = ${config2025.deducaoEspecificaCoef} ` },
        { kind: 'op', value: '×' },
        { kind: 'text', value: ` ${formatEUR(config2025.ias)} = ` },
        {
          kind: 'result',
          value: formatEUR(config2025.deducaoEspecificaMinima),
        },
      ],
    }),
  );

  // 5 — Callout
  page.appendChild(
    Callout({
      title: 'Diferença crítica',
      body: h(
        'span',
        null,
        h('strong', null, 'Rendimento bruto ≠ rendimento coletável.'),
        ' Os escalões aplicam-se ao ',
        h('em', { class: 'term' }, 'coletável'),
        ', não ao bruto. Um salário bruto anual de 14 000 € corresponde a um coletável de cerca de 9 540 €, que cai no 2.º escalão — não no 3.º.',
      ),
    }),
  );

  // 6 — StepTable driven by the engine result (no hardcoded numbers in the UI)
  page.appendChild(
    StepTable({
      caption: 'Anatomia simplificada do cálculo',
      rows: [
        {
          num: '01',
          label: h(
            'span',
            null,
            h('strong', null, 'Rendimento bruto'),
            ' — soma da categoria A do agregado.',
          ),
          value: formatEUR(liquidacao.rendimentoBruto),
        },
        {
          num: '02',
          label: h(
            'span',
            null,
            h('strong', null, '− Dedução específica'),
            ' — 8,54 × IAS.',
          ),
          value: formatEURSigned(liquidacao.deducaoEspecifica),
        },
        {
          num: '06',
          label: h(
            'span',
            null,
            h('strong', null, '= Rendimento coletável'),
            ' — base para a tabela do art. 68.º.',
          ),
          value: formatEUR(liquidacao.rendimentoColetavel),
        },
        {
          num: '11',
          label: h(
            'span',
            null,
            h('strong', null, `× Taxa do ${liquidacao.coleta.escalao.numero}.º escalão`),
            ` — ${(liquidacao.coleta.escalao.taxaNormal * 100).toFixed(1)}% (método 3).`,
          ),
          value: formatEUR(liquidacao.coleta.importanciaApurada),
        },
        {
          num: '12',
          label: h(
            'span',
            null,
            h('strong', null, '− Parcela a abater'),
            ' — tabela do art. 68.º.',
          ),
          value: formatEURSigned(liquidacao.coleta.parcelaAbater),
        },
        {
          num: '18',
          label: h(
            'span',
            null,
            h('strong', null, '= Coleta total'),
            ' — antes de deduções à coleta.',
          ),
          value: formatEUR(liquidacao.coletaTotal),
        },
      ],
    }),
  );

  // 7 — MarginalNote
  page.appendChild(
    MarginalNote({
      content:
        'O multiplicador "8,54" não é arbitrário — foi a fórmula encontrada para indexar a dedução ao IAS sem ter de a atualizar nominalmente em cada Orçamento de Estado. Se o IAS sobe, a dedução sobe automaticamente.',
    }),
  );

  return page;
}

// ─────────────────────────────────────────────────────────────────────────
// Mount
// ─────────────────────────────────────────────────────────────────────────
const host = document.getElementById('app');
if (!host) {
  throw new Error('Root element #app not found in index.html');
}
mount(host, App());
