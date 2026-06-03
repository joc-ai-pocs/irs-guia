import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { correrCaso, extrairCasos, type Caso } from './casos';

/**
 * Loads every JSON case file under the top-level `casos/` directory and turns
 * each declared caso into a Vitest assertion. This is what makes the JSON
 * fixtures part of `npm test` — edit a `.json`, run the suite, see pass/fail.
 *
 * The reconciliation logic itself lives in `casos.ts` (pure, fs-free); this
 * file only handles the file loading and the per-line failure message.
 */

const casosDir = fileURLToPath(new URL('../../casos/', import.meta.url));

function carregarTodos(): { ficheiro: string; casos: Caso[] }[] {
  const ficheiros = readdirSync(casosDir)
    .filter((f) => f.endsWith('.json') && !f.endsWith('.schema.json'))
    .sort();
  return ficheiros.map((ficheiro) => {
    const conteudo = JSON.parse(readFileSync(casosDir + ficheiro, 'utf8')) as unknown;
    return { ficheiro, casos: extrairCasos(conteudo, ficheiro) };
  });
}

const ficheiros = carregarTodos();

describe('casos JSON — reconciliação com a nota da AT', () => {
  it('há pelo menos um ficheiro de casos para correr', () => {
    expect(ficheiros.length).toBeGreaterThan(0);
  });

  for (const { ficheiro, casos } of ficheiros) {
    describe(ficheiro, () => {
      for (const caso of casos) {
        it(caso.nome, () => {
          const r = correrCaso(caso);
          if (!r.ok) {
            const falhas = r.erro
              ? [`  erro: ${r.erro}`]
              : r.linhas
                  .filter((l) => !l.ok)
                  .map(
                    (l) =>
                      `  ${l.campo}: esperado ${JSON.stringify(l.esperado)}, ` +
                      `calculado ${JSON.stringify(l.calculado)}` +
                      (l.delta !== null ? ` (Δ ${l.delta.toFixed(4)})` : ''),
                  );
            throw new Error(`Caso "${caso.nome}" (${caso.ano}) falhou:\n${falhas.join('\n')}`);
          }
          expect(r.ok).toBe(true);
        });
      }
    });
  }
});
