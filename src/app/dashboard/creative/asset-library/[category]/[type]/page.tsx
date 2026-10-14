import { redirect } from "next/navigation";

// The category × asset type list was folded into the Asset Library tabs.
export default async function AssetLibraryTypePage({ params }: { params: Promise<{ category: string; type: string }> }) {
  const { category } = await params;
  redirect(`/dashboard/creative/asset-library/home?app=hairapp&tab=${encodeURIComponent(category)}`);
}
