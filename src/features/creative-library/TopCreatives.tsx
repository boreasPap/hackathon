"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Clapperboard, Trophy } from "lucide-react";
import { PageHeader, SearchInput, Select } from "@/components/design-system";
import { formatDateRange } from "@/lib/format";
import { AllAppsHome } from "./AllAppsHome";
import { ALL_APPS, APPS, DEFAULT_APP, TOP_CREATIVE_SLOTS, getApp } from "./apps";
import { CategoryInsights } from "./CategoryInsights";
import { CreativeCarousel } from "./CategorySections";
import { tagSlug } from "./client";
import { AddCreativeDialog } from "./components/AddCreativeDialog";
import { Generators } from "./Generators";
import { Breadcrumbs, EmptyNote, SectionTitle, Tabs, CreativeCard } from "./parts";
import { FAVORITES_PATH, HOME_PATH, sortByCodeDesc } from "./paths";
import { type CategoryId, sampleCategoryOf } from "./sample-data";
import type { App, CreativeSummary, Favorite } from "./types";
import { FavoritesProvider } from "./useFavorites";

const ALL_TAB = "all";
// The last full week (Monday to Sunday) the ranking covers.
const WEEK = { from: "2026-10-05", to: "2026-10-11" };

/** The tags of a set of creatives, as tabs: slug and label. */
export function tagTabs(creatives: CreativeSummary[]) {
  const tags = [...new Set(creatives.flatMap((c) => c.tags))];
  return tags.map((t) => ({ value: tagSlug(t), label: t }));
}

/** A tab from the URL: a tag's slug, or the sample category it stands for. */
export function findTab(tabs: { value: string; label: string }[], param: string) {
  return tabs.find((t) => t.value === param) ?? tabs.find((t) => sampleCategoryOf(t.label) && sampleCategoryOf(t.label) === sampleCategoryOf(param));
}

