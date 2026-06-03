import type { TaxYearConfig } from './types';
import { config2025 } from './2025';
import { config2026 } from './2026';

export type { TaxYearConfig, Escalao, DeducaoColeta, FonteOficial } from './types';
export { config2025, config2026 };

/**
 * Registry of all known fiscal year configurations.
 * Add new years here once the corresponding file is verified.
 */
export const TAX_YEARS: Readonly<Record<number, TaxYearConfig>> = {
  2025: config2025,
  2026: config2026,
};

/**
 * All registered fiscal year configurations, ordered by ascending year.
 * The UI uses this to build the year selector.
 */
export function listTaxYearConfigs(): readonly TaxYearConfig[] {
  return Object.values(TAX_YEARS).sort((a, b) => a.ano - b.ano);
}

/**
 * Returns the configuration for the given income year, or throws if unknown.
 *
 * @param ano year in which income was earned (e.g. 2025)
 * @throws {Error} if no configuration is registered for {@link ano}
 */
export function getTaxYearConfig(ano: number): TaxYearConfig {
  const config = TAX_YEARS[ano];
  if (!config) {
    throw new Error(
      `Sem configuração fiscal para o ano ${ano}. ` +
      `Anos disponíveis: ${Object.keys(TAX_YEARS).join(', ')}.`
    );
  }
  return config;
}

/**
 * Looks up a source by id in a TaxYearConfig.fontes map, throwing if it's missing.
 *
 * This helper exists because `config.fontes[id]` returns `FonteOficial | undefined`
 * under `noUncheckedIndexedAccess`, which fights against ergonomic UI code.
 * Use this at the boundary between data and UI to convert the lookup to a
 * non-nullable value with a clear error message.
 *
 * @throws {Error} if the source id is not registered in {@link config.fontes}
 */
export function requireFonte(
  config: TaxYearConfig,
  fonteId: string,
): import('./types').FonteOficial {
  const fonte = config.fontes[fonteId];
  if (!fonte) {
    throw new Error(
      `Fonte oficial '${fonteId}' não está registrada em config ${config.ano}. ` +
      `Disponíveis: ${Object.keys(config.fontes).join(', ')}.`
    );
  }
  return fonte;
}
