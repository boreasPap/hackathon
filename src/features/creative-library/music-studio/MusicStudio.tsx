"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Loader2, Minus, Plus, Trash2, Video, Wand2 } from "lucide-react";
import { Button, IconButton } from "@/components/design-system";
import { formatCompact, formatDate, formatDateRange } from "@/lib/format";
import { cn } from "@/lib/utils";
import { DownloadButton, SampleFavoriteButton } from "../parts";
import { WaveformPlayer } from "../WaveformPlayer";
import { sampleFavoriteKey, useSampleFavorites } from "../sample-favorites";
import { type GeneratedSound, HISTORY_EVENT, deleteSound, listSounds, saveSounds } from "./history-store";
import { TREND_WEEK, TRENDING_SOUNDS, type TrendFilter, type TrendingSound, filterTrends, movementOf } from "./trends";

// Favorites of studio sounds use these ids in place of a creative id.
export const trendFavoriteId = (id: string) => `trend:${id}`;
export const generatedFavoriteId = (id: string) => `gen:${id}`;

/** Demo preview slot of a trending sound (the in-browser demo tracks). */
export const trendDemo = (s: TrendingSound) => ({ demo: `trend-${s.id}`, variant: (s.rank - 1) % 6 });

function Movement({ sound }: { sound: TrendingSound }) {
  const m = movementOf(sound);
  if (m === null) {
    return <span className="mt-0.5 rounded-sm bg-accent px-1 py-px font-bomstad text-[8px] font-semibold text-accent-contrast">NEW</span>;
  }
  if (m === 0) return <Minus className="size-3.5 text-ink-3" aria-label="No change" />;
  const up = m > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn("inline-flex items-center font-num text-[10px] tabular-nums", up ? "font-extrabold text-success" : "font-semibold text-ink-3")}
      aria-label={up ? `Up ${m}` : `Down ${-m}`}
    >
      <Icon className="size-2.5" strokeWidth={up ? 3.5 : 2.5} />
      {Math.abs(m)}
    </span>
  );
}

const FILTERS: { value: TrendFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "rising", label: "Rising" },
  { value: "falling", label: "Falling" },
  { value: "new", label: "New" },
];

/** Fixed frame showing four and a half rows, so the half-cut fifth one hints that the list scrolls. */
function TrendingSounds() {
  const [filter, setFilter] = React.useState<TrendFilter>("all");
  const sounds = filterTrends(filter);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-accent-border bg-surface p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-col">
          <h3 className="text-body font-semibold text-ink">Trending sounds</h3>
          <span className="text-caption text-ink-3">This week · {formatDateRange(TREND_WEEK.from, TREND_WEEK.to)}</span>
        </div>
        <div role="radiogroup" aria-label="Trend filter" className="flex items-center gap-3">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={f.value === filter}
              onClick={() => setFilter(f.value)}
              className={cn(
                "font-bomstad text-caption transition-colors focus-visible:underline focus-visible:outline-none",
                f.value === filter ? "font-semibold text-accent-active" : "text-ink-3 hover:text-ink-2",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <ol className="h-[288px] overflow-y-auto [mask-image:linear-gradient(to_bottom,black_calc(100%-32px),rgb(0_0_0/0.45))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sounds.map((s) => (
          <li key={s.id} className="grid grid h-16 grid-cols-[28px_minmax(0,11rem)_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border-b border-line/50 px-2 transition-colors last:border-b-0 hover:bg-muted">
            <div className="flex flex-col items-center leading-none">
              <span className="font-num text-body-sm font-semibold text-ink-2 tabular-nums">{s.rank}</span>
              <Movement sound={s} />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body font-medium text-ink">{s.title}</span>
              <span className="truncate text-caption text-ink-3 opacity-70">
                {s.artist} · <span className="font-num tabular-nums">{formatCompact(s.uses)}</span> uses
              </span>
            </div>
            <div className="min-w-0">
              <WaveformPlayer source={trendDemo(s)} label={s.title} size="sm" />
            </div>
            <div className="flex items-center gap-1">
              <TrendDownload sound={s} />
              <SampleFavoriteButton creativeId={trendFavoriteId(s.id)} kind="music" className="size-8" />
            </div>
          </li>
        ))}
        {!sounds.length ? <li className="py-8 text-center text-body-sm text-ink-3">No sounds in this list this week.</li> : null}
      </ol>
    </section>
  );
}

