import type { TaxYearConfig } from './types';

/**
 * Tax configuration for income earned in 2025 (filed in 2026).
 *
 * Sources are inlined in {@link TaxYearConfig.fontes}. The bracket table
 * was extracted verbatim from the Portal das Finanças canonical page
 * for art. 68.º CIRS in the Lei n.º 55-A/2025 redaction (22/07/2025).
 */
export const config2025: TaxYearConfig = {
  ano: 2025,
  anoDeclaracao: 2026,
  diplomaLegal: 'Lei n.º 55-A/2025, de 22 de julho',
  ias: 522.5,
  deducaoEspecificaCoef: 8.54,
  // 522.50 × 8.54 = 4462.15 (preserved as published)
  deducaoEspecificaMinima: 4462.15,

  // Art. 70.º n.º 1 CIRS (Lei 73-A/2024): max(12 880, 1.5 × 14 × IAS).
  // 1.5 × 14 × 522.50 = 10 972.50 < 12 880 → V = 12 880.
  valorReferenciaMinimoExistencia: 12880,
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
    { numero: 1, limiteSuperior: 8059,                       taxaNormal: 0.125, taxaMedia: 0.125,    parcelaAbater: 0       },
    { numero: 2, limiteSuperior: 12160,                      taxaNormal: 0.160, taxaMedia: 0.13680,  parcelaAbater: 282.07  },
    { numero: 3, limiteSuperior: 17233,                      taxaNormal: 0.215, taxaMedia: 0.15982,  parcelaAbater: 950.91  },
    { numero: 4, limiteSuperior: 22306,                      taxaNormal: 0.244, taxaMedia: 0.17897,  parcelaAbater: 1450.67 },
    { numero: 5, limiteSuperior: 28400,                      taxaNormal: 0.314, taxaMedia: 0.20794,  parcelaAbater: 3011.98 },
    { numero: 6, limiteSuperior: 41629,                      taxaNormal: 0.349, taxaMedia: 0.25277,  parcelaAbater: 4006.10 },
    { numero: 7, limiteSuperior: 44987,                      taxaNormal: 0.431, taxaMedia: 0.26607,  parcelaAbater: 7419.54 },
    { numero: 8, limiteSuperior: 83696,                      taxaNormal: 0.446, taxaMedia: 0.34929,  parcelaAbater: 8094.51 },
    { numero: 9, limiteSuperior: Number.POSITIVE_INFINITY,   taxaNormal: 0.480, taxaMedia: null,     parcelaAbater: 10901.33 },
  ],

  deducoesColeta: [
    { id: 'gerais',    label: 'Despesas gerais familiares',      percentagem: 0.35, tetoEuros: 250,  fonteId: 'cirs78b', nota: 'Por sujeito passivo. Até 500 € em conjuntos.' },
    { id: 'saude',     label: 'Saúde',                            percentagem: 0.15, tetoEuros: 1000, fonteId: 'cirs78c' },
    { id: 'educacao',  label: 'Educação e formação',              percentagem: 0.30, tetoEuros: 800,  fonteId: 'cirs78d', nota: 'Até 1 100 € com despesas de estudante deslocado.' },
    { id: 'rendas',    label: 'Rendas (inquilino)',               percentagem: 0.15, tetoEuros: 700,  fonteId: 'cirs78e' },
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
      label: 'Art. 68.º CIRS — redação para rendimentos de 2025',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/ra/Pages/irs68ra_202512.aspx',
    },
    // Next year's redaction of art. 68.º — shown alongside the current table.
    art68Seguinte: {
      id: 'art68Seguinte',
      label: 'Art. 68.º CIRS — redação para rendimentos de 2026 (Lei 73-A/2025)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx',
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
    // The statute establishing this year's bracket table (generic id `diploma`
    // so the UI can reference it for any year).
    diploma: {
      id: 'diploma',
      label: 'Lei n.º 55-A/2025, de 22/07 (PDF oficial)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_55_A_2025.pdf',
    },
    lei45A: {
      id: 'lei45A',
      label: 'Lei n.º 45-A/2024 — OE 2025 (PDF oficial)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_45_A_2024.pdf',
    },
    lei73A: {
      id: 'lei73A',
      label: 'Lei n.º 73-A/2025 — OE 2026 (PDF oficial)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_73_A_2025.pdf',
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
    prazos2026: {
      id: 'prazos2026',
      label: 'Folheto AT — Principais prazos IRS 2026 (PDF)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/IRS_2025_Principais_prazos_2026.pdf',
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
    doutorFinancas: {
      id: 'doutorFinancas',
      label: 'Calendário IRS 2026 completo — Doutor Finanças',
      url: 'https://www.doutorfinancas.pt/impostos/irs/calendario-irs-2026-os-prazos-para-evitar-coimas-e-perder-deducoes/',
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
      label: 'IAS 2025 = 522,50 € — Segurança Social',
      url: 'https://www.seg-social.pt/ias-indexante-dos-apoios-sociais',
    },
  },
};
