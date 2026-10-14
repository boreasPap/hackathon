import { connection } from "next/server";
import { Suspense } from "react";
import { readDb } from "@/features/creative-library/server/db";
import { toSummary } from "@/features/creative-library/server/views";
import { TopCreatives } from "@/features/creative-library/TopCreatives";

export default async function AssetLibraryHomePage() {
  await connection();
  const db = await readDb();
  return (
    <Suspense>
      <TopCreatives creatives={db.creatives.map(toSummary)} dbApps={db.apps} favorites={db.favorites} />
    </Suspense>
  );
}
