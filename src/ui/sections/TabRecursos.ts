import { Markdown, ResourceGroup } from '@/ui/components';
import { h } from '@/ui/dom';

import recursosIntro from '@/content/recursos_intro.md?raw';

/**
 * Tab "Recursos e fontes" — 4 grouped collections of official + didactic
 * links. The data is structured (not markdown) so the cards are programmable
 * and the order is stable.
 */
export function TabRecursos(): HTMLElement {
  return h(
    'div',
    { class: 'tab-recursos' },
    Markdown({ source: recursosIntro, className: 'intro' }),
    ResourceGroup({
      title: 'Código do IRS — artigos fundamentais',
      subtitle: 'Portal das Finanças · info.portaldasfinancas.gov.pt',
      cards: [
        {
          tag: 'CIRS · ÍNDICE',
          title: 'Código do IRS — índice geral',
          description:
            'Ponto de entrada para todos os artigos do CIRS, com redações anteriores acessíveis.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/codigo-do-irs-indice.aspx',
        },
        {
          tag: 'CIRS · ART. 68.º (2025)',
          title: 'Taxas gerais — rendimentos de 2025',
          description:
            'Tabela dos 9 escalões em vigor para os rendimentos a declarar em 2026 (Lei 55-A/2025).',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/ra/Pages/irs68ra_202512.aspx',
        },
        {
          tag: 'CIRS · ART. 68.º (2026)',
          title: 'Taxas gerais — rendimentos de 2026',
          description:
            'Tabela em vigor para os rendimentos a declarar em 2027 (Lei 73-A/2025). Já refletida nas tabelas de retenção de 2026.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx',
        },
        {
          tag: 'CIRS · ART. 25.º',
          title: 'Dedução específica cat. A (trabalho dependente)',
          description:
            'Base legal dos 8,54 × IAS, indemnizações, quotizações sindicais e quotas a ordens profissionais.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs25.aspx',
        },
        {
          tag: 'CIRS · ART. 53.º',
          title: 'Dedução específica cat. H (pensões)',
          description: 'Regras de dedução para pensionistas (idêntica em valor à cat. A).',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs53.aspx',
        },
        {
          tag: 'CIRS · ART. 31.º',
          title: 'Dedução específica cat. B (independentes)',
          description:
            'Regime simplificado, coeficientes, regra dos 15% — relevante para o Anexo D.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs31.aspx',
        },
        {
          tag: 'CIRS · ART. 41.º',
          title: 'Dedução específica cat. F (rendas)',
          description: 'Despesas dedutíveis: IMI, condomínio, seguros, obras de conservação, AIMI.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs41.aspx',
        },
        {
          tag: 'CIRS · ART. 72.º',
          title: 'Taxas especiais (rendas, mais-valias)',
          description:
            'Taxa autónoma de rendas (25%), reduções por contrato longa duração, opção pelo englobamento.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs72.aspx',
        },
        {
          tag: 'CIRS · ART. 20.º',
          title: 'Transparência fiscal',
          description: 'Imputação especial — base do Anexo D. Remete para o art. 6.º do CIRC.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs20.aspx',
        },
      ],
    }),
    ResourceGroup({
      title: 'Modelo 3 e prazos',
      subtitle: 'Portal das Finanças — Apoio ao Contribuinte',
      cards: [
        {
          tag: 'MODELO 3',
          title: 'Página oficial da Modelo 3',
          description:
            'Entrega da declaração, consulta, modelos e formulários, FAQ de preenchimento.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_ao_contribuinte/Cidadaos/Rendimentos/Declaracao/Modelo_3/Paginas/default.aspx',
        },
        {
          tag: 'IRS AUTOMÁTICO',
          title: 'IRS Automático — quando se aplica',
          description:
            'Condições de elegibilidade (cat. A/H, residentes, agregado simples) e mecânica de confirmação.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_ao_contribuinte/Cidadaos/Rendimentos/Declaracao/IRS_automatico/Paginas/default.aspx',
        },
        {
          tag: 'FOLHETO PDF',
          title: 'Principais prazos IRS 2026',
          description:
            'Calendário completo da AT: comunicações, entrega da Modelo 3, liquidação e pagamento.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/IRS_2025_Principais_prazos_2026.pdf',
        },
        {
          tag: 'FOLHETOS',
          title: 'Folhetos informativos AT',
          description:
            'Catálogo completo: IRS, dispensa de entrega, deduções e benefícios, agregado familiar, IFICI.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Pages/default.aspx',
        },
      ],
    }),
    ResourceGroup({
      title: 'Legislação aplicável aos rendimentos de 2025',
      subtitle: 'Diplomas em vigor',
      cards: [
        {
          tag: 'LEI 55-A/2025',
          title: 'Atualização dos escalões para 2025',
          description:
            'PDF oficial. Diploma que estabelece a tabela do art. 68.º aplicável aos rendimentos a declarar em 2026.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_55_A_2025.pdf',
        },
        {
          tag: 'LEI 45-A/2024',
          title: 'OE 2025 — alterações ao CIRS',
          description:
            'PDF oficial. OE 2025 — fixou dedução específica em 8,54 × IAS e baixou a retenção de independentes para 23%.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_45_A_2024.pdf',
        },
        {
          tag: 'LEI 73-A/2025',
          title: 'OE 2026 — escalões para 2026',
          description:
            'PDF oficial. OE 2026, em vigor desde 30/12/2025. Reduz taxas até ao 8.º escalão e atualiza limites.',
          url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_73_A_2025.pdf',
        },
        {
          tag: 'IAS 2025',
          title: 'Indexante dos Apoios Sociais',
          description:
            'Valor oficial do IAS publicado pela Segurança Social. Base para o cálculo da dedução específica.',
          url: 'https://www.seg-social.pt/ias-indexante-dos-apoios-sociais',
        },
      ],
    }),
    ResourceGroup({
      title: 'Recursos didáticos complementares',
      subtitle: 'Bancos, contabilistas e associações de consumidores',
      cards: [
        {
          tag: 'DECO PROTESTE',
          title: 'IRS — preencher passo a passo',
          description:
            'Guia detalhado de preenchimento da Modelo 3 com casos práticos e dicas, atualizado anualmente.',
          url: 'https://www.deco.proteste.pt/dinheiro/impostos/dicas/irs-ajudamos-preencher-passo-a-passo',
        },
        {
          tag: 'DECO PROTESTE',
          title: 'Descodificar a nota de liquidação',
          description: 'Explicação linha a linha do que cada rubrica significa, com exemplos.',
          url: 'https://www.deco.proteste.pt/dinheiro/impostos/noticias/descodifique-nota-liquidacao-irs',
        },
        {
          tag: 'DOUTOR FINANÇAS',
          title: 'Calendário IRS 2026 completo',
          description:
            'Cronograma de obrigações pré-entrega (comunicações, e-fatura) com datas precisas.',
          url: 'https://www.doutorfinancas.pt/impostos/irs/calendario-irs-2026-os-prazos-para-evitar-coimas-e-perder-deducoes/',
        },
        {
          tag: 'SANTANDER SALTO',
          title: 'Como funcionam os escalões de IRS',
          description:
            'Explicação com casos práticos do método 1 (taxa média + taxa normal), claro e bem ilustrado.',
          url: 'https://www.santander.pt/salto/escaloes-irs',
        },
        {
          tag: 'MONTEPIO',
          title: 'Sabe qual é o seu escalão?',
          description: 'Casos de cálculo detalhados com tributação individual e conjunta.',
          url: 'https://www.montepio.org/ei/mais-recentes/escaloes-de-irs-sabe-qual-e-o-seu/',
        },
        {
          tag: 'CGD SALDO POSITIVO',
          title: 'Escalões vs tabelas de retenção',
          description:
            'Diferença entre escalões (anual, sobre o coletável) e tabelas de retenção (mensal, sobre o bruto).',
          url: 'https://www.cgd.pt/Site/Saldo-Positivo/leis-e-impostos/Pages/diferenca-entre-escaloes-de-irs-e-tabelas-de-irs.aspx',
        },
      ],
    }),
  );
}
