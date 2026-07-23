import type { CalculatorHandle } from './Calculator';
import { h } from '@/ui/dom';
import { formatEUR } from '@/ui/format';
import {
  detectInitialState,
  disconnect,
  isFsAccessSupported,
  pickDirectory,
  type ConnectedState,
  type StorageState,
} from '@/state/fs-storage';
import {
  buildSnapshot,
  EXERCICIO_SCHEMA_VERSION,
  type Exercicio,
} from '@/state/types';
import './ExerciciosPanel.css';

/**
 * The slice of panel state that must survive an App reconstruction (e.g. the
 * year switch, which rebuilds the whole tree). The directory connection itself
 * is recovered automatically by {@link detectInitialState} from the persisted
 * handle; what would otherwise be lost is the expanded/collapsed state and the
 * currently-selected exercício, so those are lifted out via props + callback.
 */
export interface ExerciciosPanelState {
  /** Whether the panel body is expanded. */
  readonly expanded: boolean;
  /** Name of the exercício currently selected in the list, if any. */
  readonly activeName: string | null;
}

export interface ExerciciosPanelProps {
  /** The Calculator instance this panel reads/writes inputs from. */
  readonly calculator: CalculatorHandle;
  /** Used to stamp every saved exercício's `ano`. */
  readonly ano: number;
  /**
   * Optional override for "now" — kept open for future Date.now() injection
   * (e.g. deterministic tests). Defaults to `new Date().toISOString()`.
   */
  readonly now?: () => string;
  /**
   * Initial expanded/selected state, used to restore the panel across an App
   * reconstruction. Defaults to collapsed with nothing selected.
   */
  readonly initialState?: ExerciciosPanelState;
  /**
   * Notified whenever the expanded/selected state changes, so a parent can
   * persist it and feed it back through {@link initialState} on the next mount.
   */
  readonly onStateChange?: (state: ExerciciosPanelState) => void;
}

/**
 * Panel that lives above the Calculator. Manages a user-picked directory
 * (via File System Access API) and a flat list of exercícios saved there.
 *
 * Rendering is fully state-driven: the panel re-renders its own body when
 * the storage state changes (disconnected ↔ connected ↔ needs-permission).
 */
