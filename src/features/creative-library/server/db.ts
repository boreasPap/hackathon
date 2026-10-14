import { promises as fs } from "node:fs";
import path from "node:path";
import type { Creative, Db } from "../types";
import { HttpError } from "./http";

// A local JSON file stands in for the document database in this POC. Every
// write goes through one queue and lands via a temp file + rename, so two
// requests never interleave and a crash never leaves half a file behind.

const DB_PATH = path.join(process.cwd(), "src/features/creative-library/data/db.json");

const globalQueue = globalThis as unknown as { __creativeLibraryDbQueue?: Promise<unknown> };

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const previous = globalQueue.__creativeLibraryDbQueue ?? Promise.resolve();
  const next = previous.then(task, task);
  globalQueue.__creativeLibraryDbQueue = next.catch(() => undefined);
  return next;
}

async function load(): Promise<Db> {
  const raw = await fs.readFile(DB_PATH, "utf8");
  const db = JSON.parse(raw) as Partial<Db>;
  return { apps: db.apps ?? [], creatives: db.creatives ?? [], favorites: db.favorites ?? [] };
}

async function save(db: Db): Promise<void> {
  const tmp = `${DB_PATH}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2) + "\n", "utf8");
  await fs.rename(tmp, DB_PATH);
}

export function readDb(): Promise<Db> {
  return enqueue(load);
}

/** Runs `mutate` on a fresh copy of the database and saves it afterwards. */
export function updateDb<T>(mutate: (db: Db) => T | Promise<T>): Promise<T> {
  return enqueue(async () => {
    const db = await load();
    const result = await mutate(db);
    await save(db);
    return result;
  });
}

export function findCreative(db: Db, id: string): Creative {
  const creative = db.creatives.find((c) => c.id.toLowerCase() === id.toLowerCase());
  if (!creative) throw new HttpError(404, `Creative ${id} was not found.`);
  return creative;
}

export async function getCreative(id: string): Promise<Creative> {
  return findCreative(await readDb(), id);
}
