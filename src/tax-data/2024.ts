import type { TaxYearConfig } from './types';

/**
 * Tax configuration for income earned in 2024 (filed in 2025).
 *
 * IMPORTANT — 2024 had two successive bracket tables. The values below are the
 * REVISED table introduced by Lei n.º 33/2024, de 7 de agosto, which lowered the
 * general IRS rates retroactively for the whole of 2024. This is the table that
 * applies to the annual liquidation of 2024 income (declared in 2025), NOT the
 * original OE 2024 table from Lei n.º 82/2023.
 *
 * All figures verified against the Portal das Finanças "IRS 2024 — Deduções,
 * benefícios e taxas" page and the Diário da República texts of Lei 33/2024
 * (taxas) and Lei 32/2024 (deduções específicas). Parcelas a abater are the
 * officially published values and are internally consistent (continuity of tax
 * at each bracket boundary).
 */
export const config2024: TaxYearConfig = {
  ano: 2024,
  anoDeclaracao: 2025,
  diplomaLegal: 'Lei n.º 33/2024, de 7 de agosto (revisão das taxas; OE 2024: Lei n.º 82/2023)',
  ias: 509.26,
  deducaoEspecificaCoef: 8.54,
  // Lei 32/2024: a dedução específica das cat. A/H subiu de 4 104 € para 4 350,24 €
  // (4 104 × 1,06 — a taxa de atualização do IAS em 2024). NOTA: este valor legislado
  // NÃO é exatamente 8.54 × IAS (= 4 349,08). O engine usa este valor materializado;
  // o coeficiente 8.54 fica apenas como referência histórica.
  deducaoEspecificaMinima: 4350.24,

  // Art. 70.º n.º 1 CIRS — valor de referência do mínimo de existência para 2024.
  // 1.5 × 14 × 509.26 = 10 694,46 < 11 480 → V = 11 480 (limiar fixo em vigor para 2024).
  valorReferenciaMinimoExistencia: 11480,
  // Art. 78.º-B CIRS — limite por sujeito passivo.
  limiteDespesasGerais: 250,

  // Art. 72.º CIRS — taxas autónomas para rendas prediais (cat. F).
  taxasCatF: {
    padrao: 0.25,
    duracao5a10: 0.15,
    duracao10a20: 0.10,
    duracao20mais: 0.05,
  },

  escaloes: [
    { numero: 1, limiteSuperior: 7703,                       taxaNormal: 0.130, taxaMedia: 0.13000,  parcelaAbater: 0        },
    { numero: 2, limiteSuperior: 11623,                      taxaNormal: 0.165, taxaMedia: 0.14180,  parcelaAbater: 269.61   },
    { numero: 3, limiteSuperior: 16472,                      taxaNormal: 0.220, taxaMedia: 0.16482,  parcelaAbater: 908.92   },
    { numero: 4, limiteSuperior: 21321,                      taxaNormal: 0.250, taxaMedia: 0.18419,  parcelaAbater: 1403.08  },
    { numero: 5, limiteSuperior: 27146,                      taxaNormal: 0.320, taxaMedia: 0.21333,  parcelaAbater: 2895.61  },
    { numero: 6, limiteSuperior: 39791,                      taxaNormal: 0.355, taxaMedia: 0.25836,  parcelaAbater: 3845.50  },
    { numero: 7, limiteSuperior: 43000,                      taxaNormal: 0.435, taxaMedia: 0.27153,  parcelaAbater: 7029.08  },
    { numero: 8, limiteSuperior: 80000,                      taxaNormal: 0.450, taxaMedia: 0.35408,  parcelaAbater: 7673.78  },
    { numero: 9, limiteSuperior: Number.POSITIVE_INFINITY,   taxaNormal: 0.480, taxaMedia: null,     parcelaAbater: 10073.60 },
  ],

  deducoesColeta: [
    { id: 'gerais',    label: 'Despesas gerais familiares',      percentagem: 0.35, tetoEuros: 250,  fonteId: 'cirs78b', nota: 'Por sujeito passivo. Até 500 € em conjuntos.' },
    { id: 'saude',     label: 'Saúde',                            percentagem: 0.15, tetoEuros: 1000, fonteId: 'cirs78c' },
    { id: 'educacao',  label: 'Educação e formação',              percentagem: 0.30, tetoEuros: 800,  fonteId: 'cirs78d', nota: 'Até 1 100 € com despesas de estudante deslocado.' },
    { id: 'rendas',    label: 'Rendas (inquilino)',               percentagem: 0.15, tetoEuros: 600,  fonteId: 'cirs78e' },
    { id: 'ppr-young', label: 'PPR (até 35 anos)',                percentagem: 0.20, tetoEuros: 400,  fonteId: 'ebf21' },
    { id: 'ppr-mid',   label: 'PPR (35–50 anos)',                 percentagem: 0.20, tetoEuros: 350,  fonteId: 'ebf21' },
    { id: 'ppr-old',   label: 'PPR (acima 50 anos)',              percentagem: 0.20, tetoEuros: 300,  fonteId: 'ebf21' },
  ],

  fontes: {
    cirsIndice: {
      id: 'cirsIndice',
      label: 'Código do IRS (CIRS) — índice geral',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/codigo-do-irs-indice.aspx',
    },
    art68: {
      id: 'art68',
      label: 'Art. 68.º CIRS — tabela de taxas para rendimentos de 2024 (Portal das Finanças)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/IRS/IRS_2024/Paginas/5_Deducoes_beneficios_taxas.aspx',
    },
    // Next year's redaction of art. 68.º — shown alongside the current table.
    art68Seguinte: {
      id: 'art68Seguinte',
      label: 'Art. 68.º CIRS — redação para rendimentos de 2025 (Lei 55-A/2025)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/ra/Pages/irs68ra_202512.aspx',
    },
    art20: {
      id: 'art20',
      label: 'Art. 20.º CIRS — Transparência fiscal',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs20.aspx',
    },
    art31: {
      id: 'art31',
      label: 'Art. 31.º CIRS — Dedução específica cat. B (regime simplificado)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs31.aspx',
    },
    art25: {
      id: 'art25',
      label: 'Art. 25.º CIRS — Rendimentos do trabalho dependente: deduções',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs25.aspx',
    },
    art53: {
      id: 'art53',
      label: 'Art. 53.º CIRS — Pensões (dedução específica cat. H)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs53.aspx',
    },
    art41: {
      id: 'art41',
      label: 'Art. 41.º CIRS — Dedução específica cat. F (rendas)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs41.aspx',
    },
    art72: {
      id: 'art72',
      label: 'Art. 72.º CIRS — Taxas especiais (rendas, mais-valias)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs72.aspx',
    },
    cirs78b: {
      id: 'cirs78b',
      label: 'Art. 78.º-B CIRS — Despesas gerais familiares',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78b.aspx',
    },
    cirs78c: {
      id: 'cirs78c',
      label: 'Art. 78.º-C CIRS — Despesas de saúde',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78c.aspx',
    },
    cirs78d: {
      id: 'cirs78d',
      label: 'Art. 78.º-D CIRS — Despesas de educação',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78d.aspx',
    },
    cirs78e: {
      id: 'cirs78e',
      label: 'Art. 78.º-E CIRS — Encargos com imóveis (rendas)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs78e.aspx',
    },
    ebf21: {
      id: 'ebf21',
      label: 'Art. 21.º EBF — PPR',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/Estatuto_Beneficios_Fiscais/Pages/EBF21.aspx',
    },
    // The statute establishing this year's (revised) bracket table — generic id
    // `diploma` so the UI can reference it for any year.
    diploma: {
      id: 'diploma',
      label: 'Lei n.º 33/2024, de 7 de agosto — revisão das taxas gerais do IRS (DR)',
      url: 'https://diariodarepublica.pt/dr/detalhe/lei/33-2024-875716577',
    },
    lei32: {
      id: 'lei32',
      label: 'Lei n.º 32/2024, de 7 de agosto — atualização das deduções específicas (DR)',
      url: 'https://diariodarepublica.pt/dr/detalhe/lei/32-2024-875716576',
    },
    lei82: {
      id: 'lei82',
      label: 'Lei n.º 82/2023, de 29/12 — OE 2024 (tabela inicial, depois revista)',
      url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2023-836109751',
    },
    modelo3: {
      id: 'modelo3',
      label: 'Modelo 3 do IRS — Portal das Finanças',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_ao_contribuinte/Cidadaos/Rendimentos/Declaracao/Modelo_3/Paginas/default.aspx',
    },
    irsAutomatico: {
      id: 'irsAutomatico',
      label: 'IRS Automático — Portal das Finanças',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_ao_contribuinte/Cidadaos/Rendimentos/Declaracao/IRS_automatico/Paginas/default.aspx',
    },
    folhetosAT: {
      id: 'folhetosAT',
      label: 'Folhetos informativos AT',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Pages/default.aspx',
    },
    decoNota: {
      id: 'decoNota',
      label: 'Descodificar a nota de liquidação — DECO PROTeste',
      url: 'https://www.deco.proteste.pt/dinheiro/impostos/noticias/descodifique-nota-liquidacao-irs',
    },
    decoPreencher: {
      id: 'decoPreencher',
      label: 'IRS — preencher passo a passo — DECO PROTeste',
      url: 'https://www.deco.proteste.pt/dinheiro/impostos/dicas/irs-ajudamos-preencher-passo-a-passo',
    },
    montepio: {
      id: 'montepio',
      label: 'Escalões de IRS — Montepio',
      url: 'https://www.montepio.org/ei/mais-recentes/escaloes-de-irs-sabe-qual-e-o-seu/',
    },
    santander: {
      id: 'santander',
      label: 'Como funcionam os escalões — Santander Salto',
      url: 'https://www.santander.pt/salto/escaloes-irs',
    },
    cgdSaldo: {
      id: 'cgdSaldo',
      label: 'Escalões vs tabelas de retenção — CGD Saldo Positivo',
      url: 'https://www.cgd.pt/Site/Saldo-Positivo/leis-e-impostos/Pages/diferenca-entre-escaloes-de-irs-e-tabelas-de-irs.aspx',
    },
    ias: {
      id: 'ias',
      label: 'IAS 2024 = 509,26 € — Segurança Social',
      url: 'https://www.seg-social.pt/ias-indexante-dos-apoios-sociais',
    },
  },
};