export function ExerciciosPanel(props: ExerciciosPanelProps): HTMLElement {
  const now = props.now ?? (() => new Date().toISOString());

  const root = h('section', { class: 'exercicios-panel' });
  let state: StorageState = { kind: 'disconnected' };
  /** The name currently selected/active in the list (if any). */
  let activeName: string | null = props.initialState?.activeName ?? null;
  /** Whether the panel body is expanded. Restored from props (default collapsed). */
  let expanded = props.initialState?.expanded ?? false;
  /** Last known items list — used so collapse/expand doesn't trigger a refetch. */
  let lastItems: readonly Exercicio[] = [];

  /** Report the persistable state upward so it survives a reconstruction. */
  function emitState(): void {
    props.onStateChange?.({ expanded, activeName });
  }

  function render(items?: readonly Exercicio[]): void {
    if (items !== undefined) lastItems = items;
    const children: (HTMLElement | null)[] = [buildToggle(lastItems)];
    if (expanded) children.push(buildBody(lastItems));
    root.replaceChildren(...children.filter((c): c is HTMLElement => c !== null));
  }

  function buildToggle(items: readonly Exercicio[]): HTMLElement {
    const count = state.kind === 'connected' ? items.length : null;
    const arrow = expanded ? '▾' : '▸';

    const btn = h(
      'button',
      {
        class: `exercicios-panel__toggle${expanded ? ' exercicios-panel__toggle--open' : ''}`,
        type: 'button',
      },
      h('span', { class: 'exercicios-panel__toggle-arrow' }, arrow),
      h(
        'span',
        { class: 'exercicios-panel__toggle-label' },
        h('span', { class: 'exercicios-panel__eyebrow' }, 'Exercícios guardados'),
        count !== null
          ? h('span', { class: 'exercicios-panel__toggle-count' }, `(${count})`)
          : null,
      ),
      h('span', { class: 'exercicios-panel__status' }, statusLabel(state)),
    );
    btn.addEventListener('click', () => {
      expanded = !expanded;
      emitState();
      render();
    });
    return btn;
  }

  function buildBody(items: readonly Exercicio[]): HTMLElement {
    let inner: HTMLElement;
    if (state.kind === 'unsupported') inner = unsupportedBody(state.reason);
    else if (state.kind === 'disconnected') inner = disconnectedBody();
    else if (state.kind === 'needs-permission') inner = needsPermissionBody(state.directoryName, state.grant);
    else inner = connectedBody(state, items);
    return h('div', { class: 'exercicios-panel__body' }, inner);
  }

  function unsupportedBody(reason: string): HTMLElement {
    return h(
      'div',
      { class: 'exercicios-panel__empty' },
      h('p', null, reason),
      h(
        'p',
        { class: 'exercicios-panel__hint' },
        'Os teus inputs continuam a funcionar normalmente — apenas não podem ser guardados em disco neste browser.',
      ),
    );
  }

  function disconnectedBody(): HTMLElement {
    const btn = h(
      'button',
      { class: 'exercicios-panel__primary', type: 'button' },
      'Conectar pasta…',
    );
    btn.addEventListener('click', async () => {
      try {
        const next = await pickDirectory();
        state = next;
        await refresh();
      } catch (err) {
        if ((err as DOMException).name !== 'AbortError') {
          console.error('[exercícios] falha a abrir picker:', err);
        }
      }
    });

    return h(
      'div',
      { class: 'exercicios-panel__empty' },
      h(
        'p',
        null,
        'Escolhe uma pasta no disco onde os teus exercícios vão ser guardados como ficheiros ',
        h('code', null, '.json'),
        '. A pasta é lembrada entre sessões.',
      ),
      btn,
    );
  }

  function needsPermissionBody(
    directoryName: string,
    grant: () => Promise<ConnectedState | { kind: 'disconnected' }>,
  ): HTMLElement {
    const btn = h(
      'button',
      { class: 'exercicios-panel__primary', type: 'button' },
      `Reconectar “${directoryName}”`,
    );
    btn.addEventListener('click', async () => {
      const next = await grant();
      state = next as StorageState;
      await refresh();
    });
    return h(
      'div',
      { class: 'exercicios-panel__empty' },
      h(
        'p',
        null,
        'O browser precisa que confirmes outra vez o acesso à pasta ',
        h('strong', null, directoryName),
        '. Clica para autorizar.',
      ),
      btn,
    );
  }

  function connectedBody(s: ConnectedState, items: readonly Exercicio[]): HTMLElement {
    const list = items.length === 0
      ? h(
          'p',
          { class: 'exercicios-panel__empty-list' },
          'Sem exercícios nesta pasta. Usa “Guardar como…” para criar o primeiro.',
        )
      : h(
          'ul',
          { class: 'exercicios-panel__list' },
          ...items.map((ex) => renderItem(s, ex)),
        );

    return h(
      'div',
      { class: 'exercicios-panel__body' },
      h(
        'div',
        { class: 'exercicios-panel__actions' },
        actionButton('Guardar como…', () => saveAs(s)),
        actionButton(
          activeName ? `Atualizar “${activeName}”` : 'Atualizar',
          () => activeName && updateExisting(s, activeName),
          { disabled: !activeName },
        ),
        actionButton('Desconectar pasta', () => disconnectDir(), { secondary: true }),
      ),
      list,
    );
  }

  function renderItem(s: ConnectedState, ex: Exercicio): HTMLElement {
    const isActive = ex.nome === activeName;
    const item = h(
      'li',
      {
        class: `exercicios-panel__item${isActive ? ' exercicios-panel__item--active' : ''}`,
      },
      h(
        'button',
        { class: 'exercicios-panel__item-main', type: 'button' },
        h('div', { class: 'exercicios-panel__item-name' }, ex.nome),
        h(
          'div',
          { class: 'exercicios-panel__item-meta' },
          `Ano ${ex.ano} · ${ex.snapshotResultado.escalaoNumero}º escalão · `,
          impostoLabel(ex.snapshotResultado.impostoApurado),
        ),
      ),
      h(
        'div',
        { class: 'exercicios-panel__item-controls' },
        iconButton('Duplicar', '⎘', () => duplicate(s, ex)),
        iconButton('Apagar', '✕', () => remove(s, ex)),
      ),
    );
    const main = item.querySelector<HTMLButtonElement>('.exercicios-panel__item-main');
    main?.addEventListener('click', () => load(ex));
    return item;
  }

  // ─────────── actions ───────────

  async function refresh(): Promise<void> {
    if (state.kind !== 'connected') {
      render();
      return;
    }
    try {
      const items = await state.storage.list();
      render(items);
    } catch (err) {
      console.error('[exercícios] falha a listar:', err);
      render();
    }
  }

  function load(ex: Exercicio): void {
    props.calculator.setInputs(ex.inputs);
    activeName = ex.nome;
    emitState();
    void refresh();
    // Scroll the calculator into view for visual feedback that something happened.
    props.calculator.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function saveAs(s: ConnectedState): Promise<void> {
    const nome = window.prompt(
      'Nome do exercício:',
      `Exercício ${props.ano} — `,
    );
    if (!nome || nome.trim() === '') return;
    const trimmed = nome.trim();
    const exercicio: Exercicio = {
      schemaVersion: EXERCICIO_SCHEMA_VERSION,
      nome: trimmed,
      ano: props.ano,
      createdAt: now(),
      updatedAt: now(),
      inputs: props.calculator.getInputs(),
      snapshotResultado: buildSnapshot(props.calculator.getLastResult()),
    };
    try {
      await s.storage.save(exercicio);
      activeName = trimmed;
      emitState();
      await refresh();
    } catch (err) {
      alert(`Falha a guardar: ${(err as Error).message}`);
    }
  }

  async function updateExisting(s: ConnectedState, nome: string): Promise<void> {
    try {
      const items = await s.storage.list();
      const existing = items.find((x) => x.nome === nome);
      const created = existing?.createdAt ?? now();
      const exercicio: Exercicio = {
        schemaVersion: EXERCICIO_SCHEMA_VERSION,
        nome,
        ano: props.ano,
        createdAt: created,
        updatedAt: now(),
        inputs: props.calculator.getInputs(),
        snapshotResultado: buildSnapshot(props.calculator.getLastResult()),
      };
      await s.storage.save(exercicio);
      await refresh();
    } catch (err) {
      alert(`Falha a atualizar: ${(err as Error).message}`);
    }
  }

  async function duplicate(s: ConnectedState, ex: Exercicio): Promise<void> {
    const nome = window.prompt('Nome da cópia:', `${ex.nome} (cópia)`);
    if (!nome || nome.trim() === '') return;
    const trimmed = nome.trim();
    const copy: Exercicio = {
      ...ex,
      nome: trimmed,
      createdAt: now(),
      updatedAt: now(),
    };
    try {
      await s.storage.save(copy);
      activeName = trimmed;
      emitState();
      await refresh();
    } catch (err) {
      alert(`Falha a duplicar: ${(err as Error).message}`);
    }
  }

  async function remove(s: ConnectedState, ex: Exercicio): Promise<void> {
    if (!window.confirm(`Apagar “${ex.nome}”? Esta ação não pode ser revertida.`)) return;
    try {
      await s.storage.remove(ex.nome);
      if (activeName === ex.nome) {
        activeName = null;
        emitState();
      }
      await refresh();
    } catch (err) {
      alert(`Falha a apagar: ${(err as Error).message}`);
    }
  }

  async function disconnectDir(): Promise<void> {
    state = await disconnect();
    activeName = null;
    emitState();
    render();
  }

  // ─────────── bootstrap ───────────

  if (!isFsAccessSupported()) {
    state = {
      kind: 'unsupported',
      reason:
        'O teu browser não suporta a File System Access API. Usa Chrome, Edge, Brave ou Arc.',
    };
    render();
  } else {
    render();
    void detectInitialState().then(async (next) => {
      state = next;
      if (next.kind === 'connected') await refresh();
      else render();
    });
  }

  return root;
}

// ─────────────────────────────────────────────────────────────────────────
// view helpers
// ─────────────────────────────────────────────────────────────────────────

function statusLabel(state: StorageState): string {
  switch (state.kind) {
    case 'disconnected':
      return 'Não conectado';
    case 'needs-permission':
      return `Pasta: ${state.directoryName} (sem permissão)`;
    case 'connected':
      return `Pasta: ${state.storage.directoryName}`;
    case 'unsupported':
      return 'Storage indisponível';
  }
}

function impostoLabel(apurado: number): string {
  if (apurado > 0.01) return `${formatEUR(apurado)} a pagar`;
  if (apurado < -0.01) return `${formatEUR(-apurado)} a receber`;
  return 'saldo nulo';
}

interface ActionOpts {
  readonly disabled?: boolean;
  readonly secondary?: boolean;
}

function actionButton(label: string, onClick: () => void, opts: ActionOpts = {}): HTMLElement {
  const cls = [
    'exercicios-panel__action',
    opts.secondary ? 'exercicios-panel__action--secondary' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const btn = h(
    'button',
    {
      class: cls,
      type: 'button',
      ...(opts.disabled ? { disabled: true } : {}),
    },
    label,
  );
  btn.addEventListener('click', onClick);
  return btn;
}

function iconButton(title: string, glyph: string, onClick: () => void): HTMLElement {
  const btn = h(
    'button',
    { class: 'exercicios-panel__icon', type: 'button', title },
    glyph,
  );
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  return btn;
}
