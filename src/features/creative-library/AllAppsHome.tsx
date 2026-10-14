"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { APPS, type App } from "./apps";

// Brand art keeps its own background, like the platform logos.
const ICON_TILE_BG = "#FFFFFF";
// Entrance: the word rises, the icons pop up one after another, then the line below fades in.
const INTRO_KEYFRAMES = `
@keyframes al-intro-rise { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: none } }
@keyframes al-intro-pop { 0% { opacity: 0; transform: translateY(48px) scale(0.6) } 70% { opacity: 1; transform: translateY(-6px) scale(1.04) } 100% { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { [data-intro] { animation: none !important } }
`;
const ICON_DELAY_MS = 70;
// How far the neighbours of a hovered icon step aside.
const SPREAD_PX = 14;

const TILT = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6", "-rotate-3", "rotate-2", "-rotate-6", "rotate-3", "-rotate-2"];

export function AppIcon({ app, className }: { app: App; className?: string }) {
  return (
    <span
      className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-[22%] border border-line", className)}
      style={app.icon ? { backgroundColor: ICON_TILE_BG } : undefined}
    >
      {app.icon ? (
        <Image
          src={app.icon}
          alt=""
          fill
          sizes="96px"
          className={app.mark ? "object-contain p-[14%]" : "object-cover"}
        />
      ) : (
        <span className="grid size-full place-items-center bg-accent-muted font-bomstad text-body font-semibold text-accent-text">
          {app.name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
      )}
    </span>
  );
}

export function AllAppsHome({ onSelectApp }: { onSelectApp: (app: string) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section className="flex flex-col gap-8">
      <style>{INTRO_KEYFRAMES}</style>
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 pt-10 pb-12 md:px-12">
        <h2
          data-intro
          style={{ animation: "al-intro-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          className="text-center font-bomstad text-[clamp(64px,12vw,176px)] leading-[0.9] font-semibold tracking-tight text-ink"
        >
          welcome
        </h2>
        <ul
          onMouseLeave={() => setHovered(null)}
          className="relative -mt-[clamp(4px,1.2vw,20px)] flex justify-center pl-2 lg:pl-3"
        >
          {APPS.map((app, i) => (
            <li
              key={app.id}
              className={cn("-ml-2 transition-transform duration-300 ease-out lg:-ml-3", hovered === i && "z-10")}
              style={{
                transform:
                  hovered === null || hovered === i ? undefined : `translateX(${i < hovered ? -SPREAD_PX : SPREAD_PX}px)`,
              }}
            >
              <span
                data-intro
                className="block"
                style={{
                  animation: `al-intro-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${250 + i * ICON_DELAY_MS}ms both`,
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onSelectApp(app.id)}
                  title={app.name}
                  aria-label={`Show ${app.name}`}
                  className={cn(
                    "block rounded-[22%] shadow-popover transition-transform duration-300 ease-out hover:-translate-y-2 hover:scale-115 hover:rotate-0 focus-visible:-translate-y-2 focus-visible:scale-115 focus-visible:rotate-0 focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none",
                    TILT[i % TILT.length],
                  )}
                >
                  <AppIcon app={app} className="size-11 sm:size-14 lg:size-20 2xl:size-24" />
                </button>
              </span>
            </li>
          ))}
        </ul>
        <p
          data-intro
          style={{ animation: `al-intro-rise 0.6s ease-out ${250 + APPS.length * ICON_DELAY_MS + 150}ms both` }}
          className="mx-auto mt-8 max-w-xl text-center text-page-desc text-ink-3"
        >
          Save ideas for your next creative.
        </p>
      </div>
    </section>
  );
}
