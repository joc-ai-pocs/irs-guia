import { describe, expect, it } from 'vitest';
import { formatNumberPtPT, parseNumberPtPT } from './format';

const NBSP = String.fromCharCode(0x00a0);
const NARROW_NBSP = String.fromCharCode(0x202f);

describe('parseNumberPtPT — pt-PT number input parsing', () => {
  it('parses the canonical grouped decimal (spec example)', () => {
    expect(parseNumberPtPT('1.436,05')).toBe(1436.05); // dot thousands + comma decimal
    expect(parseNumberPtPT('1 436,05')).toBe(1436.05); // regular space grouping
    expect(parseNumberPtPT('1' + NBSP + '436,05')).toBe(1436.05); // NBSP grouping
    expect(parseNumberPtPT('1' + NARROW_NBSP + '436,05')).toBe(1436.05); // narrow NBSP
  });

  it('parses comma as the decimal separator', () => {
    expect(parseNumberPtPT('12,5')).toBe(12.5);
    expect(parseNumberPtPT('0,01')).toBe(0.01);
    expect(parseNumberPtPT('13054,76')).toBe(13054.76);
  });

  it('treats well-formed dot groups as thousands, lone dots as decimals', () => {
    expect(parseNumberPtPT('1.436')).toBe(1436);
    expect(parseNumberPtPT('12.345.678')).toBe(12345678);
    expect(parseNumberPtPT('1.5')).toBe(1.5);
    expect(parseNumberPtPT('1000.50')).toBe(1000.5);
  });

  it('parses plain integers and bare decimals', () => {
    expect(parseNumberPtPT('320')).toBe(320);
    expect(parseNumberPtPT('0')).toBe(0);
    expect(parseNumberPtPT('9600')).toBe(9600);
  });

  it('returns the negative value (caller rejects it via min, not a parse error)', () => {
    expect(parseNumberPtPT('-100')).toBe(-100);
    expect(parseNumberPtPT('-1,5')).toBe(-1.5);
  });

  it('returns null for empty or non-numeric input', () => {
    expect(parseNumberPtPT('')).toBe(null);
    expect(parseNumberPtPT('   ')).toBe(null);
    expect(parseNumberPtPT('abc')).toBe(null);
    expect(parseNumberPtPT('12,3,4')).toBe(null);
    expect(parseNumberPtPT('1.2.3')).toBe(null); // dots not forming thousands groups
    expect(parseNumberPtPT('-')).toBe(null);
    expect(parseNumberPtPT(',')).toBe(null);
    expect(parseNumberPtPT('1e5')).toBe(null);
  });

  it('round-trips with formatNumberPtPT', () => {
    for (const v of [0, 320, 1436.05, 13054.76, 9600, 1000000.5]) {
      expect(parseNumberPtPT(formatNumberPtPT(v))).toBe(v);
    }
  });
});

describe('formatNumberPtPT — pt-PT number display', () => {
  it('uses a comma decimal with up to two places (grouping is optional)', () => {
    // The thousands separator is environment-dependent: browsers group pt-PT
    // with a space ("1 436,05"), but Node's ICU here may omit it ("1436,05").
    // Strip whatever grouping char is used and assert the digits + comma. The
    // visible "1 436,05" grouping is confirmed in the browser verification.
    expect(formatNumberPtPT(1436.05).replace(/\s/g, '')).toBe('1436,05');
    expect(formatNumberPtPT(320)).toBe('320');
    expect(formatNumberPtPT(0)).toBe('0');
  });

  it('drops trailing zeros beyond the value precision', () => {
    // 100 shows as "100", not "100,00".
    expect(formatNumberPtPT(100)).toBe('100');
  });
});
