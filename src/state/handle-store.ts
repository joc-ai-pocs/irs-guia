/**
 * Tiny IndexedDB-backed key/value store for the FileSystemDirectoryHandle
 * the user picked. The standard FSA pattern: handles are serializable to
 * IndexedDB but NOT to JSON / localStorage — so we round-trip them via
 * a dedicated object store.
 *
 * Permission is NOT preserved across sessions: even with a saved handle the
 * browser re-asks for permission on the first interactive use. That's by
 * design — see queryPermission / requestPermission in fs-storage.ts.
 */

const DB_NAME = 'irs-guia';
const DB_VERSION = 1;
const STORE = 'handles';
const KEY = 'exerciciosDir';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as FileSystemDirectoryHandle | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveStoredDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(handle, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearStoredDirectoryHandle(): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
