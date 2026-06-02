import { describe, expect, it } from 'vitest';
import { config2025 } from '@/tax-data/2025';
import {
  calcularColetaAutonomaF,
  calcularDeducaoCategoriaF,
  obterTaxaCatF,
} from './categoriaF';

describe('calcularDeducaoCategoriaF', () => {
  it('subtracts itemized expenses from gross rents (typical case)', () => {
    // Rendas brutas 12 000 €, despesas: IMI 400, condomínio 600, conservação 1 000.
    const d = calcularDeducaoCategoriaF(12000, {
      imi: 400,
      condominio: 600,
      conservacao: 1000,
    });
    expect(d.rendasBrutas).toBe(12000);
    expect(d.despesasTotal).toBe(2000);
    expect(d.rendimentoLiquido).toBe(10000);
    expect(d.perdaPotencial).toBe(false);
  });

  it('clamps net income at zero and flags perdaPotencial when expenses exceed rents', () => {
    // Despesas (3 500) excedem rendas (3 000) — situação de perda potencial.
    const d = calcularDeducaoCategoriaF(3000, {
      imi: 500,
      condominio: 0,
      conservacao: 3000,
    });
    expect(d.rendimentoLiquido).toBe(0);
    expect(d.perdaPotencial).toBe(true);
  });

  it('treats missing expenses as zero', () => {
    const d = calcularDeducaoCategoriaF(8000);
    expect(d.despesasTotal).toBe(0);
    expect(d.rendimentoLiquido).toBe(8000);
  });

  it('clamps negative inputs to zero (defensive)', () => {
    const d = calcularDeducaoCategoriaF(-100, { imi: -50 });
    expect(d.rendasBrutas).toBe(0);
    expect(d.imi).toBe(0);
    expect(d.rendimentoLiquido).toBe(0);
  });
});

describe('obterTaxaCatF', () => {
  it('returns 25 % for the default (short-term / open-ended) lease', () => {
    expect(obterTaxaCatF(config2025, 'padrao')).toBe(0.25);
  });

  it('returns the reduced rates for long-term leases', () => {
    expect(obterTaxaCatF(config2025, 'duracao5a10')).toBe(0.15);
    expect(obterTaxaCatF(config2025, 'duracao10a20')).toBe(0.1);
    expect(obterTaxaCatF(config2025, 'duracao20mais')).toBe(0.05);
  });

  it('defaults to the standard rate when no duration is provided', () => {
    expect(obterTaxaCatF(config2025)).toBe(0.25);
  });
});

describe('calcularColetaAutonomaF', () => {
  it('applies the rate to net income (typical case)', () => {
    expect(calcularColetaAutonomaF(10000, 0.25)).toBe(2500);
  });

  it('returns zero when net income is zero', () => {
    expect(calcularColetaAutonomaF(0, 0.25)).toBe(0);
  });

  it('clamps negative net income to zero before applying the rate', () => {
    expect(calcularColetaAutonomaF(-500, 0.25)).toBe(0);
  });
});
