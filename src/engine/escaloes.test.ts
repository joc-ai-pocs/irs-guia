import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import { findEscalao, calcularDeducaoEspecifica } from './escaloes';

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
