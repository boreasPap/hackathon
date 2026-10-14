import { formatDate } from "@/lib/format";
import type { Creative, Favorite, FavoriteType } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

const base = "/api/creative-library";

export const api = {
  createCreative: async (form: FormData) => {
    // No JSON header: the browser sets the multipart boundary itself.
    const response = await fetch(`${base}/creatives`, { method: "POST", body: form });
    const data = (await response.json().catch(() => ({}))) as { creative?: Creative; error?: string };
    if (!response.ok || !data.creative) throw new Error(data.error || `Upload failed (${response.status})`);
    return data.creative;
  },
  analyze: (id: string) =>
    request<{ creative: Creative }>(`${base}/creatives/${encodeURIComponent(id)}/analyze`, { method: "POST" }),
  generate: (id: string, type: string, prompt: string) =>
    request<{ creative: Creative }>(`${base}/creatives/${encodeURIComponent(id)}/iterations`, {
      method: "POST",
      body: JSON.stringify({ type, prompt }),
    }),
  sync: (id: string) =>
    request<{ creative: Creative }>(`${base}/creatives/${encodeURIComponent(id)}/sync`, { method: "POST" }),
  addFavorite: (target: FavoriteTarget) =>
    request<{ favorite: Favorite }>(`${base}/favorites`, { method: "POST", body: JSON.stringify(target) }),
  removeFavorite: (id: string) =>
    request<{ ok: true }>(`${base}/favorites/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export type FavoriteTarget = {
  creativeId: string;
  type: FavoriteType;
  iterationId: string | null;
  itemIndex: number | null;
};

export function sameTarget(f: FavoriteTarget, t: FavoriteTarget): boolean {
  return f.creativeId === t.creativeId && f.type === t.type && f.iterationId === t.iterationId && f.itemIndex === t.itemIndex;
}

/** "14 Oct 2026, 09:05" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${formatDate(d)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, "-");
}
