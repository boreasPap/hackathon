"use client";

import { createContext, useCallback, useContext, useState } from "react";
import toast from "react-hot-toast";
import { api, type FavoriteTarget, sameTarget } from "./client";
import type { Favorite } from "./types";

export function useFavorites(initial: Favorite[]) {
  const [favorites, setFavorites] = useState(initial);

  const isFavorite = useCallback((target: FavoriteTarget) => favorites.some((f) => sameTarget(f, target)), [favorites]);

  const add = useCallback(async (target: FavoriteTarget) => {
    const optimistic: Favorite = { ...target, id: `tmp_${Date.now()}_${Math.random()}`, createdAt: new Date().toISOString() };
    setFavorites((list) => [...list, optimistic]);
    try {
      const { favorite } = await api.addFavorite(target);
      setFavorites((list) => list.map((f) => (f.id === optimistic.id ? favorite : f)));
    } catch (error) {
      setFavorites((list) => list.filter((f) => f.id !== optimistic.id));
      toast.error(error instanceof Error ? error.message : "Could not save the favorite.");
    }
  }, []);

  const remove = useCallback(async (existing: Favorite) => {
    setFavorites((list) => list.filter((f) => f.id !== existing.id));
    try {
      await api.removeFavorite(existing.id);
    } catch (error) {
      setFavorites((list) => [...list, existing]);
      toast.error(error instanceof Error ? error.message : "Could not remove the favorite.");
    }
  }, []);

  /** Adds or removes the target; returns true when it was added. */
  const toggle = useCallback(
    (target: FavoriteTarget) => {
      const existing = favorites.find((f) => sameTarget(f, target));
      if (existing) void remove(existing);
      else void add(target);
      return !existing;
    },
    [favorites, add, remove],
  );

  /** Saves (or, with `saved: false`, removes) several favorites in one go. */
  const setMany = useCallback(
    (targets: FavoriteTarget[], saved: boolean) => {
      for (const target of targets) {
        const existing = favorites.find((f) => sameTarget(f, target));
        if (saved && !existing) void add(target);
        if (!saved && existing) void remove(existing);
      }
    },
    [favorites, add, remove],
  );

  return { favorites, isFavorite, toggle, setMany };
}

type FavoritesState = ReturnType<typeof useFavorites>;

const FavoritesContext = createContext<FavoritesState | null>(null);

/** Shares one favorites list with every heart on the page. */
export function FavoritesProvider({ initial, children }: { initial: Favorite[]; children: React.ReactNode }) {
  const value = useFavorites(initial);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavoritesContext(): FavoritesState {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error("useFavoritesContext needs a FavoritesProvider.");
  return value;
}
