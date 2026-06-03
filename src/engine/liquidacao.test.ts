import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import { calcularLiquidacao } from './liquidacao';

// 2025 constants for reference in this file:
//   V  (valor de referência mín. existência) = 12 180  (14 × RMMG 870)
//   L  ≈ 13 863.06
//   LDG/T1 (termo abatido em alíneas a/b; NÃO em c) = 250 / 0.125 = 2 000
//   L1 (limite 1.º escalão) = 8 059
//   IAS = 522.50
//
// Many test cases are crafted to land in specific art. 70.º branches so the
// expected numbers are pedagogically clean and easy to recompute by hand.

describe('calcularLiquidacao — full settlement note pipeline', () => {
  it('canonical pedagogical example (RB in branch c → small reembolso)', () => {
    // RB = 14 135,53 € → cai na alínea c (RB > L ≈ 13 863,06).
    //   abatimento = max(0, (13 863,06 − 8 059) − 1.35 × (14 135,53 − 13 863,06) − 4 462,15)
    //              = max(0, 5 804,06 − 367,84 − 4 462,15)
    //              = 974,07
    //   coletável  = 14 135,53 − 4 462,15 − 974,07 = 8 699,31 (2.º escalão)
    //   coleta     = 8 699,31 × 16 % − 282,07 = 1 109,82
    //   após ded.  = 1 109,82 − 275,41 = 834,41
    //   benef. mun = 834,41 × 1 % = 8,34
    //   líquida    = 834,41 − 8,34 = 826,07
    //   apurado    = 826,07 − 968 = −141,93 (reembolso)
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 14135.53,
        deducoesColeta: 275.41,
        beneficioMunicipalPct: 0.01,
        retencaoFonte: 968,
      },
      config2025,
    );

    expect(result.abatimentoMinimoExistencia).toBeCloseTo(974.07, 1);
    expect(result.rendimentoColetavel).toBeCloseTo(8699.31, 1);
    expect(result.coleta.escalao.numero).toBe(2);
    expect(result.coletaTotal).toBeCloseTo(1109.82, 1);
    expect(result.beneficioMunicipal).toBeCloseTo(8.34, 1);
    expect(result.coletaLiquida).toBeCloseTo(826.07, 1);
    expect(result.impostoApurado).toBeCloseTo(-141.93, 1);
  });

  it('produces a true reembolso when retenção exceeds coleta líquida', () => {
    // Same gross income as the canonical example but no deductions / benefit;
    // higher retention (1 500 €).
    //   abatimento = 974,07, coletável = 8 699,31, coleta = 1 109,82,
    //   coleta líquida = 1 109,82 (sem dedução à coleta nem benefício).
    //   apurado = 1 109,82 − 1 500 = −390,18 (reembolso).
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 14135.53,
        retencaoFonte: 1500,
      },
      config2025,
    );

    expect(result.impostoApurado).toBeLessThan(0);
    expect(result.impostoApurado).toBeCloseTo(-390.18, 1);
  });

  it('respects the quociente familiar in joint taxation', () => {
    // RB = 30 000 cai na alínea c (RB > L) → abatimento = 0.
    const individual = calcularLiquidacao(
      { rendimentoBruto: 30000, quocienteFamiliar: 1 },
      config2025,
    );
    const conjunta = calcularLiquidacao(
      { rendimentoBruto: 30000, quocienteFamiliar: 2 },
      config2025,
    );

    expect(individual.abatimentoMinimoExistencia).toBe(0);
    expect(conjunta.coletaTotal).toBeLessThanOrEqual(individual.coletaTotal);
  });

  it('returns zero collection for income fully absorbed by the specific deduction', () => {
    // RB = 4 000 < V → alínea a). cap d) = 4 000 − 4 462,15 < 0 → abatimento = 0.
    // Coletável = max(0, 4 000 − 4 462,15) = 0.
    const result = calcularLiquidacao({ rendimentoBruto: 4000 }, config2025);
    expect(result.abatimentoMinimoExistencia).toBe(0);
    expect(result.rendimentoColetavel).toBe(0);
    expect(result.coletaTotal).toBe(0);
    expect(result.impostoApurado).toBeLessThanOrEqual(0);
  });

  it('splits the specific deduction per category, capping cat. H at its income (real A+H case)', () => {
    // Reproduces a real AT settlement note:
    //   cat. A salary 13 054,76 €, contributions 1 436,05 €
    //   cat. H pension 3 571,62 €
    // Deduction cat. A = max(4 462,15 ; 1 436,05) = 4 462,15 €
    // Deduction cat. H = min(3 571,62 ; 4 462,15) = 3 571,62 €  (capped at income)
    // Total deduction = 8 033,77 € → coletável = 16 626,38 − 8 033,77 = 8 592,61 €.
    // RB > L → alínea c → abatimento = 0 (negativo).
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        rendimentoTrabalho: 13054.76,
        contribuicoesTrabalho: 1436.05,
        rendimentoPensoes: 3571.62,
      },
      config2025,
    );

    expect(result.rendimentoBruto).toBeCloseTo(16626.38, 2);
    expect(result.deducaoEspecifica).toBeCloseTo(8033.77, 2);
    expect(result.abatimentoMinimoExistencia).toBe(0);
    expect(result.rendimentoColetavel).toBeCloseTo(8592.61, 2);

    expect(result.deducaoEspecificaDetalhe !== undefined).toBe(true);
    const detalhe = result.deducaoEspecificaDetalhe ?? [];
    expect(detalhe).toHaveLength(2);
    const catH = detalhe.find((d) => d.categoria === 'H');
    expect(catH?.limitadoPorRendimento).toBe(true);
    expect(catH?.valor).toBeCloseTo(3571.62, 2);
  });

  it('applies the municipal benefit on the collection AFTER deductions to the collection', () => {
    // Real AT note (cat. A + pension scenario). RB > L → abatimento = 0 (alínea c).
    //   coleta total 1 092,75, deduções 307,97, município 1 %.
    //   benefício = (1 092,75 − 307,97) × 1 % = 7,85 €
    //   coleta líquida = 1 092,75 − 307,97 − 7,85 = 776,93 €
    //   apurado = 776,93 − 103 = 673,93 €.
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        rendimentoTrabalho: 13054.76,
        contribuicoesTrabalho: 1436.05,
        rendimentoPensoes: 3571.62,
        deducoesColeta: 307.97,
        beneficioMunicipalPct: 0.01,
        retencaoFonte: 103,
      },
      config2025,
    );

    expect(result.abatimentoMinimoExistencia).toBe(0);
    expect(result.coletaTotal).toBeCloseTo(1092.75, 2);
    expect(result.beneficioMunicipal).toBeCloseTo(7.85, 2);
    expect(result.coletaLiquida).toBeCloseTo(776.93, 2);
    expect(result.impostoApurado).toBeCloseTo(673.93, 2);
  });

  it('adds the cat. F autonomous collection on top of the cat. A/H tax (default path)', () => {
    // Trabalho 14 135,53 € (cai em alínea c → abatimento 974,07) + rendas
    // brutas 12 000 € (despesas 2 000 € → líquido 10 000 €) taxadas a 25 %:
    //   coletaLiquida cat. A/H = 826,07 (canonical pedagogical)
    //   coletaAutonomaCatF = 10 000 × 25 % = 2 500
    //   impostoTotal = 826,07 + 2 500 = 3 326,07
    //   apurado = 3 326,07 − 968 = 2 358,07
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 14135.53,
        deducoesColeta: 275.41,
        beneficioMunicipalPct: 0.01,
        retencaoFonte: 968,
        rendasBrutas: 12000,
        despesasCatF: { imi: 400, condominio: 600, conservacao: 1000 },
      },
      config2025,
    );

    expect(result.catF !== undefined).toBe(true);
    expect(result.catF?.englobada).toBe(false);
    expect(result.catF?.taxa).toBe(0.25);
    expect(result.catF?.deducao.rendimentoLiquido).toBe(10000);
    expect(result.catF?.coletaAutonoma).toBeCloseTo(2500, 2);
    expect(result.coletaLiquida).toBeCloseTo(826.07, 1);
    expect(result.impostoTotal).toBeCloseTo(3326.07, 1);
    expect(result.impostoApurado).toBeCloseTo(2358.07, 1);
  });

  it('honors the reduced rate (15 %) for medium-term contracts', () => {
    // RB = 0 → alínea a, mas cap d) = 0 − 0 = 0 → abatimento = 0.
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        rendasBrutas: 8000,
        duracaoCatF: 'duracao5a10',
      },
      config2025,
    );
    expect(result.catF?.taxa).toBe(0.15);
    expect(result.catF?.coletaAutonoma).toBeCloseTo(1200, 2);
  });

  it('subtracts the cat. F-specific withholding from the imposto total', () => {
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        rendasBrutas: 10000,
        retencaoCatF: 2500,
      },
      config2025,
    );
    expect(result.catF?.coletaAutonoma).toBeCloseTo(2500, 2);
    expect(result.retencaoFonte).toBe(2500);
    expect(result.impostoApurado).toBeCloseTo(0, 2);
  });

  it('routes cat. F through the progressive brackets when englobamento is opted', () => {
    // Sem cat. A/H. Cat. F 8 000 englobada. RB para mín. existência = 0 → cap d) zera abatimento.
    // Coletável = max(0, 0 − 0 − 0) + 8 000 = 8 000.
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        rendasBrutas: 8000,
        englobarCatF: true,
      },
      config2025,
    );
    expect(result.catF?.englobada).toBe(true);
    expect(result.catF?.coletaAutonoma).toBe(0);
    expect(result.rendimentoColetavel).toBeCloseTo(8000, 2);
    expect(result.coleta.escalao.numero).toBe(1);
    expect(result.coletaTotal).toBeCloseTo(1000, 2);
    expect(result.impostoTotal).toBeCloseTo(1000, 2);
  });

  it('omits the catF block when no cat. F input is provided', () => {
    const result = calcularLiquidacao({ rendimentoBruto: 14135.53 }, config2025);
    expect(result.catF).toBe(undefined);
    expect(result.impostoTotal).toBeCloseTo(result.coletaLiquida, 2);
  });

  it('adds the cat. B imputed taxable matter (Anexo D) to the progressive base', () => {
    // RB = 30 000 + 5 000 = 35 000 € → alínea c → abatimento = 0.
    //   coletavel A/H = 30 000 − 4 462,15 = 25 537,85
    //   + imputação 5 000  = 30 537,85
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 30000,
        rendimentoTrabalho: 30000,
        imputacaoCatB: 5000,
      },
      config2025,
    );

    expect(result.catB !== undefined).toBe(true);
    expect(result.catB?.imputacao).toBe(5000);
    expect(result.abatimentoMinimoExistencia).toBe(0);
    expect(result.rendimentoColetavel).toBeCloseTo(30537.85, 2);
    expect(result.coleta.escalao.numero).toBe(6);
  });

  it('subtracts cat. B pagamentos por conta at line 23 and adds retenção at line 24', () => {
    // Imputação 20 000 € (RB > L → alínea c → abatimento = 0).
    // Coletável = 20 000 (sem outras deduções), 4.º escalão (24,4 %, parcela 1 450,67):
    //   coleta = 20 000 × 24,4 % − 1 450,67 = 3 429,33
    //   apurado = 3 429,33 − 200 − 500 = 2 729,33
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        imputacaoCatB: 20000,
        retencaoCatB: 500,
        pagamentosContaCatB: 200,
      },
      config2025,
    );

    expect(result.pagamentosConta).toBe(200);
    expect(result.retencaoFonte).toBe(500);
    expect(result.catB?.pagamentosConta).toBe(200);
    expect(result.coleta.escalao.numero).toBe(4);
    expect(result.coletaTotal).toBeCloseTo(3429.33, 1);
    expect(result.impostoApurado).toBeCloseTo(2729.33, 1);
  });

  it('coexists with cat. F: imputed cat. B feeds the progressive base while cat. F stays autonomous', () => {
    // Imputação 20 000 € (alínea c → 0) + rendas 8 000 € → autonomous 2 000 €.
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        imputacaoCatB: 20000,
        rendasBrutas: 8000,
      },
      config2025,
    );
    expect(result.catB !== undefined).toBe(true);
    expect(result.catF !== undefined).toBe(true);
    expect(result.abatimentoMinimoExistencia).toBe(0);
    expect(result.rendimentoColetavel).toBeCloseTo(20000, 2);
    expect(result.catF?.coletaAutonoma).toBeCloseTo(2000, 2);
  });

  it('includes cat. B imputed amount in the gross income (line 01) — regression', () => {
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        rendimentoTrabalho: 13054.76,
        contribuicoesTrabalho: 1436.05,
        rendimentoPensoes: 3571.62,
        imputacaoCatB: 5000,
      },
      config2025,
    );
    expect(result.rendimentoBruto).toBeCloseTo(13054.76 + 3571.62 + 5000, 2);
    // RB = 21 626,38 > L → c → abatimento = 0 → coletável = bruto − dedução + imputação.
    expect(result.abatimentoMinimoExistencia).toBe(0);
    expect(result.rendimentoColetavel).toBeCloseTo(13592.61, 2);
  });

  it('reproduces the real AT note for the alínea c) abatement (RB = 14 381,99 → 641,34 €)', () => {
    // Caso real do utilizador, batido ao cêntimo com a nota da AT. RB > L → alínea c):
    //   bruto = (13 863,06 − 8 059) − 1,35×(14 381,99 − 13 863,06) − 4 462,15
    //         = 5 804,06 − 700,56 − 4 462,15 = 641,34
    const result = calcularLiquidacao({ rendimentoBruto: 14381.99 }, config2025);
    expect(result.abatimentoMinimoExistenciaDetalhe.alinea).toBe('c');
    expect(result.abatimentoMinimoExistencia).toBeCloseTo(641.34, 1);
  });

  it('reproduces the AT note for the cat. A + H demo (alínea c, abatement = 0)', () => {
    // Regression: confirms the AT-matching scenario stays intact.
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0,
        rendimentoTrabalho: 13054.76,
        contribuicoesTrabalho: 1436.05,
        rendimentoPensoes: 3571.62,
        deducoesColeta: 307.97,
        beneficioMunicipalPct: 0.01,
        retencaoFonte: 103,
      },
      config2025,
    );
    expect(result.abatimentoMinimoExistencia).toBe(0); // alínea c, negativo → 0
    expect(result.rendimentoColetavel).toBeCloseTo(8592.61, 2);
    expect(result.impostoApurado).toBeCloseTo(673.93, 2);
  });

  it('omits the catB block and zeros pagamentosConta when no cat. B input is provided', () => {
    const result = calcularLiquidacao({ rendimentoBruto: 14135.53 }, config2025);
    expect(result.catB).toBe(undefined);
    expect(result.pagamentosConta).toBe(0);
  });

  it('omits the per-category breakdown in the legacy single-income path', () => {
    const result = calcularLiquidacao({ rendimentoBruto: 14135.53 }, config2025);
    expect(result.deducaoEspecificaDetalhe).toBe(undefined);
    expect(result.deducaoEspecifica).toBe(4462.15);
  });

  it('reports an effective average rate (taxa média efetiva)', () => {
    // RB = 15 650, dedução = 0. RB > L → c, abatimento ≈ 3 036,69.
    //   coletável = 15 650 − 0 − 3 036,69 = 12 613,31 (3.º escalão, 21,5 %)
    //   coleta = 12 613,31 × 21,5 % − 950,91 = 1 760,95
    //   taxaMediaEfetiva = 1 760,95 / 15 650 ≈ 0,1125
    const result = calcularLiquidacao(
      { rendimentoBruto: 15650, deducaoEspecifica: 0 },
      config2025,
    );
    expect(result.taxaMediaEfetiva).toBeGreaterThan(0.1);
    expect(result.taxaMediaEfetiva).toBeLessThan(0.13);
  });
});
