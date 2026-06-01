import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import {
  findEscalao,
  calcularDeducaoEspecifica,
  calcularDeducaoEspecificaCategoria,
} from './escaloes';

describe('findEscalao', () => {
  const escaloes = config2025.escaloes;

  it('resolves the lower boundary (1 €) to the 1st bracket', () => {
    expect(findEscalao(1, escaloes).numero).toBe(1);
  });

  it('resolves the upper boundary of the 1st bracket (8 059 €) inclusively to the 1st bracket', () => {
    expect(findEscalao(8059, escaloes).numero).toBe(1);
  });

  it('resolves 8 059.01 € to the 2nd bracket', () => {
    expect(findEscalao(8059.01, escaloes).numero).toBe(2);
  });

  it('resolves a typical mid-range income (15 650 €) to the 3rd bracket', () => {
    expect(findEscalao(15650, escaloes).numero).toBe(3);
  });

  it('resolves an income above all named brackets to the 9th (last) bracket', () => {
    expect(findEscalao(1_000_000, escaloes).numero).toBe(9);
  });

  it('throws on an empty bracket table (configuration error)', () => {
    expect(() => findEscalao(1000, [])).toThrow(/empty/i);
  });
});

describe('calcularDeducaoEspecifica', () => {
  it('returns the IAS-based minimum (4 462,15 €) when no contributions are provided', () => {
    expect(calcularDeducaoEspecifica(config2025)).toBe(4462.15);
  });

  it('returns the minimum when contributions are lower than it', () => {
    expect(calcularDeducaoEspecifica(config2025, 3000)).toBe(4462.15);
  });

  it('returns the contributions value when it exceeds the minimum', () => {
    expect(calcularDeducaoEspecifica(config2025, 5000)).toBe(5000);
  });

  it('handles the equality case by returning either (max collapses)', () => {
    expect(calcularDeducaoEspecifica(config2025, 4462.15)).toBe(4462.15);
  });
});

describe('calcularDeducaoEspecificaCategoria', () => {
  it('applies the IAS-based minimum for cat. A when income is high and contributions are lower', () => {
    // Real case: salary 13 054,76 €, contributions 1 436,05 € < 4 462,15 €.
    const d = calcularDeducaoEspecificaCategoria(13054.76, config2025, 1436.05, 'A');
    expect(d.valorBruto).toBe(4462.15);
    expect(d.valor).toBe(4462.15);
    expect(d.limitadoPorRendimento).toBe(false);
    expect(d.categoria).toBe('A');
  });

  it('uses the contributions when they exceed the IAS-based minimum (cat. A)', () => {
    const d = calcularDeducaoEspecificaCategoria(60000, config2025, 6600, 'A');
    expect(d.valorBruto).toBe(6600);
    expect(d.valor).toBe(6600);
    expect(d.limitadoPorRendimento).toBe(false);
  });

  it('caps the deduction at the category income (cat. H pension below the minimum)', () => {
    // Real case: pension 3 571,62 € < 4 462,15 € → deduction limited to the pension.
    const d = calcularDeducaoEspecificaCategoria(3571.62, config2025, 0, 'H');
    expect(d.valorBruto).toBe(4462.15);
    expect(d.valor).toBeCloseTo(3571.62, 2);
    expect(d.limitadoPorRendimento).toBe(true);
    expect(d.categoria).toBe('H');
  });

  it('defaults contributions to 0 and category to A', () => {
    const d = calcularDeducaoEspecificaCategoria(20000, config2025);
    expect(d.categoria).toBe('A');
    expect(d.contribuicoes).toBe(0);
    expect(d.valor).toBe(4462.15);
  });
});