export function TopCreatives({
  creatives,
  dbApps,
  favorites,
}: {
  creatives: CreativeSummary[];
  /** The apps a new creative can be added to. */
  dbApps: App[];
  favorites: Favorite[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const appParam = params.get("app");
  const app = appParam === ALL_APPS ? ALL_APPS : (getApp(appParam ?? "")?.id ?? DEFAULT_APP);
  const appName = app === ALL_APPS ? "All Apps" : getApp(app)?.name;
  const appCreatives = creatives.filter((c) => c.app === app);
  const hasLibrary = appCreatives.length > 0;
  const tabParam = params.get("tab")?.toLowerCase() ?? "";
  const tabs = tagTabs(appCreatives);
  const activeTab = hasLibrary ? findTab(tabs, tabParam) : undefined;
  const tab = activeTab?.value ?? ALL_TAB;

  // Favorites has its own page now; older links that asked for it here go there.
  const legacyFavorites = params.get("fav") === "1" || tabParam === "favorites";
  useEffect(() => {
    if (legacyFavorites) router.replace(FAVORITES_PATH);
  }, [legacyFavorites, router]);

  const appHref = `${HOME_PATH}?app=${app}`;
  const categoryName = activeTab?.label;
  const trail = categoryName ? [categoryName] : [];
  const crumbs: { label: string; href?: string }[] =
    app === ALL_APPS
      ? [{ label: "Home" }]
      : [
          { label: "Home", href: HOME_PATH },
          { label: appName ?? "", href: trail.length ? appHref : undefined },
          ...trail.map((label) => ({ label })),
        ];

  const update = (key: string, value: string, fallback: string) => {
    const qs = new URLSearchParams(params);
    if (value === fallback) qs.delete(key);
    else qs.set(key, value);
    if (key === "app") qs.delete("tab");
    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <FavoritesProvider initial={favorites}>
      <div className="flex flex-col gap-8 font-sans">
        <div className="flex flex-col gap-3">
          <Breadcrumbs items={crumbs} />
          <PageHeader
            title={app === ALL_APPS ? "Asset Library" : (appName ?? "Asset Library")}
            description={
              app === ALL_APPS
                ? "Explore your best creatives and reuse their assets."
                : `Explore ${appName}'s best creatives and reuse their assets.`
            }
            actions={
              <>
                <Select
                  aria-label="App"
                  value={app === ALL_APPS ? "" : app}
                  placeholder="Choose App"
                  onValueChange={(next) => update("app", next, DEFAULT_APP)}
                  options={[{ value: ALL_APPS, label: "Home" }, ...APPS.map((a) => ({ value: a.id, label: a.name }))]}
                />
                {app !== ALL_APPS && dbApps.some((a) => a.id === app) ? <AddCreativeDialog apps={dbApps} defaultApp={app} /> : null}
              </>
            }
          />
        </div>

        {app === ALL_APPS ? (
          <AllAppsHome onSelectApp={(next) => update("app", next, DEFAULT_APP)} />
        ) : (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 text-page-desc font-semibold text-ink">
                <Trophy className="size-5 text-warning" />
                Top Creatives
              </h2>
              <p className="text-body-sm text-ink-3">
                This week&apos;s top {TOP_CREATIVE_SLOTS} creatives · {formatDateRange(WEEK.from, WEEK.to)}
              </p>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line">
                <Tabs
                  value={tab}
                  onChange={(next) => update("tab", next, ALL_TAB)}
                  options={[{ value: ALL_TAB, label: "All" }, ...(hasLibrary ? tabs : [])]}
                />
                <SearchInput
                  aria-label="Search creatives"
                  placeholder="Search creatives…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mb-2 w-full border border-line bg-surface sm:w-64"
                />
              </div>
              {tab === ALL_TAB || !activeTab ? (
                hasLibrary ? (
                  <AllCreatives creatives={appCreatives} appName={appName ?? ""} query={query} />
                ) : (
                  <EmptyNote>{appName} has no creatives in the library yet.</EmptyNote>
                )
              ) : (
                <CategoryView creatives={appCreatives} tag={activeTab.label} query={query} />
              )}
            </div>
          </section>
        )}
      </div>
    </FavoritesProvider>
  );
}

export function matches(creative: CreativeSummary, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [creative.id, creative.hook, creative.fileName, ...creative.tags].some((v) => v.toLowerCase().includes(q));
}

function NoResults({ query }: { query: string }) {
  return (
    <p className="rounded-xl border border-line bg-surface p-6 text-body-sm text-ink-3">
      No creatives match &ldquo;{query.trim()}&rdquo;.
    </p>
  );
}

function AllCreatives({ creatives: all, appName, query }: { creatives: CreativeSummary[]; appName: string; query: string }) {
  const creatives = sortByCodeDesc(all.filter((c) => matches(c, query)));
  if (!creatives.length) return <NoResults query={query} />;
  const categories = [
    ...new Set(creatives.flatMap((c) => c.tags.map(sampleCategoryOf)).filter((c): c is CategoryId => !!c)),
  ];
  return (
    <div className="flex flex-col gap-8">
      <CreativeCarousel
        title={`All ${appName} creatives · ${creatives.length}`}
        description="Every category, newest first. Pick a category tab to narrow it down."
        creatives={creatives}
      />
      <Generators categories={categories} />
    </div>
  );
}

function CategoryView({ creatives: all, tag, query }: { creatives: CreativeSummary[]; tag: string; query: string }) {
  const creatives = sortByCodeDesc(all.filter((c) => c.tags.includes(tag) && matches(c, query)));
  if (!creatives.length) return <NoResults query={query} />;
  const sample = sampleCategoryOf(tag);

  return (
    <div className="flex flex-col gap-8">
      {sample ? <CategoryInsights categoryId={sample} name={tag} /> : null}
      <section className="flex flex-col gap-3">
        <SectionTitle
          icon={Clapperboard}
          title={`Top ${creatives.length} Performing Creatives · ${tag}`}
          description="Newest first. Dashboard ranking is not connected."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {creatives.map((creative) => (
            <CreativeCard key={creative.id} creative={creative} />
          ))}
        </div>
      </section>
    </div>
  );
}
