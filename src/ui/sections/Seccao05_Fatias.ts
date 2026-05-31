import type { TaxYearConfig } from '@/tax-data/types';
import { Section, Markdown, SlicedIncome } from '@/ui/components';

import intro from '@/content/seccao05_intro.md?raw';
import outro from '@/content/seccao05_outro.md?raw';

export function Seccao05_Fatias(config: TaxYearConfig): HTMLElement {
  return Section({
    id: 'fatias',
    sectionNumber: 'SECÇÃO 05',
    title: 'Como o rendimento é fatiado pelos escalões',
    children: [
      Markdown({ source: intro, className: 'intro' }),
      SlicedIncome({ coletavel: 15650, config }),
      Markdown({ source: outro }),
    ],
  });
}
