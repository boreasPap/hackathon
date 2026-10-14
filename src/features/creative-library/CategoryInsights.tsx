"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Lightbulb, Sparkles, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryInsights } from "./insights";
import type { CategoryId } from "./sample-data";

const ROTATE_MS = 3000;

const GROUPS = [
  { key: "working", title: "What’s working", icon: CheckCircle2, tone: "text-success" },
  { key: "ideas", title: "Ideas to try", icon: Lightbulb, tone: "text-accent-active" },
  { key: "watchOuts", title: "Watch out for", icon: TriangleAlert, tone: "text-warning" },
] as const;

/** AI notes on a category: what the top creatives share, fresh ideas, and things to be careful with. */
export function CategoryInsights({ categoryId, name }: { categoryId: CategoryId; name: string }) {
  const insights = getCategoryInsights(categoryId);
  // Collapsed, each group shows one point and moves to the next every 3s
  // (paused while hovered); View more opens them all.
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (expanded || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setStep((s) => s + 1), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [expanded, paused]);

  useEffect(() => setStep(0), [categoryId]);
  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="flex flex-col gap-2.5 rounded-2xl border border-accent-border bg-accent-subtle p-3">
      <h2 className="flex items-center gap-2 px-1 text-body-sm font-semibold text-ink">
        <span className="grid size-5 place-items-center rounded-md bg-accent text-accent-contrast">
          <Sparkles className="size-3" />
        </span>
        AI Insights
        <span className="font-normal text-caption text-ink-3">· {name} creatives</span>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto inline-flex items-center gap-1 rounded-md font-bomstad text-caption font-semibold text-accent-active hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {expanded ? "View less" : "View more"}
          <ChevronDown className={cn("size-3.5 transition-transform", expanded && "rotate-180")} />
        </button>
      </h2>
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
        {GROUPS.map(({ key, title, icon: Icon, tone }) => (
          <div key={key} className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-3 py-2.5">
            <h3 className="flex items-center gap-1.5 text-caption font-semibold text-ink">
              <Icon className={cn("size-3.5", tone)} />
              {title}
            </h3>
            <ul className="flex flex-col gap-1 overflow-hidden">
              {(expanded ? insights[key] : [insights[key][step % insights[key].length]]).map((text) => (
                <li key={text} className={cn("flex gap-1.5 font-prose text-caption leading-snug text-ink-2", !expanded && "min-h-[2lh] animate-in duration-700 ease-out fade-in slide-in-from-bottom-2")}>
                  <span aria-hidden className={cn("mt-1.5 size-1 shrink-0 rounded-full bg-current", tone)} />
                  <span className={expanded ? undefined : "line-clamp-2"}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
