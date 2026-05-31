import type { TaxYearConfig } from '@/tax-data/types';
import { requireFonte } from '@/tax-data';
import {
  Section,
  SourceBox,
  Markdown,
  Callout,
  MethodsGrid,
} from '@/ui/components';

import intro from '@/content/seccao03_intro.md?raw';
import paragraph from '@/content/seccao03_paragraph.md?raw';
import callout from '@/content/seccao03_callout.md?raw';

export function Seccao03_Metodos(config: TaxYearConfig): HTMLElement {
  const fontes = [
    requireFonte(config, 'art68'),
    requireFonte(config, 'montepio'),
    requireFonte(config, 'santander'),
  ];

  return Section({
    id: 'metodos',
    sectionNumber: 'SECÇÃO 03',
    title: 'Três métodos, mesmo resultado',
    children: [
      Markdown({ source: intro, className: 'intro' }),
      SourceBox({ label: 'Fontes oficiais e didáticas', fontes }),
      Markdown({ source: paragraph }),
      MethodsGrid({ exemploColetavel: 15650, config }),
      Callout({ title: 'Pequena diferença nos cêntimos', body: Markdown({ source: callout }) }),
    ],
  });
}
