import { ITERATION_TYPES, type Favorite, type FavoriteType } from "../types";
import { findCreative, readDb, updateDb } from "./db";
import { HttpError, newId } from "./http";

export type FavoriteInput = {
  creativeId: string;
  type: FavoriteType;
  iterationId?: string | null;
  itemIndex?: number | null;
};

export function parseFavoriteInput(body: unknown): FavoriteInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const type = b.type as FavoriteType;
  if (typeof b.creativeId !== "string" || !b.creativeId) throw new HttpError(400, "creativeId is required.");
  if (type !== "creative" && !ITERATION_TYPES.includes(type)) throw new HttpError(400, "type is not valid.");
  if (type !== "creative" && (typeof b.iterationId !== "string" || typeof b.itemIndex !== "number")) {
    throw new HttpError(400, "iterationId and itemIndex are required for an iteration favorite.");
  }
  return {
    creativeId: b.creativeId,
    type,
    iterationId: type === "creative" ? null : (b.iterationId as string),
    itemIndex: type === "creative" ? null : (b.itemIndex as number),
  };
}

export async function listFavorites(): Promise<Favorite[]> {
  return (await readDb()).favorites;
}

/** Adds a favorite; adding the same thing twice returns the existing one. */
export function addFavorite(input: FavoriteInput): Promise<Favorite> {
  return updateDb((db) => {
    const creative = findCreative(db, input.creativeId);
    if (input.type !== "creative") {
      const it = creative.iterations.find((x) => x.id === input.iterationId);
      if (!it || !it.items[input.itemIndex ?? -1]) throw new HttpError(404, "That iteration result was not found.");
    }
    const existing = db.favorites.find(
      (f) =>
        f.creativeId === creative.id &&
        f.type === input.type &&
        f.iterationId === (input.iterationId ?? null) &&
        f.itemIndex === (input.itemIndex ?? null),
    );
    if (existing) return existing;

    const favorite: Favorite = {
      id: newId("fav"),
      creativeId: creative.id,
      type: input.type,
      iterationId: input.iterationId ?? null,
      itemIndex: input.itemIndex ?? null,
      createdAt: new Date().toISOString(),
    };
    db.favorites.push(favorite);
    return favorite;
  });
}

export function removeFavorite(id: string): Promise<void> {
  return updateDb((db) => {
    const index = db.favorites.findIndex((f) => f.id === id);
    if (index < 0) throw new HttpError(404, "Favorite not found.");
    db.favorites.splice(index, 1);
  });
}
