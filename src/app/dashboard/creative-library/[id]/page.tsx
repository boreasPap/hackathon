import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { tabBySlug } from "@/features/creative-library/constants";
import { creativeHref } from "@/features/creative-library/paths";
import { readDb } from "@/features/creative-library/server/db";

// The library moved under Creative › Asset Library; old links keep working.
export default async function CreativePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  const { id } = await params;
  const { tab } = await searchParams;
  const db = await readDb();
  const creative = db.creatives.find((c) => c.id.toLowerCase() === decodeURIComponent(id).toLowerCase());
  if (!creative) notFound();
  redirect(creativeHref(creative, tabBySlug(tab === "voiceover" ? "voiceover-scripts" : (tab ?? null))?.type));
}
