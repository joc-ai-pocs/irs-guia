import { describe, expect, it } from 'vitest';
import { roundCents } from './rounding';

describe('roundCents — cent-level rounding of settlement-note lines', () => {
  it('rounds IEEE-754 noise to a clean two-decimal value', () => {
    expect(roundCents(1092.7476000000001)).toBe(1092.75);
    expect(roundCents(773.8501240000002)).toBe(773.85);
  });

  it('is a no-op on values already at cent precision', () => {
    expect(roundCents(300)).toBe(300);
    expect(roundCents(0)).toBe(0);
    expect(roundCents(-50)).toBe(-50);
    expect(roundCents(1436.05)).toBe(1436.05);
  });

  it('rounds to the nearer cent on either side of the boundary', () => {
    expect(roundCents(1.2351)).toBe(1.24);
    expect(roundCents(1.2349)).toBe(1.23);
    expect(roundCents(7.847776)).toBe(7.85);
  });

  it('preserves the sign of negative amounts (reembolso lines)', () => {
    expect(roundCents(-390.18000000001)).toBe(-390.18);
    expect(roundCents(-1200.001)).toBe(-1200);
  });
});
