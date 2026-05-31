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

    // line 22: coleta líquida = 1 265,67 − 275,41 − (1 265,67 × 1%) = 977,60
    expect(result.coletaLiquida).toBeCloseTo(977.6, 2);

    // line 25: imposto apurado = 977,60 − 968 = +9,60 €  (a pagar)
    expect(result.impostoApurado).toBeCloseTo(9.6, 2);
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
