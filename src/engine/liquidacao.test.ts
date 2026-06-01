import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import { calcularLiquidacao } from './liquidacao';

describe('calcularLiquidacao — full settlement note pipeline', () => {
  it('reproduces the canonical pedagogical example (small balance to pay)', () => {
    // These are the inputs used in the demo at main.ts and in the HTML guide's
    // calculator. They yield a SMALL amount to pay (~ 9,60 €) — not a reembolso —
    // and exist to exercise the full pipeline against a known reference.
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 14135.53,
        deducoesColeta: 275.41,
        beneficioMunicipalPct: 0.01,
        retencaoFonte: 968,
      },
      config2025,
    );

    // line 06: coletável = 14 135,53 − 4 462,15 = 9 673,38
    expect(result.rendimentoColetavel).toBeCloseTo(9673.38, 2);

    // Falls into the 2nd bracket (8 059 < 9 673,38 ≤ 12 160).
    expect(result.coleta.escalao.numero).toBe(2);

    // line 18: coleta = 9 673,38 × 0,16 − 282,07 = 1 265,67
    expect(result.coletaTotal).toBeCloseTo(1265.67, 2);

    // line 20: benefício municipal applies AFTER deductions to the collection:
    //   (1 265,67 − 275,41) × 1% = 990,26 × 1% = 9,90 €
    expect(result.beneficioMunicipal).toBeCloseTo(9.9, 2);

    // line 22: coleta líquida = 1 265,67 − 275,41 − 9,90 = 980,36
    expect(result.coletaLiquida).toBeCloseTo(980.36, 2);

    // line 25: imposto apurado = 980,36 − 968 = +12,36 €  (a pagar)
    expect(result.impostoApurado).toBeCloseTo(12.36, 2);
  });

  it('produces a true reembolso when retenção exceeds coleta líquida', () => {
    // Same gross income as the canonical example, but with a higher retention
    // (1 500 €) — the contributor over-withheld and should receive money back.
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 14135.53,
        retencaoFonte: 1500,
      },
      config2025,
    );

    // Coleta líquida = coleta total = 1 265,67 (no deductions to coleta given).
    // line 25 = 1 265,67 − 1 500 = −234,33 € → reembolso.
    expect(result.impostoApurado).toBeLessThan(0);
    expect(result.impostoApurado).toBeCloseTo(-234.33, 2);
  });

  it('respects the quociente familiar in joint taxation', () => {
    // A couple jointly taxed on 30 000 € of gross income.
    // Without quociente: would fall into bracket 5+ after deductions.
    // With quociente=2: base per "person" is halved, landing in a lower bracket.
    const individual = calcularLiquidacao(
      { rendimentoBruto: 30000, quocienteFamiliar: 1 },
      config2025,
    );
    const conjunta = calcularLiquidacao(
      { rendimentoBruto: 30000, quocienteFamiliar: 2 },
      config2025,
    );

    // Joint regime should result in a lower or equal total collection.
    expect(conjunta.coletaTotal).toBeLessThanOrEqual(individual.coletaTotal);
  });

  it('returns zero collection for income fully absorbed by the specific deduction', () => {
    const result = calcularLiquidacao({ rendimentoBruto: 4000 }, config2025);
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
    const result = calcularLiquidacao(
      {
        rendimentoBruto: 0, // ignored: derived from the per-category fields
        rendimentoTrabalho: 13054.76,
        contribuicoesTrabalho: 1436.05,
        rendimentoPensoes: 3571.62,
      },
      config2025,
    );

    expect(result.rendimentoBruto).toBeCloseTo(16626.38, 2);
    expect(result.deducaoEspecifica).toBeCloseTo(8033.77, 2);
    expect(result.rendimentoColetavel).toBeCloseTo(8592.61, 2);

    // Breakdown is exposed for the UI hints.
    expect(result.deducaoEspecificaDetalhe !== undefined).toBe(true);
    const detalhe = result.deducaoEspecificaDetalhe ?? [];
    expect(detalhe).toHaveLength(2);
    const catH = detalhe.find((d) => d.categoria === 'H');
    expect(catH?.limitadoPorRendimento).toBe(true);
    expect(catH?.valor).toBeCloseTo(3571.62, 2);
  });

  it('applies the municipal benefit on the collection AFTER deductions to the collection', () => {
    // Real AT note: coleta total 1 092,75 €, deduções à coleta 307,97 €,
    // município a 1%. The benefit base is 1 092,75 − 307,97 = 784,78 €, so the
    // benefit is 7,85 € (NOT 1 092,75 × 1% = 10,93 €), giving coleta líquida
    // 776,93 € and, with 103 € withheld, 673,93 € to pay.
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

    expect(result.coletaTotal).toBeCloseTo(1092.75, 2);
    expect(result.beneficioMunicipal).toBeCloseTo(7.85, 2);
    expect(result.coletaLiquida).toBeCloseTo(776.93, 2);
    expect(result.impostoApurado).toBeCloseTo(673.93, 2);
  });

  it('omits the per-category breakdown in the legacy single-income path', () => {
    const result = calcularLiquidacao({ rendimentoBruto: 14135.53 }, config2025);
    expect(result.deducaoEspecificaDetalhe).toBe(undefined);
    // Legacy single deduction unchanged.
    expect(result.deducaoEspecifica).toBe(4462.15);
  });

  it('reports an effective average rate (taxa média efetiva) consistent with the pedagogical example', () => {
    // From the guide: coletável 15 650 € → taxa média efetiva ≈ 15,4 %.
    // We approximate that scenario at the gross level by using a deduction of 0
    // and a gross equal to the coletável.
    const result = calcularLiquidacao(
      { rendimentoBruto: 15650, deducaoEspecifica: 0 },
      config2025,
    );
    expect(result.taxaMediaEfetiva).toBeGreaterThan(0.14);
    expect(result.taxaMediaEfetiva).toBeLessThan(0.17);
  });
});
