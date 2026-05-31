/**
 * Tiny DOM helpers — zero-dependency, fully typed.
 *
 * Used by all UI components to keep their bodies declarative
 * (h('div', { class: 'foo' }, [...])) rather than imperative
 * (document.createElement + setAttribute + appendChild).
 */

/**
 * Attributes accepted by {@link h}. Strings and numbers are set directly;
 * booleans set/unset boolean attributes; `null`/`undefined` are skipped.
 *
 * Special keys:
 *  - `class`: alias for className
 *  - `dataset`: bulk-sets data-* attributes
 *  - `on*`: event listeners (e.g. `onClick`, `onMouseEnter`)
 */
export type Attrs = {
  readonly class?: string;
  readonly dataset?: Readonly<Record<string, string | number>>;
  readonly [key: string]: unknown;
};

/**
 * A child can be a Node, a string (escaped automatically by the DOM API),
 * a number, `null` / `undefined` (skipped), or an array (flattened).
 */
export type Child = Node | string | number | null | undefined | readonly Child[];

/**
 * Creates a DOM element of {@link tag} with the given attributes and children.
 *
 * @example
 *   const btn = h('button', { class: 'primary', onClick: () => alert('hi') }, 'Click me');
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: readonly Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined || value === false) continue;

      if (key === 'class' && typeof value === 'string') {
        el.className = value;
      } else if (key === 'dataset' && typeof value === 'object') {
        for (const [k, v] of Object.entries(value as Record<string, string | number>)) {
          el.dataset[k] = String(v);
        }
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value as EventListener);
      } else if (value === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }

  appendChildren(el, children);
  return el;
}

function appendChildren(el: HTMLElement, children: readonly Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (Array.isArray(child)) {
      appendChildren(el, child);
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else {
      el.appendChild(document.createTextNode(String(child)));
    }
  }
}

/**
 * Like {@link h} but creates a DocumentFragment — useful when a function
 * needs to return multiple sibling nodes without a wrapping element.
 */
export function fragment(...children: readonly Child[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  const tempHost = document.createElement('div');
  appendChildren(tempHost, children);
  while (tempHost.firstChild) frag.appendChild(tempHost.firstChild);
  return frag;
}

/**
 * Mounts a component (root element) into a host, replacing any existing content.
 */
export function mount(host: HTMLElement, root: HTMLElement): void {
  host.replaceChildren(root);
}

/**
 * Safely inserts a string of HTML (already escaped/trusted by the caller).
 * Use sparingly — prefer h() composition.
 */
export function html(trustedMarkup: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.innerHTML = trustedMarkup;
  return span;
}
