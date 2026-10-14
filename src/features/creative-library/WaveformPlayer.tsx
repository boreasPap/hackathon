"use client";

import * as React from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDemoTrack, getFileTrack } from "./demo-tracks";

/** Peaks are computed at this resolution and resampled to the bars that fit. */
export const WAVE_BARS = 240;
const BAR_PITCH = 5; // 3px bar + 2px gap
const PLAY_EVENT = "asset-library-audio-play";

// A calm, stable placeholder shape per seed while the real one loads.
function seededPeaks(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const raw = Array.from({ length: WAVE_BARS }, (_, i) => {
    h = Math.imul(h ^ (i + 1), 16777619);
    return ((h >>> 0) % 100) / 100;
  });
  return raw.map((_, i) => {
    const near = raw.slice(Math.max(0, i - 3), i + 4);
    return 0.3 + (near.reduce((a, b) => a + b, 0) / near.length) * 0.6;
  });
}

function resample(peaks: number[], count: number) {
  return Array.from({ length: count }, (_, i) => {
    const from = Math.floor((i * peaks.length) / count);
    const to = Math.max(from + 1, Math.floor(((i + 1) * peaks.length) / count));
    return Math.max(...peaks.slice(from, to));
  });
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type Track = { src: string; peaks?: number[] };

/** A file to play (its real waveform is read from it), or a demo preview slot. */
export type WaveSource = { file: string; decode?: boolean } | { demo: string; variant: number };

/**
 * A waveform player: play button, bars that fill as it plays, a playhead with
 * the current time and the total length. Only one player on the page plays at
 * a time.
 */
/** Keyframes for `animated` players; render once on a page that uses them. */
export const WAVE_KEYFRAMES = `
@keyframes al-breathe { 0%, 100% { transform: scaleY(1) } 50% { transform: scaleY(0.8) } }
@keyframes al-bar { 0%, 100% { transform: scaleY(1) } 50% { transform: scaleY(0.35) } }
@keyframes al-glow {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent) }
  50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 0%, transparent) }
}
@media (prefers-reduced-motion: reduce) { [data-wave-bar] { animation: none !important } }
`;

export function WaveformPlayer({
  source,
  label,
  animated = false,
  size = "md",
  onPlayback,
}: {
  source: WaveSource;
  label: string;
  /** Bars breathe while idle and dance while playing (needs WAVE_KEYFRAMES on the page). */
  animated?: boolean;
  /** `sm` for lists: soft button, no time label above the playhead. */
  size?: "sm" | "md";
  /** Called as playback starts, stops and moves, e.g. to keep a video in step. */
  onPlayback?: (state: { playing: boolean; time: number }) => void;
}) {
  const file = "file" in source ? source.file : undefined;
  // Reading a file's real waveform downloads all of it; long lists skip that.
  const decode = "file" in source ? source.decode !== false : true;
  const demo = "demo" in source ? source.demo : undefined;
  const variant = "demo" in source ? source.variant : 0;
  const seed = file ?? demo ?? label;
  const audio = React.useRef<HTMLAudioElement>(null);
  const [track, setTrack] = React.useState<Track | null>(file ? { src: file } : null);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const fallback = React.useMemo(() => seededPeaks(seed), [seed]);
  const wave = React.useRef<HTMLDivElement>(null);
  const [barCount, setBarCount] = React.useState(0);
  const peaks = React.useMemo(
    () => (barCount ? resample(track?.peaks ?? fallback, barCount) : []),
    [track, fallback, barCount],
  );

  React.useEffect(() => {
    const el = wave.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBarCount(Math.max(16, Math.floor((entry.contentRect.width + 2) / BAR_PITCH))),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const progress = duration ? time / duration : 0;

  React.useEffect(() => {
    let alive = true;
    const loading = file ? (decode ? getFileTrack(file, WAVE_BARS) : null) : demo ? getDemoTrack(demo, variant, WAVE_BARS) : null;
    // A file still plays when its waveform cannot be read; the placeholder shape stays.
    loading?.then((t) => alive && setTrack(t)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [file, decode, demo, variant]);

  // The metadata of a server-rendered <audio> can load before React listens for it.
  React.useEffect(() => {
    const el = audio.current;
    if (el && el.readyState >= 1) setDuration(el.duration);
  }, [track]);

  React.useEffect(() => {
    const pauseOthers = (e: Event) => {
      if ((e as CustomEvent<HTMLAudioElement>).detail !== audio.current) audio.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, pauseOthers);
    return () => window.removeEventListener(PLAY_EVENT, pauseOthers);
  }, []);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audio.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1) * el.duration;
  };

  const ready = Boolean(track);

  return (
    <div data-playing={playing} className={cn("flex items-center", size === "sm" ? "gap-2" : "gap-3 pt-3")}>
      <button
        type="button"
        onClick={toggle}
        disabled={!ready}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className={cn(
          "grid shrink-0 place-items-center rounded-full",
          size === "sm"
            ? "size-8 bg-accent-subtle text-accent-active hover:bg-accent-muted"
            : "size-9 bg-accent text-accent-contrast hover:bg-accent-hover",
          "transition-colors focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none disabled:bg-muted disabled:text-ink-3",
        )}
      >
        {!ready ? (
          <Loader2 className={size === "sm" ? "size-3.5 animate-spin" : "size-4 animate-spin"} />
        ) : playing ? (
          <Pause className={cn(size === "sm" ? "size-3" : "size-3.5", "fill-current")} />
        ) : (
          <Play className={cn(size === "sm" ? "ml-px size-3" : "ml-0.5 size-3.5", "fill-current")} />
        )}
      </button>

      <div
        role="slider"
        tabIndex={ready ? 0 : -1}
        aria-label={`${label} position`}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
        onClick={seek}
        onKeyDown={(e) => {
          const el = audio.current;
          if (!el || !el.duration) return;
          if (e.key === "ArrowRight") el.currentTime = Math.min(el.currentTime + 5, el.duration);
          if (e.key === "ArrowLeft") el.currentTime = Math.max(el.currentTime - 5, 0);
        }}
        className={cn(
          "relative flex min-w-0 flex-1 items-center outline-none focus-visible:ring-2 focus-visible:ring-accent-border",
          size === "sm" ? "h-8" : "h-9",
          ready && "cursor-pointer",
        )}
      >
        <div ref={wave} className={cn("flex w-full items-center justify-between overflow-hidden", size === "sm" ? "h-7" : "h-8")}>
          {peaks.map((p, i) => (
            <span
              key={i}
              className={cn(
                "w-[3px] shrink-0 rounded-full transition-colors",
                i / peaks.length < progress ? "bg-accent" : "bg-line-strong",
              )}
              data-wave-bar
              style={{
                height: `${Math.max(p, 0.1) * 100}%`,
                animation: animated
                  ? playing
                    ? `al-bar 0.9s ease-in-out ${(i % 9) * 0.07}s infinite`
                    : `al-breathe 2.6s ease-in-out ${(i % 14) * 0.12}s infinite`
                  : undefined,
              }}
            />
          ))}
        </div>
        {time > 0 ? (
          <span
            aria-hidden
            className={cn("pointer-events-none absolute w-px bg-ink", size === "sm" ? "top-0 bottom-0" : "-top-2.5 bottom-0.5")}
            style={{ left: `${progress * 100}%` }}
          >
            {size === "sm" ? null : (
              <span className="absolute -top-1 left-1 font-num text-micro font-semibold text-ink tabular-nums">
                {formatTime(time)}
              </span>
            )}
          </span>
        ) : null}
      </div>

      <span className={cn("shrink-0 text-right font-num text-ink-3 tabular-nums", size === "sm" ? "w-8 text-caption" : "w-9 text-caption")}>
        {formatTime(duration)}
      </span>

      {track ? (
        <audio
          ref={audio}
          src={track.src}
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={(e) => {
            setPlaying(true);
            onPlayback?.({ playing: true, time: e.currentTarget.currentTime });
            window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: e.currentTarget }));
          }}
          onPause={(e) => {
            setPlaying(false);
            onPlayback?.({ playing: false, time: e.currentTarget.currentTime });
          }}
          onEnded={() => {
            setPlaying(false);
            setTime(0);
            onPlayback?.({ playing: false, time: 0 });
          }}
          onTimeUpdate={(e) => {
            setTime(e.currentTarget.currentTime);
            onPlayback?.({ playing: !e.currentTarget.paused, time: e.currentTarget.currentTime });
          }}
        />
      ) : null}
    </div>
  );
}
