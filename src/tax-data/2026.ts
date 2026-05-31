import type { TaxYearConfig } from './types';

/**
 * Tax configuration for income earned in 2026 (filed in 2027).
 *
 * @todo VERIFY before relying on these numbers. The Lei n.º 73-A/2025 (OE 2026)
 * brackets need to be cross-checked against the canonical Portal das Finanças
 * page for art. 68.º (current redaction):
 *   https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx
 *
 * The bracket structure below is a placeholder mirroring 2025 — DO NOT use
 * for actual 2026 calculations until each row is validated.
 */
export const config2026: TaxYearConfig = {
  ano: 2026,
  anoDeclaracao: 2027,
  diplomaLegal: 'Lei n.º 73-A/2025, de 30/12 (OE 2026) — VALORES POR CONFIRMAR',
  ias: 525.0, // TODO: confirmar valor do IAS para 2026
  deducaoEspecificaCoef: 8.54,
  deducaoEspecificaMinima: 4483.5, // 525 × 8.54 = 4483.5 — recalcular após confirmar IAS

  escaloes: [
    // TODO: substituir pela tabela da Lei 73-A/2025
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
    // TODO: confirmar se houve atualizações dos tetos de deduções à coleta para 2026
    { id: 'gerais',    label: 'Despesas gerais familiares',      percentagem: 0.35, tetoEuros: 250,  fonteId: 'cirs78b' },
    { id: 'saude',     label: 'Saúde',                            percentagem: 0.15, tetoEuros: 1000, fonteId: 'cirs78c' },
    { id: 'educacao',  label: 'Educação e formação',              percentagem: 0.30, tetoEuros: 800,  fonteId: 'cirs78d' },
    { id: 'rendas',    label: 'Rendas (inquilino)',               percentagem: 0.15, tetoEuros: 700,  fonteId: 'cirs78e' },
  ],

  fontes: {
    art68: {
      id: 'art68',
      label: 'Art. 68.º CIRS — redação para rendimentos de 2026',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx',
    },
    lei73A: {
      id: 'lei73A',
      label: 'Lei n.º 73-A/2025, de 30/12 (PDF oficial)',
      url: 'https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/legislacao/diplomas_legislativos/Documents/Lei_73_A_2025.pdf',
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
  },
};
