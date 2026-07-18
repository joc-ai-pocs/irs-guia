import type { TaxYearConfig } from '@/tax-data/types';
import type { LiquidacaoInput } from '@/engine';
import {
  AnexosHeader,
  BracketBar,
  Calculator,
  ExerciciosPanel,
  Markdown,
  type AnexoSpec,
  type ExerciciosPanelState,
  type VisibleGroups,
} from '@/ui/components';
import { h } from '@/ui/dom';

import intro from '@/content/tab_calculadora_intro.md?raw';
import './TabCalculadora.css';

/**
 * Initial scope — by default every group is on, so the simulator opens with
 * the full cat. A + H + Anexo H scenario visible. The user can deselect any of
 * the toggleable cards to narrow the calculation.
 */
const INITIAL_SCOPE: VisibleGroups = {
  trabalho: true,
  pensoes: true,
  catF: false,
  catB: false,
  deducoesColeta: true,
};

/**
 * Builds the cards row from the current scope state. The Anexo A card is
 * split into two — "Trabalho" (cat. A) and "Pensões" (cat. H) — so each
 * toggle maps 1:1 onto the engine's per-category specific deduction.
 *
 * Cards with `scopeKey` are clickable; "Rosto" and the out-of-scope anexos
 * are rendered as static chips.
 */
function buildAnexos(scope: VisibleGroups): readonly AnexoSpec[] {
  return [
    {
      id: 'Rosto',
      title: 'Folha de rosto',
      description: 'Identificação do agregado, residência fiscal, dependentes.',
      estado: 'obrigatorio',
      locked: true,
    },
    {
      id: 'Anexo A · cat. A',
      title: 'Trabalho dependente',
      description: 'Rendimentos cat. A, contribuições obrigatórias, retenções na fonte.',
      estado: 'obrigatorio',
      scopeKey: 'trabalho',
      active: scope.trabalho,
    },
    {
      id: 'Anexo A · cat. H',
      title: 'Pensões',
      description: 'Rendimentos cat. H — pensões (códigos 401–413 do quadro 4).',
      estado: 'conforme',
      scopeKey: 'pensoes',
      active: scope.pensoes,
    },
    {
      id: 'Anexo H',
      title: 'Deduções à coleta',
      description: 'Saúde, educação, despesas gerais, PPR, benefícios fiscais.',
      estado: 'conforme',
      scopeKey: 'deducoesColeta',
      active: scope.deducoesColeta,
    },
    {
      id: 'Anexo F',
      title: 'Rendimentos prediais',
      description:
        'Rendas (cat. F) — tributação autónoma 25% (ou taxa reduzida para contratos longos). Pode optar pelo englobamento.',
      estado: 'conforme',
      scopeKey: 'catF',
      active: scope.catF,
    },
    {
      id: 'Anexo D',
      title: 'Transparência fiscal',
      description:
        'Imputação especial (cat. B) — matéria coletável imputada por sociedade transparente. Englobada nos escalões progressivos (art. 20.º CIRS).',
      estado: 'conforme',
      scopeKey: 'catB',
      active: scope.catB,
    },
  ];
}

/**
 * State captured from a live Calculator so it can be re-injected into a freshly
 * rebuilt one — the year switch (SPEC-004) rebuilds the whole App, and without
 * this the user's typed values and chosen scope would be lost.
 */
export interface TabCalculadoraState {
  readonly inputs: LiquidacaoInput;
  readonly groups: VisibleGroups;
}

/**
 * Optional wiring for state preservation across App reconstructions. All fields
 * are optional so the first mount (nothing to restore) keeps the defaults.
 */
