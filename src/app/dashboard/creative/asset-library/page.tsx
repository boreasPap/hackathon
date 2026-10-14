import { redirect } from "next/navigation";
// Plain string: the feature path helpers live in a client module.
const HOME_PATH = "/dashboard/creative/asset-library/home";

// The library opens on Home; links to this address keep their app and tab.
export default async function AssetLibraryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of Array.isArray(value) ? value : [value]) qs.append(key, v);
  }
  const query = qs.toString();
  redirect(query ? `${HOME_PATH}?${query}` : HOME_PATH);
}
