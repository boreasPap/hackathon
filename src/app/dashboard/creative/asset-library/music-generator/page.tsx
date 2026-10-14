import { connection } from "next/server";
import { MusicGeneratorPage } from "@/features/creative-library/MusicGeneratorPage";
import { readDb } from "@/features/creative-library/server/db";

export default async function AssetLibraryMusicGeneratorPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await connection();
  const { category } = await searchParams;
  const db = await readDb();
  const videos = db.creatives.map((c) => ({ id: c.id, videoPath: c.videoPath }));
  return <MusicGeneratorPage category={category} videos={videos} />;
}
