"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Copy, Heart, Loader2, Music, Sparkles } from "lucide-react";
import { Button, Label, PageHeader } from "@/components/design-system";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { appName as nameOfApp } from "./apps";
import { api, type FavoriteTarget, formatDateTime, tagSlug } from "./client";
import { StatusBadge } from "./components/bits";
import { AVATAR_TYPES, avatarFrames, ITERATION_TABS, NO_DIRECTION_TYPES, tabOf, VIDEO_ONLY_TYPES } from "./constants";
import { AiPanel, Breadcrumbs, Chip, CopyTextButton, DownloadButton, FavoriteButton, TypeIcon, creativeTarget } from "./parts";
import { HOME_PATH, appHref as appPath, categoryHref, categoryOf, creativeLabel, detailHref } from "./paths";
import type { AvatarCandidate, Creative, CreativeExtraction, CreativeSummary, Favorite, Iteration, IterationItem, IterationType } from "./types";
import { FavoritesProvider, useFavoritesContext } from "./useFavorites";
import { WaveformPlayer } from "./WaveformPlayer";

const SYNC_INTERVAL_MS = 4000;
const ANALYSIS_LABELS = { idle: "Not analyzed", running: "Analyzing", completed: "Analyzed", failed: "Analysis failed" };
const TEXT_TYPES: ReadonlySet<IterationType> = new Set(["wallText", "voiceover"]);

export function CreativeDetail({
  initialCreative,
  favorites,
  siblings,
  type,
}: {
  initialCreative: Creative;
  favorites: Favorite[];
  /** The creatives of the same app and category, newest first, this one included. */
  siblings: CreativeSummary[];
  type: IterationType;
}) {
  return (
    <FavoritesProvider initial={favorites}>
      <Detail initialCreative={initialCreative} siblings={siblings} type={type} />
    </FavoritesProvider>
  );
}

