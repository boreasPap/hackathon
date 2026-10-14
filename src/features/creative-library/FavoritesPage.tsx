"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader, Select } from "@/components/design-system";
import { formatDateTime } from "./client";
import { EmptyState, Panel, Tag } from "./components/bits";
import { ItemActions, ItemView } from "./components/IterationCard";
import { TYPE_LABELS } from "./constants";
import { CreativeCard, type CreativeSummary } from "./CreativeLibrary";
import type { Favorite, FavoriteType, IterationItem } from "./types";
import { useFavorites } from "./useFavorites";

export type FavoriteView = {
  favorite: Favorite;
  creative: CreativeSummary | null;
  item: IterationItem | null;
  iterationCreatedAt: string | null;
};

const TYPE_SLUGS: Record<FavoriteType, string> = {
  creative: "creatives",
  wallText: "wall-texts",
  voiceover: "voiceover",
  similarAvatar: "similar-avatars",
  avatarVariation: "avatar-variations",
  music: "music",
  template: "templates",
};

export function FavoritesPage({ views }: { views: FavoriteView[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { favorites, isFavorite, toggle } = useFavorites(views.map((v) => v.favorite));

  const typeParam = searchParams.get("type")?.toLowerCase();
  const type = (Object.keys(TYPE_SLUGS) as FavoriteType[]).find((t) => TYPE_SLUGS[t] === typeParam) ?? "all";

  // A favorite removed on this page stays hidden; the views list is the server snapshot.
  const live = new Set(favorites.map((f) => f.id));
  const shown = views.filter((v) => live.has(v.favorite.id) && (type === "all" || v.favorite.type === type));

  const setType = (value: string) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (value === "all") qs.delete("type");
    else qs.set("type", TYPE_SLUGS[value as FavoriteType]);
    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const counts = views.reduce<Record<string, number>>((acc, v) => {
    if (live.has(v.favorite.id)) acc[v.favorite.type] = (acc[v.favorite.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 font-sans">
      <PageHeader
        title="Favorites"
        description="Creatives and iterations you saved, with a link back to their source."
        filters={
          <Select
            aria-label="Type"
            value={type}
            onValueChange={setType}
            options={[
              { value: "all", label: `All (${live.size})` },
              ...(Object.keys(TYPE_LABELS) as FavoriteType[]).map((t) => ({
                value: t,
                label: `${TYPE_LABELS[t]} (${counts[t] ?? 0})`,
              })),
            ]}
          />
        }
      />

      {shown.length ? (
        <div className="@container">
          <div className="grid grid-cols-1 gap-4 @min-[640px]:grid-cols-2 @min-[1100px]:grid-cols-3">
            {shown.map(({ favorite, creative, item, iterationCreatedAt }) => {
              if (favorite.type === "creative" && creative) {
                return (
                  <CreativeCard
                    key={favorite.id}
                    creative={creative}
                    favorite={isFavorite(favorite)}
                    onToggleFavorite={() => toggle(favorite)}
                  />
                );
              }
              return (
                <Panel key={favorite.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Tag>{TYPE_LABELS[favorite.type]}</Tag>
                    {iterationCreatedAt ? (
                      <span className="text-caption text-ink-3">{formatDateTime(iterationCreatedAt)}</span>
                    ) : null}
                  </div>
                  {item ? (
                    <div className="flex gap-3">
                      <ItemView item={item} />
                      <ItemActions item={item} favorite={isFavorite(favorite)} onToggleFavorite={() => toggle(favorite)} />
                    </div>
                  ) : (
                    <p className="text-body-sm text-ink-3">The source is no longer available.</p>
                  )}
                  {creative ? (
                    <Link
                      href={`/dashboard/creative-library/${encodeURIComponent(creative.id)}?tab=${TYPE_SLUGS[favorite.type]}`}
                      className="mt-auto text-body-sm text-accent-text hover:underline"
                    >
                      Open source {creative.id}
                    </Link>
                  ) : null}
                </Panel>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState title="Nothing saved yet">
          Save a creative or a generated iteration with the heart button and it shows up here.
        </EmptyState>
      )}
    </div>
  );
}
