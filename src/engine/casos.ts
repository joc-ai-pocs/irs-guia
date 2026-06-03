import { getTaxYearConfig } from '@/tax-data';
import { calcularLiquidacao, type LiquidacaoInput, type LiquidacaoResult } from './liquidacao';

/**
 * JSON-driven test harness for the settlement-note pipeline.
 *
 * A *caso* is a real (or pedagogical) IRS situation written as plain data:
 * the {@link LiquidacaoInput} the contribuinte would fill, plus the figures
 * expected on the AT settlement note ({@link Caso.esperado}). Running a caso
 * feeds the input through {@link calcularLiquidacao} and reconciles each
 * expected figure against the computed result — no UI, no hand-written
 * assertions. The same casos are exercised both by Vitest (regression) and by
 * the `npm run casos` CLI (human-readable reconciliation report).
 *
 * This module is deliberately pure (no fs / no DOM): loading the JSON files
 * lives in the callers (the test file and the CLI script) so the comparison
 * logic stays trivially testable.
 */

/** Default cent-level tolerance — AT notes round to two decimals. */
export const TOLERANCIA_PADRAO = 0.01;

/**
 * A single declarative test case.
 *
 * `esperado` maps a dot-path into the {@link LiquidacaoResult} to the value the
 * AT note shows for it. Numbers are compared within {@link Caso.tolerancia}
 * (default {@link TOLERANCIA_PADRAO}); strings/booleans are compared exactly.
 *
 * @example
 *   {
 *     "nome": "Nota AT 2024 — RB 14 381,99 (alínea c)",
 *     "ano": 2025,
 *     "input": { "rendimentoBruto": 14381.99 },
 *     "esperado": {
 *       "abatimentoMinimoExistencia": 641.34,
 *       "abatimentoMinimoExistenciaDetalhe.alinea": "c"
 *     }
 *   }
 */
export interface Caso {
  /** Human-readable label shown in reports. */
  readonly nome: string;
  /** Income year — resolved to a config via {@link getTaxYearConfig}. */
  readonly ano: number;
  /** The contribuinte's situation. */
  readonly input: LiquidacaoInput;
  /** Expected result figures, keyed by dot-path into {@link LiquidacaoResult}. */
  readonly esperado: Readonly<Record<string, number | string | boolean>>;
  /** Per-case numeric tolerance (€). Defaults to {@link TOLERANCIA_PADRAO}. */
  readonly tolerancia?: number;
  /** Optional provenance note (e.g. "Nota de liquidação 2024, IRS 123/…"). */
  readonly fonte?: string;
  /** Optional free-form explanation of the scenario. */
  readonly notas?: string;
}

/** Outcome of comparing one expected figure against the computed result. */
export interface LinhaResultado {
  /** The dot-path that was checked. */
  readonly campo: string;
  /** What the caso said to expect. */
  readonly esperado: number | string | boolean;
  /** What the engine actually produced (may be `undefined` if the path missed). */
  readonly calculado: unknown;
  /** `calculado − esperado` for numeric fields; `null` otherwise. */
  readonly delta: number | null;
  /** Whether this figure reconciled within tolerance / exactly. */
  readonly ok: boolean;
}

/** Outcome of running a whole caso. */
export interface ResultadoCaso {
  readonly nome: string;
  readonly ano: number;
  /** `true` only when every line reconciled. */
  readonly ok: boolean;
  /** One entry per expected figure, in declaration order. */
  readonly linhas: readonly LinhaResultado[];
  /** Set when the calculation itself threw (e.g. unknown year). */
  readonly erro?: string;
}

/**
 * Resolves a dot-separated path against an object, returning `undefined` for
 * any missing segment. Supports nested fields like `coleta.escalao.numero` and
 * `catF.coletaAutonoma`.
 */
export function resolverCaminho(obj: unknown, caminho: string): unknown {
  return caminho.split('.').reduce<unknown>((acc, chave) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[chave];
  }, obj);
}

/**
 * Runs a single caso: computes the liquidação and reconciles every expected
 * figure. Never throws — calculation errors are captured in {@link ResultadoCaso.erro}.
 */
export function correrCaso(caso: Caso): ResultadoCaso {
  let resultado: LiquidacaoResult;
  try {
    const config = getTaxYearConfig(caso.ano);
    resultado = calcularLiquidacao(caso.input, config);
  } catch (e) {
    return {
      nome: caso.nome,
      ano: caso.ano,
      ok: false,
      linhas: [],
      erro: e instanceof Error ? e.message : String(e),
    };
  }

  const tolerancia = caso.tolerancia ?? TOLERANCIA_PADRAO;
  const linhas: LinhaResultado[] = Object.entries(caso.esperado).map(
    ([campo, esperado]) => {
      const calculado = resolverCaminho(resultado, campo);
      if (typeof esperado === 'number') {
        const numerico = typeof calculado === 'number' && Number.isFinite(calculado);
        const delta = numerico ? calculado - esperado : null;
        return {
          campo,
          esperado,
          calculado,
          delta,
          ok: delta !== null && Math.abs(delta) <= tolerancia,
        };
      }
      return {
        campo,
        esperado,
        calculado,
        delta: null,
        ok: calculado === esperado,
      };
    },
  );

  return {
    nome: caso.nome,
    ano: caso.ano,
    ok: linhas.every((l) => l.ok),
    linhas,
  };
}

/**
 * Validates that an unknown JSON value is a well-formed {@link Caso}, throwing
 * a descriptive error otherwise. Keeps the loaders (test + CLI) honest about
 * malformed files instead of failing deep inside the engine.
 */
export function validarCaso(valor: unknown, contexto = 'caso'): Caso {
  if (valor == null || typeof valor !== 'object') {
    throw new Error(`${contexto}: esperava um objeto, recebi ${typeof valor}.`);
  }
  const c = valor as Record<string, unknown>;
  if (typeof c.nome !== 'string' || c.nome.trim() === '') {
    throw new Error(`${contexto}: campo "nome" em falta ou vazio.`);
  }
  if (typeof c.ano !== 'number' || !Number.isInteger(c.ano)) {
    throw new Error(`${contexto} (${String(c.nome)}): campo "ano" inválido.`);
  }
  if (c.input == null || typeof c.input !== 'object') {
    throw new Error(`${contexto} (${String(c.nome)}): campo "input" em falta.`);
  }
  if (typeof (c.input as Record<string, unknown>).rendimentoBruto !== 'number') {
    throw new Error(
      `${contexto} (${String(c.nome)}): input.rendimentoBruto é obrigatório (número).`,
    );
  }
  if (c.esperado == null || typeof c.esperado !== 'object') {
    throw new Error(`${contexto} (${String(c.nome)}): campo "esperado" em falta.`);
  }
  return valor as Caso;
}

/**
 * Normalizes the two accepted JSON shapes — a bare array of casos, or an object
 * `{ casos: [...] }` — into a validated `Caso[]`.
 */
export function extrairCasos(conteudo: unknown, ficheiro = 'casos'): Caso[] {
  const lista = Array.isArray(conteudo)
    ? conteudo
    : conteudo != null &&
        typeof conteudo === 'object' &&
        Array.isArray((conteudo as Record<string, unknown>).casos)
      ? ((conteudo as Record<string, unknown>).casos as unknown[])
      : null;
  if (lista === null) {
    throw new Error(
      `${ficheiro}: esperava um array de casos ou um objeto { "casos": [...] }.`,
    );
  }
  return lista.map((c, i) => validarCaso(c, `${ficheiro}[${i}]`));
}
