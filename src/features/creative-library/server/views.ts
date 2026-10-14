import type { CreativeSummary } from "../CreativeLibrary";
import type { FavoriteView } from "../FavoritesPage";
import type { Creative, Db } from "../types";

export function toSummary(c: Creative): CreativeSummary {
  return {
    id: c.id,
    app: c.app,
    tags: c.tags,
    hook: c.hook,
    posterPath: c.posterPath,
    analysisStatus: c.analysis.status,
    iterationCount: c.iterations.length,
  };
}

/** Favorites joined with what they point at; a missing target stays visible as unavailable. */
export function resolveFavorites(db: Db): FavoriteView[] {
  return [...db.favorites]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((favorite) => {
      const creative = db.creatives.find((c) => c.id === favorite.creativeId);
      const iteration = creative?.iterations.find((it) => it.id === favorite.iterationId);
      const item = iteration && favorite.itemIndex != null ? (iteration.items[favorite.itemIndex] ?? null) : null;
      return {
        favorite,
        creative: creative ? toSummary(creative) : null,
        item,
        iterationCreatedAt: iteration?.createdAt ?? null,
      };
    });
}
