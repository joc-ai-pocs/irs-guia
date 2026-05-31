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
    art68: {
      id: 'art68',
      label: 'Art. 68.º CIRS — redação para rendimentos de 2025',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/ra/Pages/irs68ra_202512.aspx',
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
    lei55A: {
      id: 'lei55A',
      label: 'Lei n.º 55-A/2025, de 22/07 (PDF oficial)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_55_A_2025.pdf',
    },
    ias: {
      id: 'ias',
      label: 'IAS 2025 = 522,50 € — Segurança Social',
      url: 'https://www.seg-social.pt/ias-indexante-dos-apoios-sociais',
    },
  },
};
