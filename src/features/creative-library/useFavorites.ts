"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { api, type FavoriteTarget, sameTarget } from "./client";
import type { Favorite } from "./types";

export function useFavorites(initial: Favorite[]) {
  const [favorites, setFavorites] = useState(initial);

  const isFavorite = useCallback((target: FavoriteTarget) => favorites.some((f) => sameTarget(f, target)), [favorites]);

  const toggle = useCallback(
    async (target: FavoriteTarget) => {
      const existing = favorites.find((f) => sameTarget(f, target));
      if (existing) {
        setFavorites((list) => list.filter((f) => f.id !== existing.id));
        try {
          await api.removeFavorite(existing.id);
        } catch (error) {
          setFavorites((list) => [...list, existing]);
          toast.error(error instanceof Error ? error.message : "Could not remove the favorite.");
        }
        return;
      }
      const optimistic: Favorite = { ...target, id: `tmp_${Date.now()}`, createdAt: new Date().toISOString() };
      setFavorites((list) => [...list, optimistic]);
      try {
        const { favorite } = await api.addFavorite(target);
        setFavorites((list) => list.map((f) => (f.id === optimistic.id ? favorite : f)));
      } catch (error) {
        setFavorites((list) => list.filter((f) => f.id !== optimistic.id));
        toast.error(error instanceof Error ? error.message : "Could not save the favorite.");
      }
    },
    [favorites],
  );

  return { favorites, isFavorite, toggle };
}