export interface TabCalculadoraOptions {
  /** Inputs to pre-populate (from a previous {@link TabCalculadoraState}). */
  readonly initialInputs?: Partial<LiquidacaoInput>;
  /** Scope (visible anexo groups) to restore. Defaults to {@link INITIAL_SCOPE}. */
  readonly initialGroups?: VisibleGroups;
  /** Exercícios panel expanded/selected state to restore. */
  readonly initialExercicios?: ExerciciosPanelState;
  /** Notified on every recompute with the current inputs + scope. */
  readonly onStateChange?: (state: TabCalculadoraState) => void;
  /** Notified when the exercícios panel expanded/selected state changes. */
  readonly onExerciciosChange?: (state: ExerciciosPanelState) => void;
}

/**
 * Tab "Calculadora" — standalone interactive simulator.
 *
 * Layout (top to bottom):
 *   1. Intro markdown
 *   2. AnexosHeader — clickable cards that drive the Calculator's scope
 *   3. ExerciciosPanel — collapsed by default
 *   4. Grid 2 columns:
 *        LEFT  → Calculator inputs
 *        RIGHT → BracketBar + Calculator output (breakdown) + Final result box
 *      Em mobile (<900px) colapsa para uma coluna (cálculo abaixo dos inputs).
 *
 * `opts` carries the state to restore after an App reconstruction (year switch)
 * and the callbacks that report changes back up — see SPEC-004.
 */
export function TabCalculadora(
  config: TaxYearConfig,
  opts: TabCalculadoraOptions = {},
): HTMLElement {
  // Live scope — mutated by card clicks; passed (as a fresh frozen view) to
  // the Calculator on each toggle. Using `-readonly` so we can keep the public
  // VisibleGroups interface immutable while still letting the orchestrator
  // mutate this local copy in response to card clicks. Restored from opts when
  // rebuilding after a year switch.
  const scope: { -readonly [K in keyof VisibleGroups]: VisibleGroups[K] } = {
    ...INITIAL_SCOPE,
    ...(opts.initialGroups ?? {}),
  };

  const bracketBar = BracketBar({ escaloes: config.escaloes });
  const calculator = Calculator({
    config,
    badge: 'Cat. A / H · Tributação individual',
    visibleGroups: scope,
    ...(opts.initialInputs ? { initial: opts.initialInputs } : {}),
    onEscalaoChange: (numero) => bracketBar.setActive(numero),
    // Report inputs + scope on every recompute so the orchestrator can restore
    // them if the App is rebuilt (year switch).
    onChange: ({ inputs }) => opts.onStateChange?.({ inputs, groups: { ...scope } }),
  });
  const exerciciosPanel = ExerciciosPanel({
    calculator,
    ano: config.ano,
    ...(opts.initialExercicios ? { initialState: opts.initialExercicios } : {}),
    ...(opts.onExerciciosChange ? { onStateChange: opts.onExerciciosChange } : {}),
  });

  const anexosHeader = AnexosHeader({
    eyebrow: 'Anexos a preencher · clica para incluir/excluir',
    anexos: buildAnexos(scope),
    onToggle: (key, active) => {
      if (key === 'trabalho') scope.trabalho = active;
      else if (key === 'pensoes') scope.pensoes = active;
      else if (key === 'catF') scope.catF = active;
      else if (key === 'catB') scope.catB = active;
      else if (key === 'deducoesColeta') scope.deducoesColeta = active;
      calculator.setVisibleGroups(scope);
    },
  });

  return h(
    'div',
    { class: 'tab-calculadora' },
    Markdown({ source: intro, className: 'intro' }),
    anexosHeader,
    exerciciosPanel,
    h(
      'div',
      { class: 'tab-calculadora__grid' },
      h(
        'div',
        { class: 'tab-calculadora__col-inputs' },
        calculator.element,
      ),
      h(
        'div',
        { class: 'tab-calculadora__col-result' },
        bracketBar.element,
        h(
          'div',
          { class: 'tab-calculadora__resultado' },
          h(
            'div',
            { class: 'tab-calculadora__resultado-eyebrow' },
            'Resultado do cálculo',
          ),
          calculator.outputElement,
          calculator.finalElement,
        ),
      ),
    ),
  );
}
