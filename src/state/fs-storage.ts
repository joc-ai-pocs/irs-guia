import {
  EXERCICIO_SCHEMA_VERSION,
  migrateExercicio,
  slugify,
  type Exercicio,
} from './types';
import {
  clearStoredDirectoryHandle,
  loadStoredDirectoryHandle,
  saveStoredDirectoryHandle,
} from './handle-store';

/**
 * Disk-backed storage for exercícios using the browser's File System Access
 * API. Each exercício is one JSON file inside a user-picked directory.
 *
 *   <picked-dir>/
 *     exercicio-2025-perfil-a.json
 *     exercicio-2025-perfil-b.json
 *     …
 *
 * The picked directory is persisted across sessions via IndexedDB, but the
 * browser still gates each session's first write/read behind a user gesture
 * (call {@link ensurePermission} from a click handler).
 */

export interface FsStorage {
  /** Human-readable directory name (for UI). */
  readonly directoryName: string;
  list(): Promise<readonly Exercicio[]>;
  save(ex: Exercicio): Promise<void>;
  remove(nome: string): Promise<void>;
}

export interface DisconnectedState {
  readonly kind: 'disconnected';
}

export interface ConnectedState {
  readonly kind: 'connected';
  readonly storage: FsStorage;
}

export interface NeedsPermissionState {
  readonly kind: 'needs-permission';
  /** Directory name remembered from the previous session. */
  readonly directoryName: string;
  /** Call from a click handler to re-prompt for read/write permission. */
  readonly grant: () => Promise<ConnectedState | DisconnectedState>;
}

export interface UnsupportedState {
  readonly kind: 'unsupported';
  readonly reason: string;
}

export type StorageState =
  | DisconnectedState
  | ConnectedState
  | NeedsPermissionState
  | UnsupportedState;

/**
 * Detects whether the current browser supports the File System Access API.
 */
export function isFsAccessSupported(): boolean {
  return typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function';
}

/**
 * Inspects the world at app start: do we have a remembered directory? Is the
 * permission still granted? Returns a state that the UI can render directly.
 *
 * NB: this MUST be called from a normal page-load path, but
 * {@link NeedsPermissionState.grant} MUST be called from inside a click
 * handler — the browser rejects requestPermission outside user gestures.
 */
export async function detectInitialState(): Promise<StorageState> {
  if (!isFsAccessSupported()) {
    return {
      kind: 'unsupported',
      reason:
        'O teu browser não suporta a File System Access API. Usa Chrome, Edge, Brave ou Arc.',
    };
  }

  const stored = await loadStoredDirectoryHandle();
  if (!stored) return { kind: 'disconnected' };

  const status = await stored.queryPermission({ mode: 'readwrite' });
  if (status === 'granted') {
    return { kind: 'connected', storage: makeStorage(stored) };
  }

  return {
    kind: 'needs-permission',
    directoryName: stored.name,
    grant: async () => {
      const next = await stored.requestPermission({ mode: 'readwrite' });
      if (next === 'granted') {
        return { kind: 'connected', storage: makeStorage(stored) };
      }
      // User denied — forget the handle so we don't loop on this prompt.
      await clearStoredDirectoryHandle();
      return { kind: 'disconnected' };
    },
  };
}

/**
 * Opens the directory picker; once the user picks one, persists the handle
 * for next time and returns a working {@link ConnectedState}. Caller must
 * invoke this from a click handler.
 */
export async function pickDirectory(): Promise<ConnectedState> {
  const handle = await window.showDirectoryPicker({
    id: 'irs-guia-exercicios',
    mode: 'readwrite',
  });
  await saveStoredDirectoryHandle(handle);
  return { kind: 'connected', storage: makeStorage(handle) };
}

/**
 * Forgets the currently-connected directory. The files on disk are NOT
 * touched — the user can reconnect later and they'll still be there.
 */
export async function disconnect(): Promise<DisconnectedState> {
  await clearStoredDirectoryHandle();
  return { kind: 'disconnected' };
}

// ─────────────────────────────────────────────────────────────────────────
// internals
// ─────────────────────────────────────────────────────────────────────────

function makeStorage(handle: FileSystemDirectoryHandle): FsStorage {
  return {
    directoryName: handle.name,

    async list(): Promise<readonly Exercicio[]> {
      const out: Exercicio[] = [];
      // FileSystemDirectoryHandle is async-iterable in supported browsers.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const [name, entry] of (handle as any).entries() as AsyncIterable<
        [string, FileSystemHandle]
      >) {
        if (entry.kind !== 'file' || !name.endsWith('.json')) continue;
        try {
          const file = await (entry as FileSystemFileHandle).getFile();
          const text = await file.text();
          const parsed = migrateExercicio(JSON.parse(text));
          if (parsed.ok) out.push(parsed.value);
          else console.warn(`[exercícios] ${name}: ${parsed.error}`);
        } catch (err) {
          console.warn(`[exercícios] falha a ler ${name}:`, err);
        }
      }
      // Sort by updatedAt descending — most recent first.
      out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      return out;
    },

    async save(ex: Exercicio): Promise<void> {
      // Enforce the current schema version on write.
      const toWrite: Exercicio = { ...ex, schemaVersion: EXERCICIO_SCHEMA_VERSION };
      const filename = `${slugify(ex.nome) || 'exercicio'}.json`;
      const fileHandle = await handle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(`${JSON.stringify(toWrite, null, 2)}\n`);
      await writable.close();
    },

    async remove(nome: string): Promise<void> {
      const filename = `${slugify(nome) || 'exercicio'}.json`;
      try {
        await handle.removeEntry(filename);
      } catch (err) {
        if ((err as DOMException).name !== 'NotFoundError') throw err;
      }
    },
  };
}
