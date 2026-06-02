import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import { calcularMinimoExistencia } from './minimoExistencia';

// In 2025:
//   V (valor de referência) = 12 880
//   LDG (limite despesas gerais) = 250
//   T1 (taxa 1.º escalão) = 0.125
//   L1 (limite 1.º escalão) = 8 059
//   L = V − LDG/(T1 × 3.60) + L1/3.60
//     = 12 880 − 250/0.45 + 8 059/3.60
//     = 12 880 − 555.56 + 2 238.61
//     ≈ 14 563.05

describe('calcularMinimoExistencia — art. 70.º CIRS branch a)', () => {
  it('applies when RB ≤ V: abatimento bruto = V − DE, then capped by RB − DE', () => {
    // RB = 10 000 ≤ V = 12 880. Bruto = 12 880 − 4 462,15 = 8 417,85.
    // Cap d) = 10 000 − 4 462,15 = 5 537,85. Cap kicks in.
    const d = calcularMinimoExistencia(10000, 4462.15, config2025);
    expect(d.alinea).toBe('a');
    expect(d.valorBruto).toBeCloseTo(8417.85, 2);
    expect(d.capAlineaD).toBeCloseTo(5537.85, 2);
    expect(d.valor).toBeCloseTo(5537.85, 2);
    expect(d.capAplicado).toBe(true);
  });

  it('handles the boundary RB = V (still alínea a)', () => {
    const d = calcularMinimoExistencia(12880, 4462.15, config2025);
    expect(d.alinea).toBe('a');
  });
});

describe('calcularMinimoExistencia — art. 70.º CIRS branch b)', () => {
  it('applies when V < RB ≤ L: subtracts 2.60 × excess and the termo de deduções', () => {
    // RB = 14 381.99 ∈ (V, L]. Bruto = V − 2.60×(RB−V) − (DE + LDG/T1)
    //                            = 12 880 − 3 905.17 − (4 462.15 + 2 000)
    //                            = 2 512.68
    const d = calcularMinimoExistencia(14381.99, 4462.15, config2025);
    expect(d.alinea).toBe('b');
    expect(d.valorBruto).toBeCloseTo(2512.68, 2);
    expect(d.valor).toBeCloseTo(2512.68, 2); // cap d) doesn't bite (9 919.84 > 2 512.68)
  });

  it('returns 0 when the formula yields a negative value (branch b but heavily deducted)', () => {
    // Higher RB inside the b) interval AND a high DE that makes the formula negative.
    const d = calcularMinimoExistencia(14500, 10000, config2025);
    expect(d.alinea).toBe('b');
    expect(d.valorBruto).toBeLessThan(0);
    expect(d.valor).toBe(0);
  });
});

describe('calcularMinimoExistencia — art. 70.º CIRS branch c)', () => {
  it('applies when RB > L: typically yields 0 for mid-income taxpayers', () => {
    // Caso real da mãe: RB = 16 626.38 > L ≈ 14 563.05.
    //   Bruto = L − L1 − 1.35×(RB−L) − (DE + LDG/T1)
    //         = 14 563.05 − 8 059 − 1.35×2 063.33 − (8 033.77 + 2 000)
    //         = -6 315.22  → max(0, …) = 0
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
  });

  it('clamps negative gross income to zero (defensive)', () => {
    const d = calcularMinimoExistencia(-100, 0, config2025);
    expect(d.rendimentosBrutos).toBe(0);
    expect(d.valor).toBe(0);
  });
});

describe('calcularMinimoExistencia — derived constants', () => {
  it('uses the materialized V = 12 880 € for 2025', () => {
    const d = calcularMinimoExistencia(1000, 0, config2025);
    expect(d.valorReferencia).toBe(12880);
  });

  it('computes L from V, LDG, T1, L1', () => {
    const d = calcularMinimoExistencia(1000, 0, config2025);
    // L = 12 880 − 250/(0.125 × 3.60) + 8 059/3.60 ≈ 14 563.06
    expect(d.limiteSuperior).toBeCloseTo(14563.06, 1);
  });

  it('computes the termo de deduções as DE + LDG/T1', () => {
    const d = calcularMinimoExistencia(15000, 4462.15, config2025);
    // 4 462.15 + 250/0.125 = 6 462.15
    expect(d.termoDeducoes).toBeCloseTo(6462.15, 2);
  });
});
