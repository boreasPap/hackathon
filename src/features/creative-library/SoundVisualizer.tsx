"use client";

import * as React from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDemoTrack } from "./demo-tracks";
import { WAVE_BARS } from "./WaveformPlayer";

const BAR_COUNT = 56;
const PLAY_EVENT = "asset-library-audio-play";

const KEYFRAMES = `
@keyframes al-viz { 0%, 100% { transform: scaleY(0.18) } 50% { transform: scaleY(1) } }
@keyframes al-viz-halo { 0%, 100% { opacity: 0.35; transform: scale(0.96) } 50% { opacity: 0.7; transform: scale(1.04) } }
@media (prefers-reduced-motion: reduce) { [data-viz] { animation: none !important } }
`;

// Stable per-bar timing so the motion looks organic rather than in lockstep.
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  const shape = Math.sin((i / (BAR_COUNT - 1)) * Math.PI);
  // Rounded so the server and the browser render identical styles.
  const round = (n: number) => Math.round(n * 100) / 100;
  return { delay: round(r * 1.2), duration: round(0.9 + r * 0.9), height: round(0.35 + shape * 0.65) };
});

/** An always-moving equalizer; its play button previews a demo track and drives the bars harder. */
export function SoundVisualizer({ seed, label }: { seed: string; label: string }) {
  const audio = React.useRef<HTMLAudioElement>(null);
  const [src, setSrc] = React.useState<string>();
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    void getDemoTrack(`${seed}-viz`, 5, WAVE_BARS).then((t) => alive && setSrc(t.src));
    return () => {
      alive = false;
    };
  }, [seed]);

  React.useEffect(() => {
    const pauseOthers = (e: Event) => {
      if ((e as CustomEvent<HTMLAudioElement>).detail !== audio.current) audio.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, pauseOthers);
    return () => window.removeEventListener(PLAY_EVENT, pauseOthers);
  }, []);

  return (
    <div className="relative flex h-24 items-center gap-4 overflow-hidden rounded-xl border border-accent-border bg-surface px-4">
      <style>{KEYFRAMES}</style>
      {/* Soft halo behind the bars. */}
      <div
        aria-hidden
        data-viz
        className="pointer-events-none absolute inset-y-2 right-8 left-20 rounded-full blur-2xl"
        style={{
          background: "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 55%, transparent), transparent)",
          animation: `al-viz-halo ${playing ? 1.2 : 3}s ease-in-out infinite`,
        }}
      />
      <button
        type="button"
        disabled={!src}
        onClick={() => {
          const el = audio.current;
          if (!el) return;
          if (el.paused) void el.play();
          else el.pause();
        }}
        aria-label={playing ? `Pause ${label}` : `Play ${label}`}
        className={cn(
          "relative z-10 grid size-9 shrink-0 place-items-center rounded-full border border-accent-border bg-accent-subtle text-accent-active transition-colors hover:bg-accent-muted focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none disabled:opacity-60",
          playing && "bg-accent-muted",
        )}
      >
        {!src ? (
          <Loader2 className="size-4 animate-spin" />
        ) : playing ? (
          <Pause className="size-3.5 fill-current" />
        ) : (
          <Play className="ml-0.5 size-3.5 fill-current" />
        )}
      </button>
      <div aria-hidden className="relative z-10 flex h-14 min-w-0 flex-1 items-center justify-between">
        {BARS.map((b, i) => (
          <span
            key={i}
            data-viz
            className="w-[3px] shrink-0 rounded-full bg-accent"
            style={{
              height: `${b.height * 100}%`,
              opacity: 0.55 + b.height * 0.45,
              animation: `al-viz ${playing ? b.duration * 0.45 : b.duration}s ease-in-out ${b.delay}s infinite`,
            }}
          />
        ))}
      </div>
      {src ? (
        <audio
          ref={audio}
          src={src}
          preload="auto"
          onPlay={(e) => {
            setPlaying(true);
            window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: e.currentTarget }));
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      ) : null}
    </div>
  );
}
