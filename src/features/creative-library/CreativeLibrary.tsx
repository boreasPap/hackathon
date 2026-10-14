"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader, SegmentedControl, Select } from "@/components/design-system";
import { tagSlug } from "./client";
import { AddCreativeDialog } from "./components/AddCreativeDialog";
import { EmptyState, FavoriteButton, StatusBadge, Tag } from "./components/bits";
import type { App, Favorite, JobStatus } from "./types";
import { useFavorites } from "./useFavorites";

export type CreativeSummary = {
  id: string;
  app: string;
  tags: string[];
  hook: string;
  posterPath: string | null;
  analysisStatus: JobStatus;
  iterationCount: number;
};

export const ANALYSIS_LABELS = { idle: "Not analyzed", running: "Analyzing", completed: "Analyzed", failed: "Analysis failed" };

export function CreativeLibrary({
  apps,
  creatives,
  favorites: initialFavorites,
}: {
  apps: App[];
  creatives: CreativeSummary[];
  favorites: Favorite[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isFavorite, toggle } = useFavorites(initialFavorites);

  const defaultApp = apps[0]?.id ?? "";
  const appParam = searchParams.get("app")?.toLowerCase();
  const app = apps.find((a) => a.id.toLowerCase() === appParam)?.id ?? defaultApp;

  const appCreatives = creatives.filter((c) => c.app === app);
  const tags = [...new Set(appCreatives.flatMap((c) => c.tags))];
  const tagParam = searchParams.get("tag")?.toLowerCase();
  const tag = tags.find((t) => tagSlug(t) === tagParam) ?? null;
  const shown = tag ? appCreatives.filter((c) => c.tags.includes(tag)) : appCreatives;

  const setParams = (next: { app?: string; tag?: string | null }) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (next.app !== undefined) {
      if (next.app === defaultApp) qs.delete("app");
      else qs.set("app", next.app);
      qs.delete("tag");
    }
    if (next.tag !== undefined) {
      if (next.tag) qs.set("tag", tagSlug(next.tag));
      else qs.delete("tag");
    }
    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Creative Library"
        description="Top performing creatives. Open one to analyze it and generate iterations."
        actions={<AddCreativeDialog apps={apps} defaultApp={app} />}
        filters={
          <>
            {apps.length > 1 ? (
              <Select
                aria-label="App"
                value={app}
                onValueChange={(value) => setParams({ app: value })}
                options={apps.map((a) => ({ value: a.id, label: a.name }))}
              />
            ) : (
              <span className="inline-flex h-8 items-center rounded-sm border border-line px-3 text-body text-ink-2">
                {apps[0]?.name ?? "No app"}
              </span>
            )}
            {tags.length > 1 ? (
              <>
                <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
                <SegmentedControl
                  aria-label="Tag"
                  value={tag ?? "all"}
                  onValueChange={(value) => setParams({ tag: value === "all" ? null : value })}
                  options={[{ value: "all", label: "All" }, ...tags.map((t) => ({ value: t, label: t }))]}
                />
              </>
            ) : null}
          </>
        }
      />

      {shown.length ? (
        <div className="@container">
          <div className="grid grid-cols-1 gap-4 @min-[420px]:grid-cols-2 @min-[760px]:grid-cols-3 @min-[1100px]:grid-cols-4 @min-[1400px]:grid-cols-5">
            {shown.map((c) => (
              <CreativeCard
                key={c.id}
                creative={c}
                favorite={isFavorite({ creativeId: c.id, type: "creative", iterationId: null, itemIndex: null })}
                onToggleFavorite={() => toggle({ creativeId: c.id, type: "creative", iterationId: null, itemIndex: null })}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title="No creatives yet">
          Add a creative to upload its video to eachlabs storage.
        </EmptyState>
      )}
    </div>
  );
}

export function CreativeCard({
  creative,
  favorite,
  onToggleFavorite,
}: {
  creative: CreativeSummary;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-sm">
      <Link
        href={`/dashboard/creative-library/${encodeURIComponent(creative.id)}`}
        className="flex flex-1 flex-col rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent-border"
      >
        <div className="aspect-[4/5] bg-muted">
          {creative.posterPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={creative.posterPath} alt="" loading="lazy" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-body font-semibold text-ink">{creative.id}</span>
            <StatusBadge status={creative.analysisStatus} labels={ANALYSIS_LABELS} />
          </div>
          <p className="line-clamp-2 min-h-9 text-body-sm text-ink-3">{creative.hook}</p>
          <div className="mt-auto flex flex-wrap items-center gap-1.5">
            {creative.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
            {creative.iterationCount ? (
              <span className="text-caption text-ink-3">
                <span className="font-num tabular-nums">{creative.iterationCount}</span> iterations
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <FavoriteButton
        on={favorite}
        onToggle={onToggleFavorite}
        label={creative.id}
        className="absolute top-2 right-2 bg-surface hover:bg-surface"
      />
    </div>
  );
}
