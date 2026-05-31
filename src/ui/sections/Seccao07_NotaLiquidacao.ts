import type { TaxYearConfig } from '@/tax-data/types';
import { requireFonte } from '@/tax-data';
import { Section, SourceBox, Markdown, Callout, StepTable } from '@/ui/components';
import { h } from '@/ui/dom';

import intro from '@/content/seccao07_intro.md?raw';
import callout from '@/content/seccao07_callout.md?raw';

export function Seccao07_NotaLiquidacao(config: TaxYearConfig): HTMLElement {
  const fontes = [requireFonte(config, 'decoNota'), requireFonte(config, 'modelo3')];

  return Section({
    id: 'nota-liquidacao',
    sectionNumber: 'SECÇÃO 07',
    title: 'Anatomia da nota de liquidação',
    children: [
      Markdown({ source: intro, className: 'intro' }),
      SourceBox({ fontes }),
      StepTable({
        headers: ['Linha', 'Descrição', 'Origem'],
        rows: notaLiquidacaoRows(),
      }),
      Callout({ title: 'Leitura do resultado', body: Markdown({ source: callout }) }),
    ],
  });
}

function notaLiquidacaoRows() {
  return [
    ['01', 'Rendimento global', '— soma de cat. A, B, F, etc., conforme englobamento', 'Soma dos anexos'],
    ['02', 'Deduções específicas', '— abatimento próprio de cada categoria', 'Automático'],
    ['03', 'Perdas a recuperar', '— p. ex., menos-valias de anos anteriores', 'Anexos G'],
    ['04', 'Abatimento por mínimo de existência', '— para rendimentos baixos', 'Automático'],
    ['05', 'Deduções ao rendimento', '— pensão de alimentos, PPR (em certos casos)', 'Anexo H'],
    ['06', 'Rendimento coletável', '= 01 − (02 + 03 + 04 + 05)', 'Calculado'],
    ['07', 'Quociente rendimentos anos anteriores', '', 'Opcional'],
    ['08', 'Rendimentos isentos englobados para determinação da taxa', '', 'Anexo H'],
    ['09', 'Total para determinação da taxa', '= 06 + 08 − 07', 'Calculado'],
    ['10', 'Quociente familiar', '— × 1 (individual) ou × 2 (conjunta)', 'Rosto'],
    ['11', 'Importância apurada', '= 10 × taxa do escalão', 'Tabela art. 68.º'],
    ['12', 'Parcela a abater', '— da tabela do método 3', 'Tabela art. 68.º'],
    ['13–16', 'Ajustes', '— anos anteriores, isentos, taxa adicional, quociente familiar', 'Diversos'],
    ['17', 'Tributações autónomas', '— p. ex., despesas confidenciais', 'Anexo B/C'],
    ['18', 'Coleta total', '= (11 − 12) × q. familiar + 13 − 14 + 15 + 16 + 17', 'Calculado'],
    ['19', 'Deduções à coleta', '— e-fatura, anexo H', 'Automático + Anexo H'],
    ['20', 'Benefício municipal', '= coleta × % devolução do município', 'Município'],
    ['21', 'Acréscimos à coleta', '', 'Caso aplicável'],
    ['22', 'Coleta líquida', '= 18 − 19 − 20 + 21', 'Calculado'],
    ['23', 'Pagamentos por conta', '— só cat. B', 'Anexo B'],
    ['24', 'Retenções na fonte', '— IRS adiantado durante o ano', 'Automático'],
    ['25', 'Imposto apurado', '= 22 − (23 + 24)', 'Calculado'],
  ].map(([num, title, rest, origem]) => ({
    num: num ?? '',
    label: h(
      'span',
      null,
      h('strong', null, title ?? ''),
      rest ? ` ${rest}` : null,
    ),
    value: origem ?? '',
  }));
}
