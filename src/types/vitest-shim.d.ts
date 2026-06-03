/**
 * Minimal ambient declarations to make vitest globals (describe/it/expect)
 * resolvable without installing @vitest types. The actual implementations
 * are provided by vitest at runtime.
 *
 * This file is for local typecheck convenience only — in CI, the real
 * vitest types from node_modules supersede these declarations.
 */

interface VitestExpectation {
  toBe(expected: unknown): void;
  toBeCloseTo(expected: number, precision?: number): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toBeGreaterThan(expected: number): void;
  toEqual(expected: unknown): void;
  toHaveLength(expected: number): void;
  toThrow(matcher?: string | RegExp): void;
  readonly not: VitestExpectation;
}

// global form (works with vite.config.ts test.globals: true)
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void | Promise<void>): void;
declare function test(name: string, fn: () => void | Promise<void>): void;
declare function expect(actual: unknown): VitestExpectation;

// import form (works with explicit `import { ... } from 'vitest'`)
declare module 'vitest' {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const test: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: (actual: unknown) => VitestExpectation;
}
