"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clapperboard, Heart, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { HAIR_APP, appName } from "./apps";
import { tabOf } from "./constants";
import { SCRIPT_GENERATOR_PATH } from "./Generators";
import { type GeneratedSound, getSound } from "./music-studio/history-store";
import { GeneratedSoundCard, TrendDownload, trendDemo, trendFavoriteId } from "./music-studio/MusicStudio";
import { TRENDING_SOUNDS } from "./music-studio/trends";
import { Chip, CreativeCard, DownloadButton, FavoriteButton, SampleFavoriteButton, TYPE_ICONS } from "./parts";
import { creativeHref } from "./paths";
import {
  EXAMPLE_ITERATION_BASE,
  anchorCategory,
  getCategory,
  getScriptExample,
  getTextIterations,
  isSampleAnchor,
  parseExampleIteration,
  sampleCategoryOf,
} from "./sample-data";
import { type SampleFavorite, type SampleFavoriteKind, useSampleFavorites } from "./sample-favorites";
import type { FavoriteType, FavoriteView, IterationType } from "./types";
import { useFavoritesContext } from "./useFavorites";
import { WaveformPlayer } from "./WaveformPlayer";

type IconType = React.ComponentType<{ className?: string }>;

const GROUPS: { id: string; label: string; icon: IconType; kinds: FavoriteType[] }[] = [
  {
    id: "all",
    label: "All",
    icon: LayoutGrid,
    kinds: ["creative", "wallText", "voiceover", "similarAvatar", "avatarVariation", "music", "template"],
  },
  { id: "creatives", label: "Creatives", icon: Clapperboard, kinds: ["creative"] },
  { id: "wall-text", label: "Wall Text", icon: TYPE_ICONS.wallText, kinds: ["wallText"] },
  { id: "voice-script", label: "Voice Script", icon: TYPE_ICONS.voiceover, kinds: ["voiceover"] },
  { id: "avatar", label: "Avatar", icon: TYPE_ICONS.similarAvatar, kinds: ["similarAvatar", "avatarVariation"] },
  { id: "music", label: "Music", icon: TYPE_ICONS.music, kinds: ["music"] },
  { id: "templates", label: "Templates", icon: TYPE_ICONS.template, kinds: ["template"] },
];

const SAMPLE_KINDS: Record<SampleFavoriteKind, IterationType> = {
  "wall-texts": "wallText",
  "voiceover-scripts": "voiceover",
  music: "music",
};

/** With a tag, only favorites from that tag's creatives show (studio sounds belong to none). */
export function Favorites({ views, app, tag, query = "" }: { views: FavoriteView[]; app: string; tag?: string; query?: string }) {
  const [groupId, setGroupId] = useState(GROUPS[0].id);
  const group = GROUPS.find((g) => g.id === groupId)!;
  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Favorite type" className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === groupId}
            onClick={() => setGroupId(g.id)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full border pr-4 pl-3 font-bomstad text-body transition-colors focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none",
              g.id === groupId
                ? "border-accent-border bg-accent-subtle text-accent-text"
                : "border-line bg-surface text-ink-2 hover:bg-muted hover:text-ink",
            )}
          >
            <g.icon className="size-3.5" />
            {g.label}
          </button>
        ))}
      </div>
      <FavoriteList views={views} app={app} tag={tag} query={query} kinds={group.kinds} />
    </div>
  );
}

type Entry = { key: string; at: string } & ({ view: FavoriteView } | { sample: SampleFavorite });

function FavoriteList({
  views,
  app,
  tag,
  query,
  kinds,
}: {
  views: FavoriteView[];
  app: string;
  tag?: string;
  query: string;
  kinds: FavoriteType[];
}) {
  const { favorites } = useFavoritesContext();
  const { favorites: samples } = useSampleFavorites();
  const q = query.trim().toLowerCase();
  // A favorite removed on this page stays hidden; the views list is the server snapshot.
  const live = new Set(favorites.map((f) => f.id));
  const tagCategory = sampleCategoryOf(tag);

  const server: Entry[] = views
    .filter(({ favorite, creative }) => {
      if (!live.has(favorite.id) || !kinds.includes(favorite.type) || !creative || creative.app !== app) return false;
      if (tag && !creative.tags.includes(tag)) return false;
      return !q || [creative.id, creative.hook, creative.fileName].some((v) => v.toLowerCase().includes(q));
    })
    .map((view) => ({ key: view.favorite.id, at: view.favorite.createdAt, view }));

  const sample: Entry[] =
    app === HAIR_APP
      ? samples
          .filter((f) => {
            if (!kinds.includes(SAMPLE_KINDS[f.kind])) return false;
            if (isStudioSound(f.creativeId)) return !tag && (!q || studioSoundText(f.creativeId).includes(q));
            if (!isSampleAnchor(f.creativeId)) return false;
            const category = anchorCategory(f.creativeId);
            if (tag && category !== tagCategory) return false;
            return !q || sampleText(f).toLowerCase().includes(q);
          })
          .map((f) => ({ key: f.key, at: f.savedAt, sample: f }))
      : [];

  const items = [...server, ...sample].sort((a, b) => b.at.localeCompare(a.at));

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong p-10 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-muted text-ink-3">
          <Heart className="size-5" />
        </span>
        <h3 className="text-body font-semibold text-ink">{q ? "No favorites match your search" : "No favorites yet"}</h3>
        <p className="text-body-sm text-ink-3">Tap the heart on a creative or an iteration to keep it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((entry) =>
        "view" in entry ? (
          entry.view.favorite.type === "creative" ? (
            <CreativeCard key={entry.key} creative={entry.view.creative!} />
          ) : (
            <IterationFavorite key={entry.key} view={entry.view} />
          )
        ) : isStudioSound(entry.sample.creativeId) ? (
          <StudioSoundFavorite key={entry.key} id={entry.sample.creativeId} />
        ) : (
          <SampleTextFavorite key={entry.key} favorite={entry.sample} />
        ),
      )}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function IterationFavorite({ view }: { view: FavoriteView }) {
  const { favorite, creative, item } = view;
  if (!creative || favorite.type === "creative") return null;
  const tab = tabOf(favorite.type);
  const label = `Iteration ${pad((favorite.itemIndex ?? 0) + 1)}${item?.title ? ` · ${item.title}` : ""}`;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip>{creative.tags[0] ?? appName(creative.app)}</Chip>
          <Chip>{tab.label}</Chip>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {item?.url ? <DownloadButton href={item.url} label="Download file" className="size-7" /> : null}
          <FavoriteButton target={favorite} className="size-7" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-overline text-ink-3 uppercase">{label}</span>
        {!item ? <p className="text-body-sm text-ink-3">The source is no longer available.</p> : null}
        {item?.url && item.mediaType === "image" ? (
          <div className="relative mt-1 aspect-[4/5] overflow-hidden rounded-sm bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover object-top" />
          </div>
        ) : null}
        {item?.url && item.mediaType === "video" ? (
          <video src={item.url} controls playsInline preload="metadata" className="mt-1 aspect-[4/5] w-full rounded-sm bg-muted object-cover" />
        ) : null}
        {item?.url && item.mediaType === "audio" ? <WaveformPlayer source={{ file: item.url }} label={item.title ?? label} /> : null}
        {item?.text ? <p className="line-clamp-5 font-prose text-body text-ink">{item.text}</p> : null}
      </div>
      <Link href={creativeHref(creative, favorite.type)} className="mt-auto text-body-sm text-accent-text hover:underline">
        Open source <span className="font-mono">{creative.id}</span> →
      </Link>
    </article>
  );
}

