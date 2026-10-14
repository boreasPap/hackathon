import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { tabBySlug } from "@/features/creative-library/constants";
import { CreativeDetail } from "@/features/creative-library/CreativeDetail";
import { categoryOf, detailHref, sortByCodeDesc } from "@/features/creative-library/paths";
import { readDb } from "@/features/creative-library/server/db";
import { toSummary } from "@/features/creative-library/server/views";

export default async function AssetLibraryCreativePage({
  params,
}: {
  params: Promise<{ category: string; type: string; creativeId: string }>;
}) {
  await connection();
  const { category, type, creativeId } = await params;
  const db = await readDb();
  const id = decodeURIComponent(creativeId).toLowerCase();
  const creative = db.creatives.find((c) => c.id.toLowerCase() === id);
  const tab = tabBySlug(type);
  if (!creative || !tab) notFound();
  if (categoryOf(creative) !== category || creative.id !== decodeURIComponent(creativeId)) {
    redirect(detailHref(categoryOf(creative), tab.slug, creative.id));
  }
  const siblings = sortByCodeDesc(
    db.creatives.filter((c) => c.app === creative.app && categoryOf(c) === categoryOf(creative)).map(toSummary),
  );
  return (
    <Suspense>
      <CreativeDetail
        key={creative.id}
        initialCreative={creative}
        favorites={db.favorites.filter((f) => f.creativeId === creative.id)}
        siblings={siblings}
        type={tab.type}
      />
    </Suspense>
  );
}
