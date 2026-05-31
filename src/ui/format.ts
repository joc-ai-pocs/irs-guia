/**
 * Localized formatters for euro amounts and percentages, in pt-PT.
 * Centralized here so the formatting style is consistent across the UI.
 */

const EUR_FORMATTER = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
});

const PCT_FORMATTER = new Intl.NumberFormat('pt-PT', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEUR(value: number): string {
  return EUR_FORMATTER.format(value);
}

export function formatPercent(value: number): string {
  return PCT_FORMATTER.format(value);
}

/**
 * Format an amount as a signed value with explicit "+" or "−" prefix,
 * useful for step tables that subtract intermediate amounts.
 */
export function formatEURSigned(value: number, prefix: '+' | '−' = '−'): string {
  if (value === 0) return formatEUR(0);
  return `${prefix} ${formatEUR(Math.abs(value))}`;
}
