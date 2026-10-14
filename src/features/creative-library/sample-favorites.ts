"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
// Favorites of the sample parts (Script Generator examples, Music Generator
// sounds) are kept per browser: the server stores favorites of real iterations only.

export type SampleFavoriteKind = "wall-texts" | "voiceover-scripts" | "music";
export type SampleFavorite = { key: string; creativeId: string; kind: SampleFavoriteKind; iteration: number; savedAt: string };

const STORAGE_KEY = "asset-library-favorites";
const CHANGE_EVENT = "asset-library-favorites-change";

export const sampleFavoriteKey = (creativeId: string, kind: SampleFavoriteKind, iteration = 0) => `${creativeId}|${kind}|${iteration}`;

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function parse(raw: string): SampleFavorite[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as SampleFavorite[]) : [];
  } catch {
    return [];
  }
}

export function useSampleFavorites() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const favorites = useMemo(() => parse(raw), [raw]);

  const isSaved = useCallback((key: string) => favorites.some((f) => f.key === key), [favorites]);

  const toggle = useCallback(
    (creativeId: string, kind: SampleFavoriteKind, iteration = 0) => {
      const key = sampleFavoriteKey(creativeId, kind, iteration);
      const next = favorites.some((f) => f.key === key)
        ? favorites.filter((f) => f.key !== key)
        : [...favorites, { key, creativeId, kind, iteration, savedAt: new Date().toISOString() }];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        return false;
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return !favorites.some((f) => f.key === key);
    },
    [favorites],
  );

  /** Saves (or, with `saved: false`, removes) several favorites in one go. */
  const setMany = useCallback(
    (items: { creativeId: string; kind: SampleFavoriteKind; iteration: number }[], saved: boolean) => {
      const keys = new Set(items.map((i) => sampleFavoriteKey(i.creativeId, i.kind, i.iteration)));
      const kept = favorites.filter((f) => !keys.has(f.key));
      const now = new Date().toISOString();
      const next = saved
        ? [...kept, ...items.map((i) => ({ ...i, key: sampleFavoriteKey(i.creativeId, i.kind, i.iteration), savedAt: now }))]
        : kept;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        return false;
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
      return true;
    },
    [favorites],
  );

  return { favorites, isSaved, toggle, setMany };
}
