import { connection } from "next/server";
import { Suspense } from "react";
import { FavoritesPage } from "@/features/creative-library/FavoritesPage";
import { readDb } from "@/features/creative-library/server/db";
import { resolveFavorites } from "@/features/creative-library/server/views";

export default async function CreativeFavoritesPage() {
  await connection();
  return (
    <Suspense>
      <FavoritesPage views={resolveFavorites(await readDb())} />
    </Suspense>
  );
}
