import type { TaxYearConfig } from '@/tax-data/types';
import { TableOfContents } from '@/ui/components';
import { h } from '@/ui/dom';

import { Seccao01_VistaGeral } from './Seccao01_VistaGeral';
import { Seccao02_Escaloes } from './Seccao02_Escaloes';
import { Seccao03_Metodos } from './Seccao03_Metodos';
import { Seccao04_DeducoesEspecificas } from './Seccao04_DeducoesEspecificas';
import { Seccao05_Fatias } from './Seccao05_Fatias';
import { Seccao06_Calculadora } from './Seccao06_Calculadora';
import { Seccao07_NotaLiquidacao } from './Seccao07_NotaLiquidacao';
import { Seccao08_Avisos } from './Seccao08_Avisos';

/**
 * Tab "Guia completo" — assembles the 8 pedagogical sections behind a TOC.
 *
 * Note: Section 06 is now a teaser pointing to the dedicated Calculadora tab.
 * The TOC entry for "Calculadora interativa" therefore targets that tab
 * directly (via `tab: 'calculadora'`) instead of scrolling within this tab.
 */
export function TabGuia(config: TaxYearConfig): HTMLElement {
  return h(
    'div',
    { class: 'tab-guia' },
    TableOfContents({
      items: [
        { href: '#vista-geral', label: 'Vista geral do cálculo' },
        { href: '#escaloes', label: 'Os escalões em vigor' },
        { href: '#metodos', label: 'Três métodos, mesmo resultado' },
        { href: '#deducoes-especificas', label: 'Dedução específica (cat. A/H)' },
        { href: '#fatias', label: 'Como o rendimento é fatiado' },
        { href: '#', label: 'Calculadora interativa', tab: 'calculadora' },
        { href: '#nota-liquidacao', label: 'Anatomia da nota de liquidação' },
        { href: '#avisos', label: 'Limites deste cálculo' },
      ],
    }),
    Seccao01_VistaGeral(config),
    Seccao02_Escaloes(config),
    Seccao03_Metodos(config),
    Seccao04_DeducoesEspecificas(config),
    Seccao05_Fatias(config),
    Seccao06_Calculadora(config),
    Seccao07_NotaLiquidacao(config),
    Seccao08_Avisos(config),
  );
}