function Detail({ initialCreative, siblings, type }: { initialCreative: Creative; siblings: CreativeSummary[]; type: IterationType }) {
  const tab = tabOf(type);
  const [creative, setCreative] = useState(initialCreative);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"analyze" | "generate" | null>(null);
  const [pickedAvatar, setPickedAvatar] = useState<string | null>(null);
  const { columnRef, navRef, videoRef, offset } = useAlignToVideo();

  const running = creative.analysis.status === "running" || creative.iterations.some((it) => it.status === "running");
  const analyzed = creative.analysis.status === "completed" && !!creative.extracted;
  // The template workflow reads the video itself; the others start from the analysis.
  const videoOnly = VIDEO_ONLY_TYPES.has(type);
  const ready = videoOnly ? !!creative.videoUrl : analyzed;
  const iterations = creative.iterations.filter((it) => it.type === type);
  // The first frame until one is picked; a new analysis brings new frames, so a pick from before falls back too.
  const frames = avatarFrames(creative.extracted?.avatar);
  const selectedAvatar = pickedAvatar && frames.includes(pickedAvatar) ? pickedAvatar : frames[0];
  const category = categoryOf(creative);
  const tag = creative.tags[0];
  const app = nameOfApp(creative.app);
  const suggestions = iterations.reduce((n, it) => n + it.items.length, 0);

  // Poll eachlabs through our sync route while something is running.
  const lastSyncError = useRef<string | null>(null);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(async () => {
      try {
        const { creative: next } = await api.sync(creative.id);
        lastSyncError.current = null;
        setCreative(next);
        if (next.analysis.status !== creative.analysis.status && next.analysis.status === "completed") {
          toast.success("Analysis finished");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not check the run.";
        if (lastSyncError.current !== message) toast.error(message);
        lastSyncError.current = message;
      }
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [running, creative.id, creative.analysis.status]);

  const analyze = async () => {
    setBusy("analyze");
    try {
      const { creative: next } = await api.analyze(creative.id);
      setCreative(next);
      toast.success("Analysis started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the analysis.");
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    setBusy("generate");
    try {
      const imageUrl = AVATAR_TYPES.has(type) ? selectedAvatar : undefined;
      const { creative: next } = await api.generate(creative.id, type, prompts[type] ?? "", imageUrl);
      setCreative(next);
      toast.success(`${tab.label}: generation started`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the generation.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div className="flex flex-col gap-3">
        <Breadcrumbs
          items={[
            { label: "Home", href: HOME_PATH },
            { label: app, href: appPath(creative.app) },
            ...(tag ? [{ label: tag, href: categoryHref(creative.app, tagSlug(tag)) }] : []),
            { label: creativeLabel(creative.id) },
          ]}
        />
        <PageHeader
          title={creativeLabel(creative.id)}
          description={`Compare the original with ${suggestions ? `${suggestions} alternatives` : "AI alternatives"}. Save useful assets for your next creative.`}
          actions={<CreativeStepper creative={creative} siblings={siblings} typeSlug={tab.slug} />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <OriginalCard creative={creative} appName={app} videoRef={videoRef}>
          <AnalysisSection creative={creative} analyzed={analyzed} disabled={busy !== null} onAnalyze={analyze} />
        </OriginalCard>
        <section ref={columnRef} style={{ paddingTop: offset }} className="flex min-w-0 flex-col gap-4">
          <nav ref={navRef} aria-label="Asset type" className="flex flex-wrap gap-1.5">
            {ITERATION_TABS.map((t) => (
              <Link
                key={t.type}
                href={detailHref(category, t.slug, creative.id)}
                scroll={false}
                aria-current={t.type === type ? "page" : undefined}
                className={cn(
                  "inline-flex h-7 items-center gap-1 rounded-sm border px-2.5 font-bomstad text-body-sm whitespace-nowrap transition-colors",
                  t.type === type
                    ? "border-accent-border bg-accent-subtle text-accent-text"
                    : "border-line bg-surface text-ink-2 hover:bg-muted hover:text-ink",
                )}
              >
                <TypeIcon type={t.type} className="size-3.5" />
                {t.label}
              </Link>
            ))}
          </nav>
          {type !== "template" ? (
            <OriginalPanel
              creative={creative}
              type={type}
              extracted={creative.extracted}
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setPickedAvatar}
            />
          ) : null}
          <AiPanel
            note={`${suggestions} suggestions`}
            actions={
              <>
                {TEXT_TYPES.has(type) ? <BulkTextActions creative={creative} iterations={iterations} /> : null}
                <Button variant={ready ? "primary" : "secondary"} onClick={generate} disabled={!ready || busy !== null} className="gap-1.5">
                  {busy === "generate" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                  Generate
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-2">
              {!NO_DIRECTION_TYPES.has(type) ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="direction">Direction (optional)</Label>
                  <textarea
                    id="direction"
                    rows={2}
                    value={prompts[type] ?? ""}
                    onChange={(e) => setPrompts((p) => ({ ...p, [type]: e.target.value }))}
                    placeholder={`What should the new ${tab.label.toLowerCase()} explore? ${tab.directionHint ?? "e.g. a curiosity-led angle, a calmer tone…"}`}
                    disabled={!analyzed}
                    className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 font-prose text-body text-ink outline-none placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-accent-border disabled:opacity-40"
                  />
                </div>
              ) : null}
              <Iterations creative={creative} type={type} iterations={iterations} ready={ready} />
            </div>
          </AiPanel>
        </section>
      </div>
    </div>
  );
}

function OriginalCard({
  creative,
  appName,
  videoRef,
  children,
}: {
  creative: Creative;
  appName: string;
  videoRef: React.Ref<HTMLVideoElement>;
  children?: React.ReactNode;
}) {
  return (
    <aside className="flex flex-col gap-4 self-start rounded-xl border border-line bg-surface p-4 lg:sticky lg:top-0">
      <div className="flex items-end justify-between gap-2">
        {/* Shrinks with the column so the full file name stays on one line. */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 [container-type:inline-size]">
          <h2
            title={creative.fileName}
            style={{ "--chars": creative.fileName.length } as React.CSSProperties}
            className="pl-1.5 font-num text-[min(10px,calc((100cqi-6px)/(var(--chars)*0.6)))] leading-4 font-normal whitespace-nowrap text-ink-3"
          >
            {creative.fileName}
          </h2>
          <div className="flex flex-wrap gap-1">
            {[appName, ...creative.tags, creative.id].map((label) => (
              <span key={label} className="inline-flex h-5 items-center rounded-xs bg-muted px-1.5 font-bomstad text-micro text-ink-2">
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <DownloadButton href={creative.videoPath} filename={creative.fileName} label="Download video" className="size-8" />
          <FavoriteButton target={creativeTarget(creative.id)} />
        </div>
      </div>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={creative.posterPath ?? undefined}
        src={creative.videoPath}
        aria-label={`${creative.id} original video`}
        className="mx-auto aspect-[9/16] w-full max-w-72 rounded-lg bg-ink"
      />
      {children}
    </aside>
  );
}

/** Analysis state and the Analyze button, under the original video. */
function AnalysisSection({
  creative,
  analyzed,
  disabled,
  onAnalyze,
}: {
  creative: Creative;
  analyzed: boolean;
  disabled: boolean;
  onAnalyze: () => void;
}) {
  const { analysis } = creative;
  return (
    <div className="flex flex-col gap-2.5 border-t border-line pt-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-overline text-ink-3 uppercase">Analysis</h2>
        <StatusBadge status={analysis.status} labels={ANALYSIS_LABELS} />
      </div>
      {analysis.status === "running" ? (
        <p className="text-body-sm text-ink-3">
          eachlabs is breaking the video into parts. This can take a few minutes; you can leave this page.
        </p>
      ) : null}
      {analysis.status === "failed" && analysis.error ? (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-body-sm text-danger">{analysis.error}</p>
      ) : null}
      {analysis.completedAt && analysis.status === "completed" ? (
        <p className="text-caption text-ink-3">Analyzed {formatDateTime(analysis.completedAt)}</p>
      ) : null}
      {creative.extracted?.summary ? <p className="font-prose text-body-sm text-ink-2">{creative.extracted.summary}</p> : null}
      {creative.videoUrl ? (
        creative.storage?.expiresAt ? (
          <p className="text-caption text-ink-3">
            Stored on eachlabs until <span className="font-bomstad">{formatDate(creative.storage.expiresAt)}</span>
          </p>
        ) : null
      ) : (
        <p className="text-caption text-ink-3">
          This video is only on this computer, so eachlabs cannot read it. Add it again with Add creative to analyze it.
        </p>
      )}
      <Button
        variant={analyzed ? "secondary" : "primary"}
        onClick={onAnalyze}
        disabled={disabled || analysis.status === "running"}
        className="self-start"
      >
        {analyzed ? "Analyze again" : "Analyze video"}
      </Button>
    </div>
  );
}

function Notice({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "danger" }) {
  return (
    <p className={cn("rounded-lg px-4 py-3 text-body-sm", tone === "danger" ? "bg-danger-bg text-danger" : "bg-info-bg text-ink-2")}>
      {children}
    </p>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

type Result = { iteration: Iteration; item: IterationItem; index: number; number: number };

const isVisual = (item: IterationItem) => !!item.url && (item.mediaType === "image" || item.mediaType === "video");
const isAudio = (item: IterationItem) => !!item.url && item.mediaType === "audio";

function Iterations({
  creative,
  type,
  iterations,
  ready,
}: {
  creative: Creative;
  type: IterationType;
  iterations: Iteration[];
  /** Whatever the workflow needs is there: the analysis, or for a template the public video. */
  ready: boolean;
}) {
  const tab = tabOf(type);
  const grid = TEXT_TYPES.has(type)
    ? "grid grid-cols-1 gap-2 xl:grid-cols-2"
    : type === "music"
      ? "grid grid-cols-1 gap-4 xl:grid-cols-2"
      : "grid grid-cols-2 gap-3 md:grid-cols-3";

  let number = 0;
  const results: Result[] = iterations.flatMap((iteration) =>
    iteration.items.map((item, index) => ({ iteration, item, index, number: ++number })),
  );
  const pending = iterations.filter((it) => it.status === "running");
  const failed = iterations.filter((it) => it.status === "failed");

  return (
    <>
      {!ready ? (
        <Notice>
          {VIDEO_ONLY_TYPES.has(type)
            ? "This video is only on this computer, so eachlabs cannot read it. Add it again with Add creative to generate templates."
            : `Analyze the video first. ${tab.label} are generated from its analysis.`}
        </Notice>
      ) : null}
      {failed.map((it) => (
        <Notice key={it.id} tone="danger">
          {formatDateTime(it.createdAt)} · {it.error ?? "The run failed."}
        </Notice>
      ))}
      {results.length || pending.length ? (
        <div className={grid}>
          {pending.map((it) => (
            <Pending key={it.id} iteration={it} visual={!TEXT_TYPES.has(type) && type !== "music"} />
          ))}
          {results.map((r) =>
            isVisual(r.item) ? (
              <VisualSuggestion key={`${r.iteration.id}-${r.index}`} creative={creative} result={r} />
            ) : isAudio(r.item) ? (
              <MusicSuggestion key={`${r.iteration.id}-${r.index}`} creative={creative} result={r} />
            ) : (
              <TextSuggestion key={`${r.iteration.id}-${r.index}`} creative={creative} result={r} />
            ),
          )}
        </div>
      ) : ready ? (
        <Notice>No {tab.label.toLowerCase()} generated yet. Generated suggestions appear here, newest first.</Notice>
      ) : null}
    </>
  );
}

const targetOf = (creative: Creative, r: Result): FavoriteTarget => ({
  creativeId: creative.id,
  type: r.iteration.type,
  iterationId: r.iteration.id,
  itemIndex: r.index,
});

function Pending({ iteration, visual }: { iteration: Iteration; visual: boolean }) {
  return (
    <article
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface p-4 text-center",
        visual ? "aspect-[4/5]" : "min-h-28",
      )}
    >
      <Loader2 className="size-5 animate-spin text-accent-active" />
      <span className="text-body-sm font-semibold text-ink">Generating…</span>
      <span className="text-caption text-ink-3">
        Started {formatDateTime(iteration.createdAt)}. This can take a few minutes; you can leave this page.
      </span>
    </article>
  );
}

function SourceLine({ creative, result }: { creative: Creative; result: Result }) {
  const { iteration, item } = result;
  return (
    <p title={item.notes} className="line-clamp-3 border-t border-line pt-1.5 text-caption text-ink-3">
      Source: <span className="font-mono">{creative.id}</span> · {formatDateTime(iteration.createdAt)}
      {iteration.prompt ? ` · Direction: ${iteration.prompt}` : ""}
      {item.notes ? ` · ${item.notes}` : ""}
    </p>
  );
}

function TextSuggestion({ creative, result }: { creative: Creative; result: Result }) {
  const { item, iteration, number } = result;
  return (
    <article className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-overline text-ink-3 uppercase">
          {pad(number)} · {item.title ?? tabOf(iteration.type).label}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <CopyTextButton text={item.text ?? ""} />
          {item.url ? <DownloadButton href={item.url} label="Download file" /> : null}
          <FavoriteButton target={targetOf(creative, result)} className="size-7" />
        </div>
      </div>
      {item.text ? <p className="font-prose text-body whitespace-pre-line text-ink">{item.text}</p> : null}
      <SourceLine creative={creative} result={result} />
    </article>
  );
}

function MusicSuggestion({ creative, result }: { creative: Creative; result: Result }) {
  const { item, iteration, number } = result;
  const label = item.title ?? `Generated ${formatDateTime(iteration.createdAt)}`;
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-overline text-ink-3 uppercase">Iteration {pad(number)}</span>
        <div className="flex items-center gap-2">
          <DownloadButton href={item.url} filename={`${creative.id}-music-${pad(number)}`} label="Download audio" className="size-7" />
          <FavoriteButton target={targetOf(creative, result)} className="size-7" />
        </div>
      </div>
      <h3 className="flex items-center gap-2 text-body font-semibold text-ink">
        <Music className="size-4 text-ink-3" />
        {label}
      </h3>
      {item.text ? <p className="font-prose text-body-sm text-ink-2">{item.text}</p> : null}
      <WaveformPlayer source={{ file: item.url! }} label={label} />
    </article>
  );
}

function VisualSuggestion({ creative, result }: { creative: Creative; result: Result }) {
  const { item, iteration, number } = result;
  const tab = tabOf(iteration.type);
  const label = item.title ?? `${tab.label} ${number}`;
  const badge = `#${pad(number)}`;
  const actions = (
    <>
      <DownloadButton href={item.url} label="Download visual" className="size-7 bg-surface shadow-sm" />
      <FavoriteButton target={targetOf(creative, result)} className="size-7 shadow-sm" />
    </>
  );
  const media = (className: string) =>
    item.mediaType === "video" ? (
      <video src={item.url} muted playsInline loop preload="metadata" className={className} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.url} alt={label} loading="lazy" className={className} />
    );

  return (
    <Dialog>
      <article className="relative overflow-hidden rounded-xl border border-line bg-surface">
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label={`Preview suggestion ${number}: ${label}`}
            title={label}
            className="relative block aspect-[4/5] w-full bg-muted transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none"
          >
            {media("absolute inset-0 size-full object-cover object-top")}
          </button>
        </DialogTrigger>
        <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-xs bg-surface px-2 py-1 font-num text-caption font-semibold text-ink tabular-nums shadow-sm">
          {badge}
        </span>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">{actions}</div>
      </article>

      <DialogContent className="max-w-sm gap-3 border-line bg-surface p-4 font-sans">
        <div className="flex flex-col gap-0.5 pr-8">
          <DialogTitle className="text-body font-semibold text-ink">
            {badge} · {label}
          </DialogTitle>
          <DialogDescription className="text-caption text-ink-3">
            {tab.label} suggestion for <span className="font-mono">{creative.id}</span> · {formatDateTime(iteration.createdAt)}
          </DialogDescription>
        </div>
        <div className="relative flex aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          {item.mediaType === "video" ? (
            <video src={item.url} controls playsInline className="size-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={label} className="size-full object-contain" />
          )}
        </div>
        {item.text ? <p className="font-prose text-body-sm text-ink">{item.text}</p> : null}
        {item.notes ? <p className="line-clamp-6 text-caption whitespace-pre-line text-ink-3">{item.notes}</p> : null}
        <div className="flex items-center justify-end gap-1">{actions}</div>
      </DialogContent>
    </Dialog>
  );
}

function seconds(start?: number, end?: number): string | null {
  if (start == null && end == null) return null;
  const f = (n?: number) => (n == null ? "?" : `${n.toFixed(1).replace(/\.0$/, "")}s`);
  return `${f(start)} – ${f(end)}`;
}

function sec(n?: number): string | null {
  return n == null ? null : `${n.toFixed(1).replace(/\.0$/, "")}s`;
}

/** A row of 9:16 frames to pick from, like the design's layout frames. */
function FramePicker({
  label,
  frames,
  selected,
  onSelect,
}: {
  label: string;
  frames: { url: string; title?: string }[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid max-w-md grid-cols-4 gap-2">
      {frames.map((f, i) => (
        <button
          key={f.url}
          type="button"
          role="radio"
          aria-checked={i === selected}
          aria-label={`Frame ${i + 1}`}
          title={f.title}
          onClick={() => onSelect(i)}
          className={cn(
            "relative aspect-[9/16] overflow-hidden rounded-lg border-2 bg-muted transition focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none",
            i === selected ? "border-accent" : "border-transparent opacity-70 hover:opacity-100",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          <span
            className={cn(
              "absolute bottom-1.5 left-1.5 rounded-xs px-1.5 py-0.5 font-num text-micro font-semibold tabular-nums",
              i === selected ? "bg-accent text-accent-contrast" : "bg-surface text-ink",
            )}
          >
            {i + 1}
          </span>
        </button>
      ))}
    </div>
  );
}

function Chips({ values }: { values: (string | null | undefined)[] }) {
  const shown = values.filter((v): v is string => !!v);
  if (!shown.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((v) => (
        <Chip key={v}>{v}</Chip>
      ))}
    </div>
  );
}

function OriginalPanel({
  creative,
  type,
  extracted,
  selectedAvatar,
  onSelectAvatar,
}: {
  creative: Creative;
  type: Exclude<IterationType, "template">;
  extracted: CreativeExtraction | null;
  /** The avatar frame the next generation starts from. */
  selectedAvatar?: string;
  onSelectAvatar: (url: string) => void;
}) {
  const missing = (what: string) => <p className="text-body-sm text-ink-2">The analysis found no {what} in this video.</p>;

  const frameRow = (url: string | undefined, caption: string) => (
    <div className="flex items-center gap-3">
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-sm bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt="" className="absolute inset-0 size-full object-cover object-top" /> : null}
      </div>
      <p className="text-body-sm text-ink-2">{caption}</p>
    </div>
  );

  const wallTexts = extracted?.wallTexts ?? [];
  const voiceover = extracted?.voiceover;
  const avatar = extracted?.avatar;
  const music = extracted?.music;
  const candidates: AvatarCandidate[] = avatar?.candidates?.length ? avatar.candidates : avatar?.imageUrl ? [{ url: avatar.imageUrl }] : [];
  const avatarIndex = Math.max(0, candidates.findIndex((c) => c.url === selectedAvatar));

  const avatarBody = (caption: string) =>
    !extracted ? (
      frameRow(creative.posterPath ?? undefined, caption)
    ) : !avatar ? (
      missing("avatar")
    ) : (
      <div className="flex flex-col gap-3">
        {frameRow(selectedAvatar ?? avatar.imageUrl, avatar.description || caption)}
        <Chips values={[avatar.gender, avatar.ageRange, avatar.setting, avatar.wardrobe, avatar.framing]} />
        {candidates.length > 1 ? (
          <>
            <span className="text-caption text-ink-3">Pick the frame to generate from. Best first.</span>
            <FramePicker
              label="Avatar frame"
              frames={candidates.map((c) => ({
                url: c.url,
                title: [sec(c.atSec), c.score != null ? `${c.score}/10` : null, c.notes].filter(Boolean).join(" · "),
              }))}
              selected={avatarIndex}
              onSelect={(i) => onSelectAvatar(candidates[i].url)}
            />
          </>
        ) : null}
      </div>
    );

  const avatarActions = (name: string) => (
    <DownloadButton
      href={selectedAvatar ?? avatar?.imageUrl ?? creative.posterPath ?? undefined}
      filename={`${creative.id}-${name}.jpg`}
      label="Download avatar frame"
    />
  );

  const content: Record<Exclude<IterationType, "template">, { label: string; body: React.ReactNode; actions?: React.ReactNode; hint?: string }> = {
    wallText: wallTexts.length
      ? {
          label: "Wall texts",
          hint: "Extracted from the video by the analysis.",
          body: (
            <ol className="flex flex-col gap-1.5">
              {wallTexts.map((w, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4">
                  <span className="font-prose text-body text-ink">{w.text}</span>
                  <span className="shrink-0 font-num text-caption text-ink-3 tabular-nums">
                    {[w.role, seconds(w.startSec, w.endSec), w.persistent ? "persistent" : null].filter(Boolean).join(" · ")}
                  </span>
                </li>
              ))}
            </ol>
          ),
          actions: <CopyTextButton text={wallTexts.map((w) => w.text).join("\n")} />,
        }
      : {
          label: "Opening text",
          hint: "Entered when the creative was added; may be a partial phrase.",
          body: (
            <>
              <p className="font-prose text-body text-ink">{creative.hook || "Not added yet"}</p>
              {extracted ? missing("wall texts") : null}
            </>
          ),
          actions: creative.hook ? <CopyTextButton text={creative.hook} /> : undefined,
        },
    voiceover: {
      label: "Voiceover",
      hint: voiceover ? "Transcribed automatically from the original video's audio." : undefined,
      body: voiceover ? (
        <div className="flex flex-col gap-2">
          <p className="font-prose text-body whitespace-pre-line text-ink">{voiceover.script}</p>
          {voiceover.segments?.length ? (
            <ol className="flex flex-col gap-1 border-t border-line pt-2">
              {voiceover.segments.map((s, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4">
                  <span className="font-prose text-body-sm text-ink-2">{s.text}</span>
                  <span className="shrink-0 font-num text-caption text-ink-3 tabular-nums">{seconds(s.startSec, s.endSec)}</span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : extracted ? (
        missing("voiceover")
      ) : (
        <p className="text-body-sm text-ink-2">Not transcribed yet. Play the original video to hear it.</p>
      ),
      actions: <CopyTextButton text={voiceover?.script ?? ""} />,
    },
    similarAvatar: {
      label: "Avatar",
      body: avatarBody("The presenter of the original creative."),
      actions: avatarActions("similar-avatars"),
    },
    avatarVariation: {
      label: "Avatar & setting",
      body: avatarBody("The presenter and setting of the original creative."),
      actions: avatarActions("avatar-variations"),
    },
    music: {
      label: "Audio",
      body: !extracted ? (
        <WaveformPlayer source={{ file: creative.videoPath }} label="original audio" />
      ) : !music ? (
        missing("music")
      ) : (
        <div className="flex flex-col gap-2">
          {music.description ? <p className="text-body-sm text-ink-2">{music.description}</p> : null}
          <Chips values={[music.genre, music.mood, music.energy ? `${music.energy} energy` : null, music.tempoBpm ? `${music.tempoBpm} BPM` : null]} />
          {music.instrumentalUrl ? <WaveformPlayer source={{ file: music.instrumentalUrl }} label="instrumental" /> : null}
          {music.audioUrl || !music.instrumentalUrl ? (
            <WaveformPlayer source={{ file: music.audioUrl ?? creative.videoPath }} label="original audio" />
          ) : null}
          {music.stemsUrl && !music.instrumentalUrl ? (
            <p className="text-body-sm text-ink-3">
              The instrumental could not be taken from the stems.{" "}
              <a href={music.stemsUrl} className="text-accent-text underline" target="_blank" rel="noreferrer">
                Download all stems
              </a>
            </p>
          ) : null}
        </div>
      ),
      actions: (
        <DownloadButton
          href={music?.instrumentalUrl ?? music?.audioUrl ?? creative.videoPath}
          filename={creative.fileName}
          label="Download audio"
        />
      ),
    },
  };
  const c = content[type];

  return (
    <section title={c.hint} className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-overline text-ink-3 uppercase">Original · {c.label}</h2>
        {c.actions ? <div className="flex shrink-0 items-center gap-1">{c.actions}</div> : null}
      </div>
      {c.body}
    </section>
  );
}

// On wide screens the first box on the right starts at the video's top edge,
// whatever the height of the header above the video or of the asset type row.
function useAlignToVideo() {
  const columnRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const column = columnRef.current;
    const nav = navRef.current;
    const video = videoRef.current;
    if (!column || !nav || !video) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      if (!wide.matches) return setOffset(0);
      const columnTop = column.getBoundingClientRect().top;
      const gap = parseFloat(getComputedStyle(column).rowGap) || 0;
      setOffset(Math.max(0, video.getBoundingClientRect().top - columnTop - nav.offsetHeight - gap));
    };
    measure();
    const observer = new ResizeObserver(measure);
    [column, nav, video, video.parentElement!].forEach((el) => observer.observe(el));
    wide.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      wide.removeEventListener("change", measure);
    };
  }, []);

  return { columnRef, navRef, videoRef, offset };
}

function BulkTextActions({ creative, iterations }: { creative: Creative; iterations: Iteration[] }) {
  const { isFavorite, setMany } = useFavoritesContext();
  const entries = iterations.flatMap((it) =>
    it.items.flatMap((item, i) =>
      item.text ? [{ text: item.text, target: { creativeId: creative.id, type: it.type, iterationId: it.id, itemIndex: i } }] : [],
    ),
  );
  if (!entries.length) return null;
  const allSaved = entries.every((e) => isFavorite(e.target));

  return (
    <>
      <Button
        variant="secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(entries.map((e) => e.text).join("\n\n"));
            toast.success(`${entries.length} texts copied`);
          } catch {
            toast.error("Copy is unavailable in this browser. Select the text manually.");
          }
        }}
      >
        <Copy />
        Copy all
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          setMany(
            entries.map((e) => e.target),
            !allSaved,
          );
          toast.success(allSaved ? "Removed all from favorites" : `${entries.length} saved to favorites`);
        }}
      >
        <Heart className={cn(allSaved && "fill-current")} />
        {allSaved ? "Remove all from favorites" : "Add all to favorites"}
      </Button>
    </>
  );
}

/** Previous / next creative in the category, in the same order as its tab; keeps the asset type. */
function CreativeStepper({ creative, siblings, typeSlug }: { creative: Creative; siblings: CreativeSummary[]; typeSlug: string }) {
  const router = useRouter();
  const index = siblings.findIndex((c) => c.id === creative.id);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const hrefOf = (target: CreativeSummary) => detailHref(categoryOf(target), typeSlug, target.id);

  // ← / → move between creatives, unless the user is typing or using the video.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, video, [role=slider], [contenteditable=true]")) return;
      if (e.key === "ArrowLeft" && prev) router.push(hrefOf(prev));
      if (e.key === "ArrowRight" && next) router.push(hrefOf(next));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const step = (target: CreativeSummary | undefined, direction: "prev" | "next") => {
    const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
    const label = direction === "prev" ? "Previous creative" : "Next creative";
    const look =
      "grid size-7 place-items-center rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none";
    if (!target) {
      return (
        <span aria-label={label} aria-disabled className={cn(look, "border-line text-ink-3 opacity-40")}>
          <Icon className="size-4" />
        </span>
      );
    }
    return (
      <Link
        href={hrefOf(target)}
        aria-label={`${label}: ${creativeLabel(target.id)}`}
        title={`${creativeLabel(target.id)} · ${direction === "prev" ? "←" : "→"}`}
        className={cn(look, "border-accent-border bg-surface text-accent-text hover:bg-accent-subtle")}
      >
        <Icon className="size-4" />
      </Link>
    );
  };

  if (index < 0) return null;
  return (
    <div className="flex items-center gap-2">
      {step(prev, "prev")}
      <span className="min-w-14 text-center font-num text-body-sm text-ink-3 tabular-nums">
        <span className="font-semibold text-accent-text">{index + 1}</span> / {siblings.length}
      </span>
      {step(next, "next")}
    </div>
  );
}
