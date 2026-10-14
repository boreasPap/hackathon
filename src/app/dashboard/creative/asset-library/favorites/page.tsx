import { connection } from "next/server";
import { Suspense } from "react";
import { FavoritesPage } from "@/features/creative-library/FavoritesPage";
import { readDb } from "@/features/creative-library/server/db";
import { resolveFavorites, toSummary } from "@/features/creative-library/server/views";

export default async function AssetLibraryFavoritesPage() {
  await connection();
  const db = await readDb();
  return (
    <Suspense>
      <FavoritesPage views={resolveFavorites(db)} creatives={db.creatives.map(toSummary)} />
    </Suspense>
  );
}
