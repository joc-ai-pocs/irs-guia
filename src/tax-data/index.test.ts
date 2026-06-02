import { describe, expect, it } from 'vitest';

import { TAX_YEARS, getTaxYearConfig, listTaxYearConfigs, requireFonte } from './index';

/**
 * Fonte ids that every fiscal year config MUST provide, because the guide's
 * UI sections call `requireFonte(config, id)` with them unconditionally.
 * Adding a new year file that misses one of these would crash the guide
 * as soon as that year is selected.
 */
const FONTES_OBRIGATORIAS = [
  'cirsIndice', // Secção 01
  'art68', // Secções 02 e 03
  'diploma', // Secção 02 — diploma que fixa a tabela do ano
  'montepio', // Secção 03
  'santander', // Secção 03
  'art25', // Secção 04
  'art53', // Secção 04
  'ias', // Secção 04
  'decoNota', // Secção 07
  'modelo3', // Secções 01 e 07
] as const;

describe('TAX_YEARS registry', () => {
  it('contains at least one year', () => {
    expect(Object.keys(TAX_YEARS).length).toBeGreaterThan(0);
  });

  it('keys match each config.ano', () => {
    for (const [key, config] of Object.entries(TAX_YEARS)) {
      expect(Number(key)).toBe(config.ano);
    }
  });

  it('every year provides the fontes required by the guide UI', () => {
    for (const config of Object.values(TAX_YEARS)) {
      for (const fonteId of FONTES_OBRIGATORIAS) {
        // requireFonte throws (failing the test) if the fonte is missing.
        expect(requireFonte(config, fonteId).id).toBe(fonteId);
      }
    }
  });

  it('every deduções à coleta fonteId resolves', () => {
    for (const config of Object.values(TAX_YEARS)) {
      for (const deducao of config.deducoesColeta) {
        expect(requireFonte(config, deducao.fonteId).id).toBe(deducao.fonteId);
      }
    }
  });
});

describe('listTaxYearConfigs', () => {
  it('returns all registered years in ascending order', () => {
    const anos = listTaxYearConfigs().map((c) => c.ano);
    expect(anos).toEqual([...anos].sort((a, b) => a - b));
    expect(anos).toHaveLength(Object.keys(TAX_YEARS).length);
  });
});

describe('getTaxYearConfig', () => {
  it('returns the config for a registered year', () => {
    expect(getTaxYearConfig(2025).ano).toBe(2025);
  });

  it('throws for an unknown year', () => {
    expect(() => getTaxYearConfig(1999)).toThrow(/1999/);
  });
});
