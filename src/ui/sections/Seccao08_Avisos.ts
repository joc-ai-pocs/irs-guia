import type { TaxYearConfig } from '@/tax-data/types';
import { Section, Markdown, Callout } from '@/ui/components';

import intro from '@/content/seccao08_intro.md?raw';
import catf from '@/content/seccao08_callout_catf.md?raw';
import anexod from '@/content/seccao08_callout_anexod.md?raw';
import conjunta from '@/content/seccao08_callout_conjunta.md?raw';
import validacao from '@/content/seccao08_callout_validacao.md?raw';

export function Seccao08_Avisos(_config: TaxYearConfig): HTMLElement {
  return Section({
    id: 'avisos',
    sectionNumber: 'SECÇÃO 08',
    title: 'O que esta calculadora não cobre',
    children: [
      Markdown({ source: intro, className: 'intro' }),
      Callout({ title: 'Categoria F — Rendas', body: Markdown({ source: catf }) }),
      Callout({ title: 'Anexo D — Transparência fiscal', body: Markdown({ source: anexod }) }),
      Callout({ title: 'Tributação conjunta vs separada', body: Markdown({ source: conjunta }) }),
      Callout({ title: 'Validação oficial', body: Markdown({ source: validacao }) }),
    ],
  });
}
