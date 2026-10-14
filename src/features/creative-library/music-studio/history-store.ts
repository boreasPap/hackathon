// Generated sounds are kept in this browser (IndexedDB), so History survives a reload.
// A Music Generator run is kept here too, and checked until eachlabs finishes it.

export type GeneratedSound = {
  id: string;
  label: string;
  source: string;
  createdAt: string;
  /** The generated sound (sample sounds made in the browser). */
  blob?: Blob;
  /** The video the sound was made for, kept to play them together. */
  video?: Blob;
  /** A Music Generator run on eachlabs: its id, state and the videos with music it returned. */
  executionId?: string;
  status?: "running" | "completed" | "failed";
  /** The source video when it came from the library rather than an upload. */
  videoUrl?: string;
  videos?: string[];
  /** The music prompt the workflow wrote. */
  prompt?: string;
  error?: string;
};

const DB = "asset-library-music";
const STORE = "generated";
export const HISTORY_EVENT = "asset-library-music-history";

function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function saveSounds(sounds: GeneratedSound[]) {
  for (const s of sounds) await run("readwrite", (store) => store.put(s));
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export async function deleteSound(id: string) {
  await run("readwrite", (store) => store.delete(id));
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export async function listSounds() {
  const all = await run<GeneratedSound[]>("readonly", (store) => store.getAll());
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSound(id: string) {
  return run<GeneratedSound | undefined>("readonly", (store) => store.get(id));
}
