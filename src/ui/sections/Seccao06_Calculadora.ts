import type { TaxYearConfig } from '@/tax-data/types';
import { Section, Markdown, CtaButton } from '@/ui/components';

import intro from '@/content/seccao06_intro.md?raw';

/**
 * Teaser version of section 06. The actual interactive calculator lives in its
 * own top-level tab — keeps it from being buried mid-scroll and gives it the
 * full viewport for the input grid + line-by-line output.
 *
 * The anchor id (`calculadora`) is preserved so the TOC entry still resolves,
 * but the TOC item itself targets the new tab directly via {@link TocItem.tab}.
 */
export function Seccao06_Calculadora(_config: TaxYearConfig): HTMLElement {
  return Section({
    id: 'calculadora',
    sectionNumber: 'SECÇÃO 06',
    title: 'Calculadora interativa',
    children: [
      Markdown({ source: intro, className: 'intro' }),
      CtaButton({ label: 'Abrir calculadora', targetTab: 'calculadora' }),
    ],
  });
}
