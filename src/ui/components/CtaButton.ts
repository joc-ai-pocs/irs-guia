import { h } from '@/ui/dom';
import './CtaButton.css';

export interface CtaButtonProps {
  /** Button text — short, action-oriented. */
  readonly label: string;
  /** Tab id to activate (via `window.__irsSwitchTab`). */
  readonly targetTab: string;
  /** Optional anchor inside the target tab to scroll to after switching. */
  readonly targetAnchor?: string;
}

/**
 * Brick-colored call-to-action that, when clicked, switches the active tab.
 * Used by section teasers (e.g. the Calculadora teaser inside the Guia tab).
 */
export function CtaButton(props: CtaButtonProps): HTMLElement {
  const btn = h(
    'button',
    { class: 'cta-button', type: 'button' },
    props.label,
    h('span', { class: 'cta-button__arrow' }, '→'),
  );

  btn.addEventListener('click', () => {
    window.__irsSwitchTab?.(props.targetTab, props.targetAnchor);
  });

  return btn;
}
