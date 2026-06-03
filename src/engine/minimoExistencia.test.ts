import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import { calcularMinimoExistencia } from './minimoExistencia';

// In 2025:
//   V (valor de referência) = 12 180  (14 × RMMG 870; > 1.5 × 14 × IAS = 10 972,50)
//   LDG (limite despesas gerais) = 250
//   T1 (taxa 1.º escalão) = 0.125  →  LDG/T1 = 2 000
//   L1 (limite 1.º escalão) = 8 059
//   L = V − LDG/(T1 × 3.60) + L1/3.60
//     = 12 180 − 250/0.45 + 8 059/3.60
//     = 12 180 − 555.56 + 2 238.61
//     ≈ 13 863.06

describe('calcularMinimoExistencia — art. 70.º CIRS branch a)', () => {
  it('applies when RB ≤ V: abatimento bruto = V − (DE + LDG/T1), then capped by RB − DE', () => {
    // RB = 10 000 ≤ V = 12 180. Bruto = 12 180 − (4 462,15 + 2 000) = 5 717,85.
    // Cap d) = 10 000 − 4 462,15 = 5 537,85. Cap kicks in.
    const d = calcularMinimoExistencia(10000, 4462.15, config2025);
    expect(d.alinea).toBe('a');
    expect(d.coeficiente).toBe(null);
    expect(d.termoDeducoes).toBeCloseTo(6462.15, 2); // DE + LDG/T1
    expect(d.valorBruto).toBeCloseTo(5717.85, 2);
    expect(d.capAlineaD).toBeCloseTo(5537.85, 2);
    expect(d.valor).toBeCloseTo(5537.85, 2);
    expect(d.capAplicado).toBe(true);
  });

  it('handles the boundary RB = V (still alínea a)', () => {
    const d = calcularMinimoExistencia(12180, 4462.15, config2025);
    expect(d.alinea).toBe('a');
  });
});

describe('calcularMinimoExistencia — art. 70.º CIRS branch b)', () => {
  it('applies when V < RB ≤ L: subtracts 2.60 × excess and the termo (DE + LDG/T1)', () => {
    // RB = 13 000 ∈ (V, L]. Bruto = V − 2.60×(RB−V) − (DE + LDG/T1)
    //                            = 12 180 − 2.60×820 − (4 462.15 + 2 000)
    //                            = 12 180 − 2 132 − 6 462.15 = 3 585.85
    const d = calcularMinimoExistencia(13000, 4462.15, config2025);
    expect(d.alinea).toBe('b');
    expect(d.coeficiente).toBe(2.6);
    expect(d.valorBruto).toBeCloseTo(3585.85, 2);
    expect(d.valor).toBeCloseTo(3585.85, 2); // cap d) doesn't bite (8 537,85 > 3 585,85)
  });

  it('returns 0 when the formula yields a negative value (branch b but heavily deducted)', () => {
    // RB still inside the b) interval (≤ L ≈ 13 863) AND a high DE → formula negative.
    const d = calcularMinimoExistencia(13800, 10000, config2025);
    expect(d.alinea).toBe('b');
    expect(d.valorBruto).toBeLessThan(0);
    expect(d.valor).toBe(0);
  });
});

describe('calcularMinimoExistencia — art. 70.º CIRS branch c)', () => {
  it('reproduces the real AT settlement note (RB = 14 381,99, DE = 4 462,15 → 641,34 €)', () => {
    // RB = 14 381,99 > L ≈ 13 863,06 → alínea c). Here the LDG/T1 term is NOT abated.
    //   Bruto = (L − L1) − 1.35×(RB − L) − DE
    //         = (13 863,06 − 8 059) − 1.35×(14 381,99 − 13 863,06) − 4 462,15
    //         = 5 804,06 − 700,56 − 4 462,15 = 641,34
    const d = calcularMinimoExistencia(14381.99, 4462.15, config2025);
    expect(d.alinea).toBe('c');
    expect(d.coeficiente).toBe(1.35);
    expect(d.termoDeducoes).toBeCloseTo(4462.15, 2); // só DE, sem LDG/T1
    expect(d.valorBruto).toBeCloseTo(641.34, 2);
    expect(d.valor).toBeCloseTo(641.34, 2);
    expect(d.capAplicado).toBe(false);
  });

  it('yields 0 for higher income in branch c)', () => {
    // RB = 16 626,38 > L. Bruto negativo → max(0, …) = 0.
    const d = calcularMinimoExistencia(16626.38, 8033.77, config2025);
    expect(d.alinea).toBe('c');
    expect(d.valor).toBe(0);
  });
});

describe('calcularMinimoExistencia — alínea d) cap', () => {
  it('never exceeds (RB − DE)', () => {
    // Low RB with low DE in branch a) — formula bruto >> cap.
    const d = calcularMinimoExistencia(5000, 0, config2025);
    expect(d.alinea).toBe('a');
    expect(d.valor).toBeLessThanOrEqual(d.capAlineaD);
    expect(d.capAplicado).toBe(true);
  });

  it('clamps negative gross income to zero (defensive)', () => {
    const d = calcularMinimoExistencia(-100, 0, config2025);
    expect(d.rendimentosBrutos).toBe(0);
    expect(d.valor).toBe(0);
  });
});

describe('calcularMinimoExistencia — derived constants', () => {
  it('uses the materialized V = 12 180 € for 2025', () => {
    const d = calcularMinimoExistencia(1000, 0, config2025);
    expect(d.valorReferencia).toBe(12180);
  });

  it('computes L from V, LDG, T1, L1', () => {
    const d = calcularMinimoExistencia(1000, 0, config2025);
    // L = 12 180 − 250/(0.125 × 3.60) + 8 059/3.60 ≈ 13 863.06
    expect(d.limiteSuperior).toBeCloseTo(13863.06, 1);
  });

  it('exposes LDG/T1 = 2 000 and L1 = 8 059', () => {
    const d = calcularMinimoExistencia(13000, 0, config2025);
    expect(d.ldgSobreTaxa).toBeCloseTo(2000, 2);
    expect(d.limiteEscalao1).toBe(8059);
  });

  it('abates DE + LDG/T1 in branch b) but only DE in branch c)', () => {
    const b = calcularMinimoExistencia(13000, 4462.15, config2025);
    expect(b.termoDeducoes).toBeCloseTo(6462.15, 2);
    const c = calcularMinimoExistencia(14381.99, 4462.15, config2025);
    expect(c.termoDeducoes).toBeCloseTo(4462.15, 2);
  });
});
