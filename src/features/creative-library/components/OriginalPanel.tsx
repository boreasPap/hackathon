import type * as React from "react";
import type { CreativeExtraction, IterationType } from "../types";
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
                <span className="text-body text-ink">{w.text}</span>
                <span className="shrink-0 text-caption text-ink-3">
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
          </div>
        ) : (
          <Missing what="voiceover" />
        )
      ) : null}

      {type === "similarAvatar" || type === "avatarVariation" ? (
        extracted.avatar ? (
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
            </div>
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
            </div>
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
