import type { TaxYearConfig } from '@/tax-data/types';
import { requireFonte } from '@/tax-data';
import { Section, SourceBox, StepTable, Callout, Markdown } from '@/ui/components';
import { h } from '@/ui/dom';

import intro from '@/content/seccao01_intro.md?raw';
import callout from '@/content/seccao01_callout.md?raw';

export function Seccao01_VistaGeral(config: TaxYearConfig): HTMLElement {
  const fontes = [requireFonte(config, 'cirsIndice'), requireFonte(config, 'modelo3')];

  return Section({
    id: 'vista-geral',
    sectionNumber: 'SECÇÃO 01',
    title: 'Vista geral: do bruto ao reembolso em sete passos',
    children: [
      Markdown({ source: intro, className: 'intro' }),
      SourceBox({ fontes }),
      StepTable({
        headers: ['Passo', 'Operação', 'Resultado'],
        rows: [
          {
            num: '01',
            label: h(
              'span',
              null,
              h('strong', null, 'Rendimento bruto'),
              ' — soma dos rendimentos de todas as categorias (A, B, F, etc.) do agregado familiar.',
            ),
            value: 'R bruto',
          },
          {
            num: '02',
            label: h(
              'span',
              null,
              h('strong', null, '− Deduções específicas'),
              ' — abatimento próprio de cada categoria (p. ex., 4 462,15 € para cat. A/H — ver secção 04).',
            ),
            value: 'R bruto − D esp',
          },
          {
            num: '03',
            label: h(
              'span',
              null,
              h('strong', null, '− Perdas, abatimentos, deduções ao rendimento'),
              ' — perdas a recuperar de anos anteriores, mínimo de existência, PPR, etc.',
            ),
            value: '→ R coletável',
          },
          {
            num: '04',
            label: h(
              'span',
              null,
              h('strong', null, 'Aplicar tabela do art. 68.º'),
              ' — encaixar R coletável num dos 9 escalões e calcular a coleta total (ver secção 02).',
            ),
            value: 'C total',
          },
          {
            num: '05',
            label: h(
              'span',
              null,
              h('strong', null, '− Deduções à coleta'),
              ' — saúde, educação, habitação, despesas gerais familiares, e-fatura (limites legais).',
            ),
            value: 'C total − D col',
          },
          {
            num: '06',
            label: h(
              'span',
              null,
              h('strong', null, '− Benefício municipal'),
              ' — devolução de IRS pelo município de residência fiscal (0% a 5%).',
            ),
            value: '→ C líquida',
          },
          {
            num: '07',
            label: h(
              'span',
              null,
              h('strong', null, '− Retenções na fonte − Pagamentos por conta'),
              ' — o que já foi adiantado ao Estado durante o ano.',
            ),
            value: '→ Reembolso ou pagamento',
          },
        ],
      }),
      Callout({
        title: 'Diferença crítica',
        body: Markdown({ source: callout }),
      }),
    ],
  });
}
