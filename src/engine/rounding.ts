/**
 * Cent-level rounding for the settlement-note lines.
 *
 * The AT settlement note ("nota de liquidação") presents each rubric already
 * rounded to two decimals; the intermediate arithmetic, however, is carried at
 * full precision. To mirror that — and to stop IEEE-754 noise from leaking into
 * persisted snapshots and the reconciliation harness (`casos`, tolerance
 * 0,01 €) — we round the *documented note lines* through this single helper and
 * leave every intermediate quantity raw.
 *
 * ROUNDED (note lines, via {@link roundCents}):
 *   - coleta (progressiva da tabela art. 68.º, após quociente familiar)
 *   - coleta total (linha 18 — progressiva + tributações autónomas cat. F)
 *   - coleta líquida (linha 22 — após deduções à coleta e benefício municipal)
 *   - imposto apurado (linha 25 — após pagamentos por conta e retenção)
 *   - as mesmas linhas, ao construir o snapshot persistido ({@link buildSnapshot})
 *
 * RAW (intermediate quantities — never rounded here):
 *   - rendimento coletável, base para taxa, dedução específica, abatimento por
 *     mínimo de existência, benefício municipal, retenções e pagamentos por
 *     conta (entram já em cêntimos vindos do input), e a taxa média efetiva
 *     (é um rácio, não uma linha em euros).
 *
 * Rounding only the note lines keeps the pipeline auditable: each rounded value
 * corresponds one-to-one to a printed rubric, and the raw intermediates remain
 * available for the pedagogical breakdowns.
 */
export function roundCents(value: number): number {
  // Half-adjust nudges (`+ Number.EPSILON …`) are deliberately avoided: every
  // value passed here is already within a fraction of a cent of an exact figure
  // (it is the tail of IEEE-754 accumulation, not a true .xx5 half), so plain
  // scaled `Math.round` resolves it correctly. Exact-half inputs are not a case
  // this pipeline produces, and are therefore not contracted.
  return Math.round(value * 100) / 100;
}