export function TrendDownload({ sound }: { sound: TrendingSound }) {
  const [src, setSrc] = React.useState<string>();
  React.useEffect(() => {
    let alive = true;
    const { demo, variant } = trendDemo(sound);
    void import("../demo-tracks").then(({ getDemoTrack }) =>
      getDemoTrack(demo, variant, 240).then((t) => alive && setSrc(t.src)),
    );
    return () => {
      alive = false;
    };
  }, [sound]);
  return <DownloadButton href={src} filename={`${sound.id}.wav`} label="Download sound" className="size-8" />;
}

function useObjectUrl(blob: Blob | undefined) {
  const [url, setUrl] = React.useState<string>();
  React.useEffect(() => {
    if (!blob) return;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

export function GeneratedSoundCard({ sound, onDelete }: { sound: GeneratedSound; onDelete?: () => void }) {
  const url = useObjectUrl(sound.blob);
  const videoSrc = useObjectUrl(sound.video);
  const video = React.useRef<HTMLVideoElement>(null);

  // The video is muted and follows the generated sound, so they play as one.
  const follow = ({ playing, time }: { playing: boolean; time: number }) => {
    const el = video.current;
    if (!el) return;
    const at = el.duration ? time % el.duration : time;
    if (Math.abs(el.currentTime - at) > 0.3) el.currentTime = at;
    if (playing && el.paused) void el.play().catch(() => undefined);
    if (!playing && !el.paused) el.pause();
  };

  return (
    <article className="flex gap-3 rounded-xl border border-line bg-surface p-3">
      {sound.video ? (
        <video
          ref={video}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${sound.source} preview`}
          className="h-24 w-[54px] shrink-0 rounded-lg bg-muted object-cover"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-overline text-ink-3 uppercase">{sound.label}</span>
            <span className="truncate text-caption text-ink-3">
              {sound.source} · {formatDate(sound.createdAt)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <DownloadButton
              href={url}
              filename={`${sound.source.replace(/\.[^.]+$/, "")}-${sound.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.wav`}
              label="Download sound"
              className="size-7"
            />
            <SampleFavoriteButton creativeId={generatedFavoriteId(sound.id)} kind="music" className="size-7" />
            {onDelete ? (
              <IconButton size="sm" aria-label={`Delete ${sound.label}`} onClick={onDelete} className="size-7 text-ink-3 hover:text-danger">
                <Trash2 className="size-4" />
              </IconButton>
            ) : null}
          </div>
        </div>
        {url ? <WaveformPlayer source={{ file: url }} label={sound.label} onPlayback={sound.video ? follow : undefined} /> : null}
      </div>
    </article>
  );
}

/**
 * Picks one of this week's trending sounds for the video. Sample: the pick is
 * random and the sound is its in-browser demo track, until a model is connected.
 */
async function matchTrend() {
  const trend = TRENDING_SOUNDS[Math.floor(Math.random() * Math.min(6, TRENDING_SOUNDS.length))];
  const { demo, variant } = trendDemo(trend);
  const { getDemoTrack } = await import("../demo-tracks");
  const track = await getDemoTrack(demo, variant, 240);
  return { label: `Matched to ${trend.title}`, blob: await (await fetch(track.src)).blob() };
}

/** A library video that can stand in for an upload. */
export type SampleVideo = { id: string; videoPath: string };

/** Without an upload, one of the library's creatives stands in so the result can be seen. */
async function sampleVideo(videos: SampleVideo[]) {
  const pick = videos[Math.floor(Math.random() * videos.length)];
  if (!pick) throw new Error("No video");
  const blob = await (await fetch(pick.videoPath)).blob();
  return new File([blob], `${pick.id}.mp4`, { type: blob.type || "video/mp4" });
}

function GeneratePanel({ videos }: { videos: SampleVideo[] }) {
  const [file, setFile] = React.useState<File>();
  const [busy, setBusy] = React.useState(false);
  const fileUrl = useObjectUrl(file);

  const generate = async () => {
    setBusy(true);
    try {
      const [video, match] = await Promise.all([file ?? sampleVideo(videos), matchTrend()]);
      await saveSounds([
        {
          id: `${Date.now()}`,
          label: match.label,
          source: video.name,
          createdAt: new Date().toISOString(),
          blob: match.blob,
          video,
        },
      ]);
      toast.success("Your video has a sound");
    } catch {
      toast.error("This video could not be read. Try an MP4 or MOV file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <PanelTitle title="Generate" />
      <label
        title={file ? `${file.name} · click to choose another` : "Upload a video (MP4, MOV)"}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) setFile(f);
        }}
        className={cn(
          "flex h-40 min-w-0 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed bg-surface px-3 transition-colors hover:bg-accent-subtle",
          file ? "border-accent" : "border-accent-border",
        )}
      >
        {fileUrl ? (
          <video src={fileUrl} muted playsInline preload="metadata" className="h-28 rounded-md bg-muted object-contain" />
        ) : (
          <span className="relative grid size-11 place-items-center rounded-full bg-accent-subtle text-accent-active">
            <Video className="size-5" />
            <span className="absolute -right-1 -bottom-1 grid size-4.5 place-items-center rounded-full bg-accent text-accent-contrast ring-2 ring-surface">
              <Plus className="size-3" strokeWidth={3} />
            </span>
          </span>
        )}
        <span className="max-w-full truncate text-caption font-semibold text-ink-2">{file ? file.name : "Upload a silent video"}</span>
        <input
          aria-label="Upload video"
          type="file"
          accept="video/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
      </label>
      <p className="text-caption text-ink-3">We add a sound that matches this week&apos;s trending music.</p>
      <Button disabled={busy} onClick={generate} className="w-full">
        {busy ? <Loader2 className="animate-spin" /> : <Wand2 />}
        {busy ? "Generating…" : "Generate"}
      </Button>
    </section>
  );
}

function PanelTitle({ title, count }: { title: string; count?: number }) {
  return (
    <h3 className="flex h-6 items-center gap-2 text-body font-semibold text-ink">
      {title}
      {count ? <span className="font-num text-caption font-normal text-ink-3 tabular-nums">{count}</span> : null}
    </h3>
  );
}

const HISTORY_VISIBLE = 5;
// The last 190px (one and a half cards) fade out on the side that has more to scroll.
const FADE = "190px";
const FADED = "rgb(0 0 0 / 0.1)";

function scrollMask(edges: { top: boolean; bottom: boolean }) {
  if (edges.top && edges.bottom) return undefined;
  const top = edges.top ? "black 0" : `${FADED} 0, black ${FADE}`;
  const bottom = edges.bottom ? "black 100%" : `black calc(100% - ${FADE}), ${FADED} 100%`;
  return `linear-gradient(to bottom, ${top}, ${bottom})`;
}

function HistoryPanel() {
  const [sounds, setSounds] = React.useState<GeneratedSound[] | null>(null);
  const { isSaved, setMany } = useSampleFavorites();
  const list = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ top: true, bottom: true });
  const updateEdges = React.useCallback(() => {
    const el = list.current;
    if (!el) return;
    setEdges({ top: el.scrollTop <= 4, bottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 4 });
  }, []);

  React.useEffect(() => {
    const el = list.current;
    if (!el) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges, sounds]);

  // Deleting is immediate; the toast offers to bring the sound (and its favorite) back.
  const remove = async (sound: GeneratedSound) => {
    const favorite = { creativeId: generatedFavoriteId(sound.id), kind: "music" as const, iteration: 0 };
    const wasFavorite = isSaved(sampleFavoriteKey(favorite.creativeId, "music"));
    await deleteSound(sound.id);
    if (wasFavorite) setMany([favorite], false);
    toast((t) => (
      <span className="flex items-center gap-3">
        Sound deleted
        <Button
          variant="link"
          onClick={() => {
            toast.dismiss(t.id);
            void saveSounds([sound]);
            if (wasFavorite) setMany([favorite], true);
          }}
        >
          Undo
        </Button>
      </span>
    ));
  };

  React.useEffect(() => {
    const load = () => void listSounds().then(setSounds).catch(() => setSounds([]));
    load();
    window.addEventListener(HISTORY_EVENT, load);
    return () => window.removeEventListener(HISTORY_EVENT, load);
  }, []);

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <PanelTitle title="History" count={sounds?.length} />
      {!sounds ? (
        <p className="py-6 text-center text-body-sm text-ink-3">Loading…</p>
      ) : !sounds.length ? (
        <p className="grid h-32 place-items-center rounded-xl border border-dashed border-line-strong text-center text-body-sm text-ink-3">
          Sounds you generate will show up here.
        </p>
      ) : (
        // Five and a half cards fit (122px each, 12px apart); the edge with more to scroll fades out.
        <div
          ref={list}
          onScroll={updateEdges}
          style={{ maskImage: sounds.length > HISTORY_VISIBLE ? scrollMask(edges) : undefined }}
          className="flex max-h-[731px] flex-col gap-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sounds.map((s) => (
            <GeneratedSoundCard key={s.id} sound={s} onDelete={() => void remove(s)} />
          ))}
        </div>
      )}
    </section>
  );
}

/** The Music Generator page body: trending sounds on top, Generate (narrow) and History (wide) side by side below. */
export function MusicStudio({ videos }: { videos: SampleVideo[] }) {
  return (
    <div className="flex flex-col gap-6">
      <TrendingSounds />
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <GeneratePanel videos={videos} />
        <HistoryPanel />
      </div>
    </div>
  );
}

