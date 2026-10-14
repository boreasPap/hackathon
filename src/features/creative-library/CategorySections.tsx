"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Clapperboard, Sparkles } from "lucide-react";
import { IconButton } from "@/components/design-system";
import { cn } from "@/lib/utils";
import { CreativeCard, SectionTitle } from "./parts";
import type { CreativeSummary } from "./types";

/** A row that scrolls sideways, with arrow buttons next to its title. */
export function Carousel({
  title,
  description,
  icon,
  ai = false,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** AI suggestions sit in their own tinted box, apart from the originals. */
  ai?: boolean;
  children: React.ReactNode;
}) {
  const track = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ start: true, end: false });
  const scroll = (direction: 1 | -1) =>
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.8, behavior: "smooth" });
  const updateEdges = React.useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  React.useEffect(() => {
    const el = track.current;
    if (!el) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges, children]);

  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3",
        ai && "rounded-2xl border border-accent-border bg-accent-subtle p-4 md:p-5",
      )}
    >
      <SectionTitle
        badge={
          ai ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-micro font-semibold text-accent-contrast">
              <Sparkles className="size-3" />
              AI
            </span>
          ) : undefined
        }
        title={title}
        description={description}
        icon={icon}
        aside={
          <div className="flex items-center gap-1">
            <IconButton size="sm" bordered aria-label={`Scroll ${title} left`} disabled={edges.start} onClick={() => scroll(-1)}>
              <ChevronLeft className="size-4" />
            </IconButton>
            <IconButton size="sm" bordered aria-label={`Scroll ${title} right`} disabled={edges.end} onClick={() => scroll(1)}>
              <ChevronRight className="size-4" />
            </IconButton>
          </div>
        }
      />
      <div
        ref={track}
        onScroll={updateEdges}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  );
}

export function CreativeCarousel({ title, description, creatives }: { title: string; description?: string; creatives: CreativeSummary[] }) {
  return (
    <Carousel title={title} description={description} icon={Clapperboard}>
      {creatives.map((creative) => (
        <div key={creative.id} className="w-52 shrink-0 snap-start">
          <CreativeCard creative={creative} />
        </div>
      ))}
    </Carousel>
  );
}
