import { h } from '@/ui/dom';
import './AnexosHeader.css';

/**
 * Status of a Modelo 3 annex relative to the current Calculator scope.
 *
 *  - `obrigatorio`  : always required for this scenario (e.g. Rosto + Anexo A
 *                     for any cat. A taxpayer).
 *  - `conforme`     : required IF the contribuinte has values that touch this
 *                     annex (e.g. Anexo H if there are deduções à coleta).
 *  - `nao-aplicavel`: explicitly out of scope right now (rendered greyed-out
 *                     so the user knows what's NOT covered by this calculator).
 */
export type AnexoEstado = 'obrigatorio' | 'conforme' | 'nao-aplicavel';

export interface AnexoSpec {
  /** Short label rendered in the chip (e.g. "Rosto", "Anexo A"). */
  readonly id: string;
  /** Long label rendered next to / under the chip when expanded. */
  readonly title: string;
  /** Subtitle / what this annex covers. */
  readonly description: string;
  readonly estado: AnexoEstado;
  /**
   * Optional scope key identifying which input group(s) in the Calculator this
   * card controls. When present (and {@link estado} is not "obrigatorio" with
   * no key), clicking the card toggles the matching group on/off.
   */
  readonly scopeKey?: string;
  /** Whether the card is currently active. Defaults to `true`. */
  readonly active?: boolean;
  /**
   * If `true`, the card is rendered as ON-permanently — visually selected but
   * not toggleable. Used for "Rosto" and other always-required anexos.
   */
  readonly locked?: boolean;
}

export interface AnexosHeaderProps {
  /** Editorial eyebrow above the chips. */
  readonly eyebrow?: string;
  /** Larger title beneath the eyebrow (optional). */
  readonly title?: string;
  /** Tipped list of annexes. */
  readonly anexos: readonly AnexoSpec[];
  /**
   * Optional callback invoked when a toggleable card is clicked. Receives the
   * card's {@link AnexoSpec.scopeKey} and the new active state.
   */
  readonly onToggle?: (scopeKey: string, active: boolean) => void;
}

/**
 * Compact header announcing which Modelo 3 anexos the current Calculator
 * scope produces / depends on. Renders as a row of brick-toned chips with a
 * one-line description per item.
 *
 * Designed to evolve: when the engine grows to cover cat. F (Anexo F) or
 * imputação especial (Anexo D), just add entries to `anexos` — no component
 * change needed.
 */
export function AnexosHeader(props: AnexosHeaderProps): HTMLElement {
  return h(
    'header',
    { class: 'anexos-header' },
    h(
      'div',
      { class: 'anexos-header__eyebrow' },
      props.eyebrow ?? 'Anexos a preencher',
    ),
    props.title
      ? h('h3', { class: 'anexos-header__title' }, props.title)
      : null,
    h(
      'div',
      { class: 'anexos-header__chips' },
      ...props.anexos.map((a) => buildChip(a, props.onToggle)),
    ),
  );
}

function buildChip(
  a: AnexoSpec,
  onToggle: AnexosHeaderProps['onToggle'],
): HTMLElement {
  const toggleable = a.scopeKey !== undefined && !a.locked && a.estado !== 'nao-aplicavel';
  // Locked (e.g. "Rosto") and toggleable-active cards both render as "selected";
  // off-state only applies to toggleable cards that are currently deselected.
  const active = a.locked === true || (a.active ?? true);
  const stateClass = toggleable && !active ? 'inativo' : 'ativo';

  const classes = [
    'anexos-header__chip',
    `anexos-header__chip--${a.estado}`,
    `anexos-header__chip--${stateClass}`,
    toggleable ? 'anexos-header__chip--toggleable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const tag = toggleable ? 'button' : 'div';
  const attrs: Record<string, string | null> = {
    class: classes,
    title: a.description,
  };
  if (toggleable) {
    attrs['type'] = 'button';
    attrs['aria-pressed'] = active ? 'true' : 'false';
  }

  const chip = h(
    tag,
    attrs,
    h('div', { class: 'anexos-header__chip-id' }, a.id),
    h('div', { class: 'anexos-header__chip-title' }, a.title),
    h('div', { class: 'anexos-header__chip-desc' }, a.description),
    h('div', { class: 'anexos-header__chip-badge' }, estadoLabel(a.estado)),
    toggleable
      ? h(
          'div',
          { class: 'anexos-header__chip-mark' },
          active ? '✓ Incluído' : '+ Adicionar',
        )
      : null,
  );

  if (toggleable && onToggle && a.scopeKey) {
    const key = a.scopeKey;
    chip.addEventListener('click', () => {
      const newActive = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', newActive ? 'true' : 'false');
      chip.classList.toggle('anexos-header__chip--ativo', newActive);
      chip.classList.toggle('anexos-header__chip--inativo', !newActive);
      const mark = chip.querySelector('.anexos-header__chip-mark');
      if (mark) mark.textContent = newActive ? '✓ Incluído' : '+ Adicionar';
      onToggle(key, newActive);
    });
  }

  return chip;
}

function estadoLabel(estado: AnexoEstado): string {
  switch (estado) {
    case 'obrigatorio':
      return 'Obrigatório';
    case 'conforme':
      return 'Conforme aplicável';
    case 'nao-aplicavel':
      return 'Fora do âmbito';
  }
}
