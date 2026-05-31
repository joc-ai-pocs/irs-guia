import type { TaxYearConfig } from '@/tax-data/types';
import { requireFonte } from '@/tax-data';
import {
  Section,
  SourceBox,
  Markdown,
  Callout,
  FormulaBlock,
} from '@/ui/components';
import { formatEUR } from '@/ui/format';

import intro from '@/content/seccao04_intro.md?raw';
import paragraph from '@/content/seccao04_paragraph.md?raw';
import callout from '@/content/seccao04_callout.md?raw';

export function Seccao04_DeducoesEspecificas(config: TaxYearConfig): HTMLElement {
  const fontes = [
    requireFonte(config, 'art25'),
    requireFonte(config, 'art53'),
    requireFonte(config, 'ias'),
  ];

  return Section({
    id: 'deducoes-especificas',
    sectionNumber: 'SECÇÃO 04',
    title: 'Dedução específica de Categoria A e H',
    children: [
      Markdown({ source: intro, className: 'intro' }),
      SourceBox({ label: 'Fontes oficiais (base legal e valor do IAS)', fontes }),
      FormulaBlock({
        label: `Dedução específica cat. A/H (${config.ano}) =`,
        segments: [
          { kind: 'text', value: `${config.deducaoEspecificaCoef} ` },
          { kind: 'op', value: '×' },
          { kind: 'text', value: ` IAS = ${config.deducaoEspecificaCoef} ` },
          { kind: 'op', value: '×' },
          { kind: 'text', value: ` ${formatEUR(config.ias)} = ` },
          { kind: 'result', value: formatEUR(config.deducaoEspecificaMinima) },
        ],
      }),
      Markdown({ source: paragraph }),
      Callout({ title: 'No caso da tua família', body: Markdown({ source: callout }) }),
    ],
  });
}
