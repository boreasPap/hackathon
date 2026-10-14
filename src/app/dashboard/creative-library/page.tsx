import { connection } from "next/server";
import { Suspense } from "react";
import { CreativeLibrary } from "@/features/creative-library/CreativeLibrary";
import { readDb } from "@/features/creative-library/server/db";
import { toSummary } from "@/features/creative-library/server/views";

export default async function CreativeLibraryPage() {
  await connection();
  const db = await readDb();
  return (
    <Suspense>
      <CreativeLibrary apps={db.apps} creatives={db.creatives.map(toSummary)} favorites={db.favorites} />
    </Suspense>
  );
}
