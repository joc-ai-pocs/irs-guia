/**
 * CLI runner for the JSON IRS cases — `npm run casos [-- ficheiro|pasta ...]`.
 *
 * Loads the declarative casos (default: the top-level `casos/` folder), feeds
 * each through the engine, and prints a per-caso reconciliation table that
 * mirrors an AT settlement note: every expected figure side-by-side with the
 * computed one and the delta. Exits with code 1 if any caso fails, so it can
 * gate CI too.
 *
 * Run via vite-node so the `@/…` alias and TypeScript resolve with zero build
 * step (see the `casos` script in package.json).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  correrCaso,
  extrairCasos,
  type Caso,
  type ResultadoCaso,
} from '../src/engine/casos';

// --- tiny ANSI helpers (no deps) ------------------------------------------
const cor = (codigo: number, s: string) => `[${codigo}m${s}[0m`;
const verde = (s: string) => cor(32, s);
const vermelho = (s: string) => cor(31, s);
const cinza = (s: string) => cor(90, s);
const negrito = (s: string) => cor(1, s);

const eur = new Intl.NumberFormat('pt-PT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function fmt(v: unknown): string {
  if (typeof v === 'number') return eur.format(v);
  if (v === undefined) return '—';
  return String(v);
}

// --- loading ---------------------------------------------------------------
const defaultDir = fileURLToPath(new URL('../casos/', import.meta.url));

function ficheirosDe(alvo: string): string[] {
  const st = statSync(alvo);
  if (st.isDirectory()) {
    const sep = alvo.endsWith('/') ? '' : '/';
    return readdirSync(alvo)
      .filter((f) => f.endsWith('.json') && !f.endsWith('.schema.json'))
      .sort()
      .map((f) => `${alvo}${sep}${f}`);
  }
  return [alvo];
}

function carregar(alvos: string[]): { ficheiro: string; casos: Caso[] }[] {
  return alvos.flatMap(ficheirosDe).map((ficheiro) => {
    const conteudo = JSON.parse(readFileSync(ficheiro, 'utf8')) as unknown;
    const nomeCurto = ficheiro.split('/').pop() ?? ficheiro;
    return { ficheiro: nomeCurto, casos: extrairCasos(conteudo, nomeCurto) };
  });
}

// --- rendering -------------------------------------------------------------
function imprimirCaso(r: ResultadoCaso): void {
  const marca = r.ok ? verde('✓') : vermelho('✗');
  console.log(`\n${marca} ${negrito(r.nome)} ${cinza(`(ano ${r.ano})`)}`);

  if (r.erro) {
    console.log(`  ${vermelho('erro:')} ${r.erro}`);
    return;
  }

  const campoW = Math.max(6, ...r.linhas.map((l) => l.campo.length));
  const espW = Math.max(8, ...r.linhas.map((l) => fmt(l.esperado).length));
  const calcW = Math.max(9, ...r.linhas.map((l) => fmt(l.calculado).length));

  console.log(
    cinza(
      `  ${'campo'.padEnd(campoW)}  ${'esperado'.padStart(espW)}  ` +
        `${'calculado'.padStart(calcW)}  ${'Δ'.padStart(9)}`,
    ),
  );
  for (const l of r.linhas) {
    const marcaL = l.ok ? verde('✓') : vermelho('✗');
    const delta = l.delta !== null ? eur.format(l.delta) : '';
    const linha =
      `  ${marcaL} ${l.campo.padEnd(campoW)}  ${fmt(l.esperado).padStart(espW)}  ` +
      `${fmt(l.calculado).padStart(calcW)}  ${delta.padStart(9)}`;
    console.log(l.ok ? linha : vermelho(linha));
  }
}

// --- main ------------------------------------------------------------------
const args = process.argv.slice(2);
const alvos = args.length > 0 ? args : [defaultDir];

let total = 0;
let falhados = 0;
try {
  const grupos = carregar(alvos);
  if (grupos.length === 0) {
    console.log(cinza('Nenhum ficheiro de casos encontrado.'));
    process.exit(0);
  }
  for (const { ficheiro, casos } of grupos) {
    console.log(`\n${negrito(`━━ ${ficheiro}`)} ${cinza(`(${casos.length} casos)`)}`);
    for (const caso of casos) {
      const r = correrCaso(caso);
      total += 1;
      if (!r.ok) falhados += 1;
      imprimirCaso(r);
    }
  }
} catch (e) {
  console.error(vermelho(`\nFalha ao carregar casos: ${e instanceof Error ? e.message : e}`));
  process.exit(1);
}

const resumo = `${total - falhados}/${total} casos OK`;
console.log(`\n${falhados === 0 ? verde(negrito(resumo)) : vermelho(negrito(resumo))}\n`);
process.exit(falhados === 0 ? 0 : 1);
