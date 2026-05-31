import type { TaxYearConfig } from '@/tax-data/types';
import {
  BracketBar,
  Calculator,
  ExerciciosPanel,
  Markdown,
} from '@/ui/components';
import { h } from '@/ui/dom';

import intro from '@/content/tab_calculadora_intro.md?raw';

/**
 * Tab "Calculadora" — standalone interactive simulator.
 *
 * Layout (top to bottom):
 *   1. Intro markdown
 *   2. ExerciciosPanel — list / save / load / delete persisted exercícios
 *   3. BracketBar — own instance, synced live with the Calculator
 *   4. Calculator — handle-based so the panel can read/write its inputs
 */
export function TabCalculadora(config: TaxYearConfig): HTMLElement {
  const bracketBar = BracketBar({ escaloes: config.escaloes });
  const calculator = Calculator({
    config,
    badge: 'Cat. A / H · Tributação individual',
    onEscalaoChange: (numero) => bracketBar.setActive(numero),
  });
  const exerciciosPanel = ExerciciosPanel({
    calculator,
    ano: config.ano,
  });

  return h(
    'div',
    { class: 'tab-calculadora' },
    Markdown({ source: intro, className: 'intro' }),
    exerciciosPanel,
    bracketBar.element,
    calculator.element,
  );
}
