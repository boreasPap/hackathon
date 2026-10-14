import { tagSlug } from "./client";
import { ITERATION_TABS } from "./constants";
import type { IterationType } from "./types";

// Addresses of the library's pages. Kept out of the client components so
// server pages (redirects, the detail page) can use them too.

export const BASE_PATH = "/dashboard/creative/asset-library";
/** The library's two pages in the menu: Home (apps and their creatives) and Favorites. */
export const HOME_PATH = `${BASE_PATH}/home`;
export const FAVORITES_PATH = `${BASE_PATH}/favorites`;
export const appHref = (app: string) => `${HOME_PATH}?app=${app}`;
export const categoryHref = (app: string, category: string) => `${appHref(app)}&tab=${category}`;
export const detailHref = (category: string, type: string, creativeId: string) =>
  `${BASE_PATH}/${category}/${type}/${encodeURIComponent(creativeId)}`;

/** A creative's category is its first tag; creatives without one sit under "all". */
export const NO_CATEGORY = "all";
export const categoryOf = (creative: { tags: string[] }) => (creative.tags[0] ? tagSlug(creative.tags[0]) : NO_CATEGORY);
export const creativeHref = (creative: { id: string; tags: string[] }, type: IterationType = "wallText") =>
  detailHref(categoryOf(creative), ITERATION_TABS.find((t) => t.type === type)!.slug, creative.id);
export const creativeLabel = (id: string) => id.replaceAll("_", " · ");

// Newest first: V869 before V868, a version before its base (V856 · vers1, V856).
function codeParts(id: string) {
  const m = id.match(/^V(\d+)(?:_v(?:ers)?(\d+))?/i);
  return [Number(m?.[1] ?? 0), m?.[2] ? Number(m[2]) : 0];
}

export function sortByCodeDesc<T extends { id: string }>(creatives: T[]) {
  return [...creatives].sort((x, y) => {
    const [xn, xv] = codeParts(x.id);
    const [yn, yv] = codeParts(y.id);
    return yn - xn || yv - xv;
  });
}
