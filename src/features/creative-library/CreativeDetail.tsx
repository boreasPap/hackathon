"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button, Label, PageHeader } from "@/components/design-system";
import { formatDate } from "@/lib/format";
import { api, formatDateTime } from "./client";
import { EmptyState, FavoriteButton, Overline, Panel, StatusBadge, TabBar, Tag } from "./components/bits";
import { IterationCard } from "./components/IterationCard";
import { OriginalPanel } from "./components/OriginalPanel";
import { AVATAR_TYPES, avatarFrames, ITERATION_TABS, NO_DIRECTION_TYPES, tabBySlug } from "./constants";
import { ANALYSIS_LABELS } from "./CreativeLibrary";
import type { Creative, Favorite } from "./types";
import { useFavorites } from "./useFavorites";

const SYNC_INTERVAL_MS = 4000;

export function CreativeDetail({ initialCreative, favorites }: { initialCreative: Creative; favorites: Favorite[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = tabBySlug(searchParams.get("tab"));

  const [creative, setCreative] = useState(initialCreative);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"analyze" | "generate" | null>(null);
  const [pickedAvatar, setPickedAvatar] = useState<string | null>(null);
  const { isFavorite, toggle } = useFavorites(favorites);

  const running = creative.analysis.status === "running" || creative.iterations.some((it) => it.status === "running");
  const analyzed = creative.analysis.status === "completed" && !!creative.extracted;
  const iterations = creative.iterations.filter((it) => it.type === tab.type);
  // The first frame until one is picked; a new analysis brings new frames, so a pick from before falls back too.
  const frames = avatarFrames(creative.extracted?.avatar);
  const selectedAvatar = pickedAvatar && frames.includes(pickedAvatar) ? pickedAvatar : frames[0];

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

  const setTab = (slug: string) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (slug === ITERATION_TABS[0].slug) qs.delete("tab");
    else qs.set("tab", slug);
    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

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
      const imageUrl = AVATAR_TYPES.has(tab.type) ? selectedAvatar : undefined;
      const { creative: next } = await api.generate(creative.id, tab.type, prompts[tab.type] ?? "", imageUrl);
      setCreative(next);
      toast.success(`${tab.label}: generation started`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the generation.");
    } finally {
      setBusy(null);
    }
  };

  const creativeTarget = { creativeId: creative.id, type: "creative" as const, iterationId: null, itemIndex: null };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/creative-library"
          className="inline-flex items-center gap-1.5 self-start text-body-sm text-ink-3 hover:text-ink-2"
        >
          <ArrowLeft className="size-3.5" />
          Creative Library
        </Link>
        <PageHeader
          title={creative.id}
          description={creative.hook}
          actions={
            <FavoriteButton
              on={isFavorite(creativeTarget)}
              onToggle={() => toggle(creativeTarget)}
              label={creative.id}
            />
          }
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <Panel className="flex flex-col gap-4 lg:sticky lg:top-0">
          <video
            src={creative.videoPath}
            poster={creative.posterPath ?? undefined}
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full rounded-sm bg-muted object-contain"
          />
          <div className="flex flex-wrap gap-1.5">
            {creative.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
          <p className="text-caption break-all text-ink-3">{creative.fileName}</p>

          <div className="flex flex-col gap-3 border-t border-line pt-4">
            <div className="flex items-center justify-between gap-2">
              <Overline>Analysis</Overline>
              <StatusBadge status={creative.analysis.status} labels={ANALYSIS_LABELS} />
            </div>
            {creative.analysis.status === "running" ? (
              <p className="text-body-sm text-ink-3">
                eachlabs is breaking the video into parts. This can take a few minutes; you can leave this page.
              </p>
            ) : null}
            {creative.analysis.status === "failed" && creative.analysis.error ? (
              <p className="rounded-sm bg-danger-bg px-3 py-2 text-body-sm text-danger">{creative.analysis.error}</p>
            ) : null}
            {creative.analysis.completedAt && creative.analysis.status === "completed" ? (
              <p className="text-caption text-ink-3">Analyzed {formatDateTime(creative.analysis.completedAt)}</p>
            ) : null}
            {creative.extracted?.summary ? (
              <p className="font-prose text-body-sm text-ink-2">{creative.extracted.summary}</p>
            ) : null}
            {creative.videoUrl ? (
              creative.storage?.expiresAt ? (
                <p className="text-caption text-ink-3">
                  Stored on eachlabs until <span className="font-bomstad">{formatDate(creative.storage.expiresAt)}</span>
                </p>
              ) : null
            ) : (
              <p className="text-caption text-ink-3">
                This video is only on this computer, so eachlabs cannot read it. Add it again with Add creative to
                analyze it.
              </p>
            )}
            <Button
              variant={analyzed ? "secondary" : "primary"}
              onClick={analyze}
              disabled={busy !== null || creative.analysis.status === "running"}
              className="self-start"
            >
              {analyzed ? "Analyze again" : "Analyze video"}
            </Button>
          </div>
        </Panel>

        <section className="flex min-w-0 flex-col gap-6">
          <TabBar
            label="Iteration type"
            value={tab.slug}
            onChange={setTab}
            tabs={ITERATION_TABS.map((t) => ({
              value: t.slug,
              label: t.label,
              count: creative.iterations.filter((it) => it.type === t.type).length,
            }))}
          />

          <OriginalPanel
            type={tab.type}
            extracted={creative.extracted}
            selectedAvatar={selectedAvatar}
            onSelectAvatar={setPickedAvatar}
          />

          <Panel className="flex flex-col gap-3">
            {!NO_DIRECTION_TYPES.has(tab.type) ? (
              <>
                <Label htmlFor="direction">Direction (optional)</Label>
                <textarea
                  id="direction"
                  rows={3}
                  value={prompts[tab.type] ?? ""}
                  onChange={(e) => setPrompts((p) => ({ ...p, [tab.type]: e.target.value }))}
                  placeholder={`What should the new ${tab.label.toLowerCase()} explore? ${tab.directionHint ?? "e.g. a curiosity-led angle, a calmer tone…"}`}
                  disabled={!analyzed}
                  className="w-full resize-y rounded-sm border border-line bg-surface px-2.5 py-2 font-prose text-body text-ink outline-none placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-accent-border disabled:opacity-40"
                />
              </>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-caption text-ink-3">
                {analyzed ? tab.description : "Analyze the video first."}
              </span>
              <Button
                variant={analyzed ? "primary" : "secondary"}
                onClick={generate}
                disabled={!analyzed || busy !== null}
              >
                <Sparkles className="size-3.5" />
                Generate {tab.label}
              </Button>
            </div>
          </Panel>

          {iterations.length ? (
            <div className="flex flex-col gap-4">
              {iterations.map((it) => (
                <IterationCard
                  key={it.id}
                  iteration={it}
                  isFavorite={(i) => isFavorite({ creativeId: creative.id, type: it.type, iterationId: it.id, itemIndex: i })}
                  onToggleFavorite={(i) => toggle({ creativeId: creative.id, type: it.type, iterationId: it.id, itemIndex: i })}
                />
              ))}
            </div>
          ) : (
            <EmptyState title={`No ${tab.label.toLowerCase()} generated yet`}>
              Generated iterations will appear here, newest first.
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}
