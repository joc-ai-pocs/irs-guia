import { h } from '@/ui/dom';
import './TabsNav.css';

export interface TabDef {
  readonly id: string;
  readonly label: string;
  /** Returns the tab's content element (rendered eagerly on first mount). */
  readonly render: () => HTMLElement;
}

export interface TabsNavProps {
  readonly tabs: readonly TabDef[];
  /** Tab id initially active. Defaults to the first tab. */
  readonly defaultTab?: string;
}

/**
 * Internal state for cross-tab navigation (e.g. a resumo link jumping to a
 * specific anchor inside the guide tab). The window is mutated so other
 * components — like {@link Markdown}'s `data-tab` links — can request a switch
 * without needing a prop callback wired all the way down.
 */
declare global {
  interface Window {
    __irsSwitchTab?: (tabId: string, anchorHref?: string) => void;
  }
}

/**
 * Editorial sticky tab bar with eager content rendering. Each tab's content
 * is built once on first activation and cached, preserving interactive state
 * (e.g. the Calculator's inputs) when the user switches back and forth.
 */
export function TabsNav(props: TabsNavProps): HTMLElement {
  const initial = props.defaultTab ?? props.tabs[0]?.id;
  if (!initial) throw new Error('TabsNav requires at least one tab.');

  const rendered = new Map<string, HTMLElement>();
  const contentHost = h('div', { class: 'tabs-content' });

  const nav = h(
    'nav',
    { class: 'tabs-nav', role: 'tablist' },
    ...props.tabs.map((tab) =>
      h(
        'button',
        {
          class: 'tabs-nav__btn',
          role: 'tab',
          dataset: { tab: tab.id },
          type: 'button',
        },
        tab.label,
      ),
    ),
  );

  const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>('.tabs-nav__btn'));

  function activate(tabId: string, anchorHref?: string): void {
    const tab = props.tabs.find((t) => t.id === tabId);
    if (!tab) return;

    let body = rendered.get(tabId);
    if (!body) {
      body = tab.render();
      body.classList.add('tabs-pane');
      body.dataset.tab = tabId;
      rendered.set(tabId, body);
    }

    for (const btn of buttons) {
      btn.classList.toggle('tabs-nav__btn--active', btn.dataset['tab'] === tabId);
    }

    contentHost.replaceChildren(body);

    if (anchorHref) {
      window.setTimeout(() => {
        const target = body!.querySelector<HTMLElement>(anchorHref);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset['tab'];
      if (tabId) activate(tabId);
    });
  }

  window.__irsSwitchTab = (tabId, anchorHref) => activate(tabId, anchorHref);

  // Mount initial tab.
  activate(initial);

  return h('div', { class: 'tabs' }, nav, contentHost);
}
