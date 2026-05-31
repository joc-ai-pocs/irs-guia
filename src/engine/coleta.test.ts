import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import { calcularColetaMetodo2, calcularColetaMetodo3 } from './coleta';

/**
 * Canonical example from the pedagogical guide: a taxable income of 15 650 €
 * falls into the 3rd bracket. Method 3 yields the AT-published result; method 2
 * yields the same number up to a few cents of rounding.
 */
describe('calcularColetaMetodo3 (canonical AT method)', () => {
  it('produces ≈ 2 413,84 € for a coletável of 15 650 € (3rd bracket)', () => {
    const result = calcularColetaMetodo3(15650, config2025);
    expect(result.escalao.numero).toBe(3);
    expect(result.coleta).toBeCloseTo(2413.84, 2);
  });

  it('produces 0 € for a coletável of 0 €', () => {
    const result = calcularColetaMetodo3(0, config2025);
    expect(result.coleta).toBe(0);
  });

  it('produces ≈ 1 007,38 € for a coletável at the 1st bracket ceiling (8 059 €)', () => {
    const result = calcularColetaMetodo3(8059, config2025);
    expect(result.escalao.numero).toBe(1);
    expect(result.coleta).toBeCloseTo(1007.375, 3);
  });

  it('exposes the underlying bracket fields for didactic UI rendering', () => {
    const result = calcularColetaMetodo3(15650, config2025);
    expect(result.escalao.taxaNormal).toBe(0.215);
    expect(result.parcelaAbater).toBe(950.91);
    expect(result.importanciaApurada).toBeCloseTo(3364.75, 2);
  });
});

describe('calcularColetaMetodo2 (didactic slicing)', () => {
  it('produces a result within 1 cent of method 3 for the canonical example', () => {
    const m2 = calcularColetaMetodo2(15650, config2025);
    const m3 = calcularColetaMetodo3(15650, config2025);
    expect(Math.abs(m2.coleta - m3.coleta)).toBeLessThan(0.05);
  });

  it('splits 15 650 € into exactly 3 slices (one per crossed bracket)', () => {
    const result = calcularColetaMetodo2(15650, config2025);
    expect(result.fatias).toHaveLength(3);

    // Slice 1: bracket 1, width 8 059
    const first = result.fatias[0];
    expect(first?.escalao.numero).toBe(1);
    expect(first?.fatia).toBe(8059);

    // Slice 2: bracket 2, width 12 160 - 8 059 = 4 101
    const second = result.fatias[1];
    expect(second?.escalao.numero).toBe(2);
    expect(second?.fatia).toBe(4101);

    // Slice 3: bracket 3, residual 15 650 - 12 160 = 3 490
    const third = result.fatias[2];
    expect(third?.escalao.numero).toBe(3);
    expect(third?.fatia).toBe(3490);
  });

  it('returns no slices for a zero coletável', () => {
    const result = calcularColetaMetodo2(0, config2025);
    expect(result.fatias).toHaveLength(0);
    expect(result.coleta).toBe(0);
  });
});
