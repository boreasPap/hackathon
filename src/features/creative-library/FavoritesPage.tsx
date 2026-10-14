"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader, SearchInput, Select } from "@/components/design-system";
import { APPS, HAIR_APP, getApp } from "./apps";
import { Favorites } from "./Favorites";
import { Breadcrumbs, EmptyNote, Tabs } from "./parts";
import { HOME_PATH } from "./paths";
import { findTab, tagTabs } from "./TopCreatives";
import type { CreativeSummary, FavoriteView } from "./types";
import { FavoritesProvider } from "./useFavorites";

const ALL_TAB = "all";
// Hair App is the app with a library (and so favorites) for now.
const DEFAULT_APP = HAIR_APP;

/** Everything saved with a heart, split by category like the Home tabs. */
export function FavoritesPage({ views, creatives }: { views: FavoriteView[]; creatives: CreativeSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const app = getApp(params.get("app") ?? "") ?? getApp(DEFAULT_APP)!;
  const appCreatives = creatives.filter((c) => c.app === app.id);
  const hasLibrary = appCreatives.length > 0 || app.id === HAIR_APP;
  const tabs = tagTabs(appCreatives);
  const category = hasLibrary ? findTab(tabs, params.get("tab")?.toLowerCase() ?? "") : undefined;
  const tab = category?.value ?? ALL_TAB;

  const update = (key: string, next: string, fallback: string) => {
    const qs = new URLSearchParams(params);
    if (next === fallback) qs.delete(key);
    else qs.set(key, next);
    if (key === "app") qs.delete("tab");
    const q = qs.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return (
    <FavoritesProvider initial={views.map((v) => v.favorite)}>
      <div className="flex flex-col gap-8 font-sans">
        <div className="flex flex-col gap-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: HOME_PATH },
              { label: "Favorites" },
              { label: app.name, href: category ? `${pathname}?app=${app.id}` : undefined },
              ...(category ? [{ label: category.label }] : []),
            ]}
          />
          <PageHeader
            title="Favorites"
            description={`${app.name} creatives, texts, avatars, music and templates you saved with a heart.`}
            actions={
              <Select
                aria-label="App"
                value={app.id}
                onValueChange={(next) => update("app", next, DEFAULT_APP)}
                options={APPS.map((a) => ({ value: a.id, label: a.name }))}
              />
            }
          />
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line">
            <Tabs
              value={tab}
              onChange={(next) => update("tab", next, ALL_TAB)}
              options={[{ value: ALL_TAB, label: "All" }, ...(hasLibrary ? tabs : [])]}
            />
            <SearchInput
              aria-label="Search favorites"
              placeholder="Search favorites…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mb-2 w-full border border-line bg-surface sm:w-64"
            />
          </div>
          {hasLibrary ? (
            <Favorites views={views} app={app.id} tag={category?.label} query={query} />
          ) : (
            <EmptyNote>{app.name} has no favorites yet.</EmptyNote>
          )}
        </div>
      </div>
    </FavoritesProvider>
  );
}
