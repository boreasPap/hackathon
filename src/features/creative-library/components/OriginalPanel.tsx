import type * as React from "react";
import { cn } from "@/lib/utils";
import type { AvatarCandidate, CreativeExtraction, IterationType } from "../types";
import { EmptyState, Overline, Panel } from "./bits";

function seconds(start?: number, end?: number): string | null {
  if (start == null && end == null) return null;
  const f = (n?: number) => (n == null ? "?" : `${n.toFixed(1).replace(/\.0$/, "")}s`);
  return `${f(start)} – ${f(end)}`;
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-ink-3">{label}</span>
      <span className="text-body text-ink">{value}</span>
    </div>
  );
}

function Audio({ label, src }: { label: string; src?: string }) {
  if (!src) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption text-ink-3">{label}</span>
      <audio controls preload="none" src={src} className="w-full" />
    </div>
  );
}

function sec(n?: number): string | null {
  return n == null ? null : `${n.toFixed(1).replace(/\.0$/, "")}s`;
}

function AvatarCandidates({ candidates, chosen }: { candidates: AvatarCandidate[]; chosen?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption text-ink-3">Candidate frames, best first</span>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {candidates.map((c) => (
          <li key={c.url} className="flex min-w-0 flex-col gap-1">
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.url}
                alt={`Avatar candidate at ${sec(c.atSec) ?? "an unknown second"}`}
                className={cn(
                  "aspect-9/16 w-full rounded-sm bg-muted object-cover",
                  c.url === chosen && "ring-2 ring-accent ring-offset-2 ring-offset-surface",
                )}
              />
            </a>
            <div className="flex items-baseline justify-between gap-2 text-caption">
              <span className={c.url === chosen ? "font-semibold text-accent-text" : "text-ink-3"}>
                {c.url === chosen ? "Chosen" : "Candidate"}
              </span>
              <span className="font-num text-ink-3 tabular-nums">
                {[sec(c.atSec), c.score != null ? `${c.score}/10` : null].filter(Boolean).join(" · ")}
              </span>
            </div>
            {c.notes ? <p className="font-prose text-caption text-ink-3">{c.notes}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Missing({ what }: { what: string }) {
  return <p className="text-body-sm text-ink-3">The analysis found no {what} in this video.</p>;
}

/** The original part of the creative this tab iterates on, as the analysis extracted it. */
export function OriginalPanel({ type, extracted }: { type: IterationType; extracted: CreativeExtraction | null }) {
  if (!extracted) {
    return (
      <EmptyState title="Not analyzed yet">
        Analyze the video to extract its wall texts, voiceover, avatar, music and layout. Iterations are generated
        from those.
      </EmptyState>
    );
  }

  return (
    <Panel className="flex flex-col gap-4">
      <Overline>Original</Overline>
      {type === "wallText" ? (
        extracted.wallTexts.length ? (
          <ol className="flex flex-col gap-2">
            {extracted.wallTexts.map((w, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 rounded-sm bg-muted px-3 py-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-body text-ink">{w.text}</span>
                  {w.style || w.position ? (
                    <span className="text-caption text-ink-3">
                      {[w.style, w.position, w.persistent ? "persistent" : null].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </div>
                <span className="shrink-0 font-num text-caption text-ink-3 tabular-nums">
                  {[w.role, seconds(w.startSec, w.endSec)].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <Missing what="wall texts" />
        )
      ) : null}

      {type === "voiceover" ? (
        extracted.voiceover ? (
          <div className="flex flex-col gap-3">
            <Field label="Speaker" value={extracted.voiceover.speaker} />
            <p className="font-prose text-body whitespace-pre-line text-ink">{extracted.voiceover.script}</p>
            {extracted.voiceover.segments?.length ? (
              <ol className="flex flex-col gap-2">
                {extracted.voiceover.segments.map((s, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 rounded-sm bg-muted px-3 py-2">
                    <span className="font-prose text-body-sm text-ink">{s.text}</span>
                    <span className="shrink-0 font-num text-caption text-ink-3 tabular-nums">
                      {seconds(s.startSec, s.endSec)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : (
          <Missing what="voiceover" />
        )
      ) : null}

      {type === "similarAvatar" || type === "avatarVariation" ? (
        extracted.avatar ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {extracted.avatar.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={extracted.avatar.imageUrl} alt="Avatar" className="h-40 w-28 shrink-0 rounded-sm object-cover" />
              ) : null}
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Description" value={extracted.avatar.description} />
                </div>
                <Field label="Gender" value={extracted.avatar.gender} />
                <Field label="Age range" value={extracted.avatar.ageRange} />
                <Field label="Appearance" value={extracted.avatar.appearance} />
                <Field label="Setting" value={extracted.avatar.setting} />
                <Field label="Wardrobe" value={extracted.avatar.wardrobe} />
                <Field label="Framing" value={extracted.avatar.framing} />
                <Field
                  label="Frame taken at"
                  value={sec(extracted.avatar.frameSec) ? <span className="font-num tabular-nums">{sec(extracted.avatar.frameSec)}</span> : undefined}
                />
                <div className="sm:col-span-2">
                  <Field label="Why this frame" value={extracted.avatar.reason} />
                </div>
              </div>
            </div>
            {extracted.avatar.candidates?.length ? (
              <AvatarCandidates candidates={extracted.avatar.candidates} chosen={extracted.avatar.imageUrl} />
            ) : null}
          </div>
        ) : (
          <Missing what="avatar" />
        )
      ) : null}

      {type === "music" ? (
        extracted.music ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Description" value={extracted.music.description} />
            </div>
            <Field label="Genre" value={extracted.music.genre} />
            <Field label="Mood" value={extracted.music.mood} />
            <Field label="Energy" value={extracted.music.energy} />
            <Field
              label="Tempo"
              value={extracted.music.tempoBpm ? <span className="font-num tabular-nums">{extracted.music.tempoBpm} BPM</span> : undefined}
            />
            <div className="flex flex-col gap-3 sm:col-span-2">
              <Audio label="Instrumental" src={extracted.music.instrumentalUrl} />
              <Audio label="Original audio" src={extracted.music.audioUrl} />
              {extracted.music.stemsUrl && !extracted.music.instrumentalUrl ? (
                <p className="text-body-sm text-ink-3">
                  The instrumental could not be taken from the stems.{" "}
                  <a href={extracted.music.stemsUrl} className="text-accent-text underline" target="_blank" rel="noreferrer">
                    Download all stems
                  </a>
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <Missing what="music" />
        )
      ) : null}

      {type === "template" ? (
        extracted.template ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Layout" value={extracted.template.layout} />
              <Field label="Aspect ratio" value={extracted.template.aspectRatio} />
              <Field label="Visual style" value={extracted.template.visualStyle} />
              <Field
                label="Scene changes"
                value={
                  extracted.template.sceneChangesSec?.length ? (
                    <span className="font-num tabular-nums">{extracted.template.sceneChangesSec.map(sec).join(", ")}</span>
                  ) : undefined
                }
              />
              <Field
                label="End card from"
                value={sec(extracted.template.endCardSec) ? <span className="font-num tabular-nums">{sec(extracted.template.endCardSec)}</span> : undefined}
              />
            </div>
            {extracted.template.frames?.length ? (
              <div className="flex flex-wrap gap-3">
                {extracted.template.frames.map((f) => (
                  <figure key={f.url} className="flex w-28 flex-col gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.url} alt={f.label} className="h-40 w-28 rounded-sm object-cover" />
                    <figcaption className="text-caption text-ink-3">
                      {f.label}
                      {sec(f.atSec) ? <span className="font-num tabular-nums"> · {sec(f.atSec)}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
            {extracted.template.layoutSegments?.length ? (
              <ol className="flex flex-col gap-2">
                {extracted.template.layoutSegments.map((s, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 rounded-sm bg-muted px-3 py-2">
                    <span className="text-body text-ink">
                      {s.layoutType}
                      {s.regions.length ? (
                        <span className="text-body-sm text-ink-2"> · {s.regions.map((r) => r.role).join(", ")}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-num text-caption text-ink-3 tabular-nums">{seconds(s.startSec, s.endSec)}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            {extracted.template.spriteSheetUrl ? (
              <a
                href={extracted.template.spriteSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-body-sm text-accent-text underline"
              >
                Open the frame sheet (every 2 seconds)
              </a>
            ) : null}
            {extracted.template.scenes?.length ? (
              <ol className="flex flex-col gap-2">
                {extracted.template.scenes.map((s) => (
                  <li key={s.index} className="flex flex-col gap-0.5 rounded-sm bg-muted px-3 py-2">
                    <span className="text-caption text-ink-3">
                      Scene <span className="font-num tabular-nums">{s.index}</span>
                      {seconds(s.startSec, s.endSec) ? ` · ${seconds(s.startSec, s.endSec)}` : ""}
                    </span>
                    <span className="text-body text-ink">{s.description}</span>
                    {s.onScreenText ? <span className="text-body-sm text-ink-2">“{s.onScreenText}”</span> : null}
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
        ) : (
          <Missing what="template" />
        )
      ) : null}
    </Panel>
  );
}
