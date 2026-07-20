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

/**
 * Plain number in pt-PT — grouped thousands, up to 2 decimals, no currency.
 *
 * `useGrouping: true` ("always") is explicit on purpose: modern ICU defaults
 * pt-PT to "min2", which suppresses the separator when the leading group has a
 * single digit — so 1436,05 would render as "1436,05" while 13054,76 renders as
 * "13 054,76". SPEC-005 requires the blur to re-render `1.436,05` as
 * "1 436,05", so grouping must not depend on the magnitude.
 */
const NUMBER_FORMATTER = new Intl.NumberFormat('pt-PT', {
  maximumFractionDigits: 2,
  useGrouping: true,
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

/**
 * Formats a bare number in pt-PT conventions ("1 436,05", "320") — grouped
 * thousands, comma decimal, up to two decimals, no currency symbol. Used to
 * (re)display the value inside a text input after it is parsed (see
 * {@link parseNumberPtPT}).
 */
export function formatNumberPtPT(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

/**
 * Parses a pt-PT number typed into a text input, returning `null` for anything
 * that isn't a well-formed number (empty, letters, stray symbols). This is the
 * counterpart to {@link formatNumberPtPT} and the basis for the Calculator's
 * per-field validation (SPEC-005): a `null` here is what drives the invalid
 * state instead of silently coercing to zero.
 *
 * Accepted, following Portuguese conventions:
 *  - comma as the decimal separator: `1436,05` → `1436.05`
 *  - spaces (incl. NBSP / narrow NBSP) and dots as thousands separators:
 *    `1 436,05` and `1.436,05` → `1436.05`; `12 345` → `12345`
 *  - a bare dot as a decimal point when it clearly isn't a thousands group:
 *    `1.5` → `1.5`, but `1.436` → `1436`
 *  - a leading `-` (the negative value is returned so the caller can reject it
 *    with a proper "não pode ser negativo" message rather than a parse error)
 */
export function parseNumberPtPT(raw: string): number | null {
  let s = raw.trim();
  if (s === '') return null;
  // Strip every kind of space used for thousands grouping. JS `\s` already
  // covers NBSP (U+00A0) and narrow NBSP (U+202F), which Intl pt-PT may emit.
  s = s.replace(/\s/g, '');

  if (s.includes(',')) {
    // Comma present → it is the decimal separator; dots are thousands.
    if ((s.match(/,/g) ?? []).length > 1) return null;
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes('.')) {
    // No comma: decide whether the dots are thousands separators (well-formed
    // groups of three, e.g. `1.436`, `12.345.678`) or a lone decimal point.
    const parts = s.split('.');
    const head = parts[0] ?? '';
    const grupos = parts.slice(1);
    const saoMilhares =
      head.length >= 1 && head.length <= 3 && grupos.every((g) => g.length === 3);
    if (saoMilhares) s = parts.join('');
    else if (parts.length > 2) return null; // multiple dots, not thousands → invalid
  }

  if (!/^-?\d*\.?\d*$/.test(s) || s === '-' || s === '.' || s === '-.' || s === '') {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
