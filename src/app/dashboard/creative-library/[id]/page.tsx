import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CreativeDetail } from "@/features/creative-library/CreativeDetail";
import { readDb } from "@/features/creative-library/server/db";

export default async function CreativePage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const db = await readDb();
  const creative = db.creatives.find((c) => c.id.toLowerCase() === decodeURIComponent(id).toLowerCase());
  if (!creative) notFound();
  return (
    <Suspense>
      <CreativeDetail
        key={creative.id}
        initialCreative={creative}
        favorites={db.favorites.filter((f) => f.creativeId === creative.id)}
      />
    </Suspense>
  );
}
