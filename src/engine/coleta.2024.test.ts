import { describe, expect, it } from 'vitest';
import { config2024 } from '@/tax-data/2024';
import { calcularColetaMetodo2, calcularColetaMetodo3 } from './coleta';

/**
 * Regression tests pinning the 2024 bracket table (Lei n.º 33/2024, de 7 de
 * agosto — taxas revistas para os rendimentos de 2024). Expected colectas are
 * computed independently from the officially published rates and parcelas a
 * abater, so any accidental edit to `2024.ts` is caught here.
 */
describe('calcularColetaMetodo3 — tabela de 2024', () => {
  it('coletável no teto do 1.º escalão (7 703 €) → 1 001,39 € (7 703 × 13%)', () => {
    const result = calcularColetaMetodo3(7703, config2024);
    expect(result.escalao.numero).toBe(1);
    expect(result.coleta).toBeCloseTo(1001.39, 2);
  });

  it('coletável de 20 000 € (4.º escalão) → 3 596,92 € (20 000 × 25% − 1 403,08)', () => {
    const result = calcularColetaMetodo3(20000, config2024);
    expect(result.escalao.numero).toBe(4);
    expect(result.escalao.taxaNormal).toBe(0.25);
    expect(result.parcelaAbater).toBe(1403.08);
    expect(result.coleta).toBeCloseTo(3596.92, 2);
  });

  it('coletável de 0 € → 0 €', () => {
    expect(calcularColetaMetodo3(0, config2024).coleta).toBe(0);
  });
});

describe('calcularColetaMetodo2 — tabela de 2024', () => {
  it('método 2 (fatiado) aproxima o método 3 dentro da tolerância de arredondamento', () => {
    const m2 = calcularColetaMetodo2(20000, config2024);
    const m3 = calcularColetaMetodo3(20000, config2024);
    expect(Math.abs(m2.coleta - m3.coleta)).toBeLessThan(0.1);
  });

  it('fatia 20 000 € em exatamente 4 fatias (uma por escalão atravessado)', () => {
    const result = calcularColetaMetodo2(20000, config2024);
    expect(result.fatias).toHaveLength(4);
    expect(result.fatias[0]?.fatia).toBe(7703);
    expect(result.fatias[1]?.fatia).toBe(11623 - 7703);
    expect(result.fatias[2]?.fatia).toBe(16472 - 11623);
    expect(result.fatias[3]?.fatia).toBe(20000 - 16472);
  });
});
