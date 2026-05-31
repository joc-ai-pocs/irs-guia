import { Markdown, ResumoCard } from '@/ui/components';
import { h } from '@/ui/dom';

import resumoIntro from '@/content/resumo_intro.md?raw';
import r01 from '@/content/resumo01.md?raw';
import r02 from '@/content/resumo02.md?raw';
import r03 from '@/content/resumo03.md?raw';
import r04 from '@/content/resumo04.md?raw';
import r05 from '@/content/resumo05.md?raw';
import r06 from '@/content/resumo06.md?raw';
import r07 from '@/content/resumo07.md?raw';
import r08 from '@/content/resumo08.md?raw';

/**
 * Tab "Resumo navegável" — 8 short cards mirroring the 8 guide sections, each
 * a clickable shortcut back into the full guide.
 */
export function TabResumo(): HTMLElement {
  return h(
    'div',
    { class: 'tab-resumo' },
    Markdown({ source: resumoIntro, className: 'intro' }),
    ResumoCard({ num: '01', tag: 'VISTA GERAL', title: 'Os 7 passos do cálculo, em síntese', bulletsMd: r01 }),
    ResumoCard({ num: '02', tag: 'ESCALÕES 2025', title: 'Os 9 escalões em vigor para os rendimentos de 2025', bulletsMd: r02 }),
    ResumoCard({ num: '03', tag: 'MÉTODOS DE CÁLCULO', title: 'Três formas equivalentes de calcular a coleta', bulletsMd: r03 }),
    ResumoCard({ num: '04', tag: 'DEDUÇÃO ESPECÍFICA', title: 'Como se calcula a dedução de cat. A/H em 2025', bulletsMd: r04 }),
    ResumoCard({ num: '05', tag: 'ANEXOS POR PERFIL', title: 'Anexos a usar nos 4 IRS da família', bulletsMd: r05 }),
    ResumoCard({ num: '06', tag: 'PRAZOS-CHAVE', title: 'Calendário do IRS 2026 (rendimentos de 2025)', bulletsMd: r06 }),
    ResumoCard({ num: '07', tag: 'TRIBUTAÇÃO DE RENDAS', title: 'Categoria F — pontos críticos para contribuintes com rendas', bulletsMd: r07 }),
    ResumoCard({ num: '08', tag: 'DEDUÇÕES À COLETA', title: 'O que entra no Anexo H (limites principais)', bulletsMd: r08 }),
  );
}
