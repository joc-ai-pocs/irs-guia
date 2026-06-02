import type { TaxYearConfig } from '@/tax-data/types';
import { h } from '@/ui/dom';
import './YearSelector.css';

export interface YearSelectorProps {
  /** All selectable fiscal year configs (typically from `listTaxYearConfigs()`). */
  readonly configs: readonly TaxYearConfig[];
  /** Currently selected income year. */
  readonly selected: number;
  /** Called when the user picks a different year. */
  readonly onSelect: (ano: number) => void;
}

/**
 * Segmented control to filter the whole guide by fiscal (income) year.
 * Years flagged as `provisorio` get a visual marker and, when selected,
 * a warning note reminding the reader the values are not yet verified.
 */
export function YearSelector(props: YearSelectorProps): HTMLElement {
  const selectedConfig = props.configs.find((c) => c.ano === props.selected);

  const buttons = props.configs.map((config) => {
    const isActive = config.ano === props.selected;
    return h(
      'button',
      {
        class: [
          'year-selector__btn',
          isActive ? 'year-selector__btn--active' : '',
          config.provisorio ? 'year-selector__btn--provisorio' : '',
        ]
          .filter(Boolean)
          .join(' '),
        type: 'button',
        'aria-pressed': String(isActive),
        title: config.diplomaLegal,
        onClick: () => {
          if (!isActive) props.onSelect(config.ano);
        },
      },
      String(config.ano),
      config.provisorio ? h('sup', { class: 'year-selector__flag' }, '*') : null,
    );
  });

  return h(
    'div',
    { class: 'year-selector' },
    h(
      'div',
      { class: 'year-selector__row', role: 'group', 'aria-label': 'Ano dos rendimentos' },
      h('span', { class: 'year-selector__label' }, 'Ano dos rendimentos'),
      ...buttons,
    ),
    selectedConfig?.provisorio
      ? h(
          'p',
          { class: 'year-selector__aviso' },
          `* Valores provisórios para ${selectedConfig.ano} — por confirmar no Portal das Finanças. Não usar para cálculos reais.`,
        )
      : null,
  );
}
