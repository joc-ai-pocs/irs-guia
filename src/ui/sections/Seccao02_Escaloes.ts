import type { FonteOficial, TaxYearConfig } from '@/tax-data/types';
import { requireFonte } from '@/tax-data';
import {
  Section,
  SourceBox,
  Markdown,
  Callout,
  BracketBar,
} from '@/ui/components';

import intro from '@/content/seccao02_intro.md?raw';
import calloutTaxas from '@/content/seccao02_callout_taxas.md?raw';
import calloutParcela from '@/content/seccao02_callout_parcela.md?raw';

/**
 * Pedagogical section showing the bracket table for the year, with a
 * hover-driven BracketBar. This BracketBar is stand-alone (no external sync) —
 * the live simulator's BracketBar lives in the Calculadora tab.
 */
export function Seccao02_Escaloes(config: TaxYearConfig): HTMLElement {
  // `art68Seguinte` (next year's redaction) is optional — it only exists once
  // the following year's table has been published.
  const fontes = [
    requireFonte(config, 'art68'),
    config.fontes['art68Seguinte'],
    requireFonte(config, 'diploma'),
  ].filter((f): f is FonteOficial => f !== undefined);

  return Section({
    id: 'escaloes',
    sectionNumber: 'SECÇÃO 02',
    title: `Os 9 escalões em vigor para os rendimentos de ${config.ano}`,
    children: [
      Markdown({ source: intro, className: 'intro' }),
      SourceBox({ fontes }),
      BracketBar({ escaloes: config.escaloes }).element,
      Callout({ title: 'Taxa normal vs taxa média', body: Markdown({ source: calloutTaxas }) }),
      Callout({
        title: 'Parcela a abater — de onde vem',
        body: Markdown({ source: calloutParcela }),
      }),
    ],
  });
}
