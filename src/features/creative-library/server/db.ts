import { promises as fs } from "node:fs";
import path from "node:path";
import type { Creative, Db } from "../types";
import { HttpError } from "./http";

// Where the database lives depends on where the app runs:
// - Redis (Upstash, e.g. through the Vercel integration) when its REST env vars
//   are set. This is the one that works on Vercel, where the disk is read-only.
// - Otherwise the local JSON file in data/db.json. Every write goes through one
//   queue and lands via a temp file + rename, so two requests never interleave
//   and a crash never leaves half a file behind.
// On Vercel without Redis, the file is copied to /tmp and written there; that
// copy is per instance and disappears on a cold start, so it is only a stopgap.

const SEED_PATH = path.join(process.cwd(), "src/features/creative-library/data/db.json");
const TMP_PATH = "/tmp/creative-library-db.json";
const REDIS_KEY = "creative-library:db";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const READ_ONLY_DISK = Boolean(process.env.VERCEL);

const globalQueue = globalThis as unknown as { __creativeLibraryDbQueue?: Promise<unknown> };

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const previous = globalQueue.__creativeLibraryDbQueue ?? Promise.resolve();
  const next = previous.then(task, task);
  globalQueue.__creativeLibraryDbQueue = next.catch(() => undefined);
  return next;
}

function parse(raw: string): Db {
  const db = JSON.parse(raw) as Partial<Db>;
  return { apps: db.apps ?? [], creatives: db.creatives ?? [], favorites: db.favorites ?? [] };
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as { result?: unknown; error?: string } | null;
  if (!res.ok || !body || body.error) {
    throw new Error(`Redis ${command[0]} failed (${res.status}): ${body?.error ?? "no response"}`);
  }
  return body.result;
}

async function load(): Promise<Db> {
  if (REDIS_URL && REDIS_TOKEN) {
    const stored = await redis(["GET", REDIS_KEY]);
    if (typeof stored === "string") return parse(stored);
    const seed = await fs.readFile(SEED_PATH, "utf8");
    await redis(["SET", REDIS_KEY, seed, "NX"]);
    return parse(seed);
  }
  if (READ_ONLY_DISK) {
    const raw = await fs.readFile(TMP_PATH, "utf8").catch(() => fs.readFile(SEED_PATH, "utf8"));
    return parse(raw);
  }
  return parse(await fs.readFile(SEED_PATH, "utf8"));
}

async function save(db: Db): Promise<void> {
  const raw = JSON.stringify(db, null, 2) + "\n";
  if (REDIS_URL && REDIS_TOKEN) {
    await redis(["SET", REDIS_KEY, raw]);
    return;
  }
  const target = READ_ONLY_DISK ? TMP_PATH : SEED_PATH;
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, raw, "utf8");
  await fs.rename(tmp, target);
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
