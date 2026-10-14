import { redirect } from "next/navigation";

// A category is a tab of the library's Home.
export default async function AssetLibraryCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  redirect(`/dashboard/creative/asset-library/home?app=hairapp&tab=${encodeURIComponent(category)}`);
}