function sampleTextOf(f: SampleFavorite) {
  const category = anchorCategory(f.creativeId);
  if (!category || f.kind === "music") return undefined;
  if (f.iteration > EXAMPLE_ITERATION_BASE) {
    const { index, version } = parseExampleIteration(f.iteration);
    const ex = getScriptExample(category, f.kind, index, version);
    return { category, label: `Generator example · ${ex.theme}`, text: ex.text };
  }
  const it = getTextIterations(category, f.kind)[f.iteration - 1];
  return it ? { category, label: `Iteration ${pad(f.iteration)} · ${it.angle}`, text: it.text } : undefined;
}

const sampleText = (f: SampleFavorite) => sampleTextOf(f)?.text ?? "";

/** A Script Generator suggestion saved with a heart (sample content). */
function SampleTextFavorite({ favorite }: { favorite: SampleFavorite }) {
  const sample = sampleTextOf(favorite);
  if (!sample || favorite.kind === "music") return null;
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip>{getCategory(sample.category)?.name}</Chip>
          <Chip>{tabOf(SAMPLE_KINDS[favorite.kind]).label}</Chip>
        </div>
        <SampleFavoriteButton creativeId={favorite.creativeId} kind={favorite.kind} iteration={favorite.iteration} className="size-7" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-overline text-ink-3 uppercase">{sample.label}</span>
        <p className="line-clamp-5 font-prose text-body text-ink">{sample.text}</p>
      </div>
      <Link
        href={`${SCRIPT_GENERATOR_PATH}?category=${sample.category}&type=${favorite.kind}`}
        className="mt-auto text-body-sm text-accent-text hover:underline"
      >
        Open Script Generator →
      </Link>
    </article>
  );
}

// Music Generator sounds are saved with "trend:" / "gen:" ids instead of a creative id.
const isStudioSound = (id: string) => id.startsWith("trend:") || id.startsWith("gen:");

function studioSoundText(id: string) {
  const trend = TRENDING_SOUNDS.find((s) => trendFavoriteId(s.id) === id);
  return (trend ? `${trend.title} ${trend.artist}` : "generated variation").toLowerCase();
}

function StudioSoundFavorite({ id }: { id: string }) {
  const trend = TRENDING_SOUNDS.find((s) => trendFavoriteId(s.id) === id);
  const [generated, setGenerated] = useState<GeneratedSound | null | undefined>(undefined);

  useEffect(() => {
    if (trend) return;
    let alive = true;
    getSound(id.slice("gen:".length))
      .then((s) => alive && setGenerated(s ?? null))
      .catch(() => alive && setGenerated(null));
    return () => {
      alive = false;
    };
  }, [id, trend]);

  if (trend) {
    return (
      <article className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Chip>Trending sound</Chip>
            <Chip>#{trend.rank}</Chip>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <TrendDownload sound={trend} />
            <SampleFavoriteButton creativeId={id} kind="music" className="size-7" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-body font-semibold text-ink">{trend.title}</span>
          <span className="text-caption text-ink-3">{trend.artist}</span>
        </div>
        <WaveformPlayer source={trendDemo(trend)} label={trend.title} />
      </article>
    );
  }
  if (generated === undefined) return null;
  if (generated === null) {
    return (
      <article className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-2">
          <Chip>Generated variation</Chip>
          <SampleFavoriteButton creativeId={id} kind="music" className="size-7" />
        </div>
        <p className="text-body-sm text-ink-3">This variation is no longer stored in this browser.</p>
      </article>
    );
  }
  return <GeneratedSoundCard sound={generated} />;
}
