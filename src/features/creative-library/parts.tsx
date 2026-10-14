"use client";

import Link from "next/link";
import * as React from "react";
import toast from "react-hot-toast";
import { ChevronRight, MicVocal, Copy, Download, Heart, LayoutTemplate, Music, Play, Sparkles, Type, UserRoundPen, UsersRound } from "lucide-react";
import { IconButton } from "@/components/design-system";
import { cn } from "@/lib/utils";
import type { FavoriteTarget } from "./client";
import { creativeHref, creativeLabel } from "./paths";
import { type SampleFavoriteKind, sampleFavoriteKey, useSampleFavorites } from "./sample-favorites";
import type { CreativeSummary, IterationType } from "./types";
import { useFavoritesContext } from "./useFavorites";


export const TYPE_ICONS: Record<IterationType, React.ComponentType<{ className?: string }>> = {
  wallText: Type,
  voiceover: MicVocal,
  similarAvatar: UsersRound,
  avatarVariation: UserRoundPen,
  music: Music,
  template: LayoutTemplate,
};

export function TypeIcon({ type, className }: { type: IterationType; className?: string }) {
  const Icon = TYPE_ICONS[type];
  return <Icon className={className} />;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 font-bomstad text-body-sm text-ink-3">
      {items.map((item, i) => (
        <React.Fragment key={`${i}-${item.label}`}>
          {i > 0 ? <ChevronRight aria-hidden className="size-3.5" /> : null}
          {item.href ? (
            <Link href={item.href} className="rounded-xs transition-colors hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-2">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function SectionTitle({
  title,
  description,
  aside,
  icon: Icon,
  badge,
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-contrast">
            <Icon className="size-4.5" />
          </span>
        ) : null}
        <div className="flex flex-col gap-0.5">
          <h2 className="flex items-center gap-2 text-page-desc font-semibold text-ink">
            {title}
            {badge}
          </h2>
          {description ? <p className="text-body-sm text-ink-3">{description}</p> : null}
        </div>
      </div>
      {aside}
    </div>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-xs bg-muted px-2 font-bomstad text-caption text-ink-2", className)}>
      {children}
    </span>
  );
}

function HeartButton({ saved, onToggle, className }: { saved: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none",
        saved
          ? "border-accent-border bg-accent-subtle text-accent-text"
          : "border-line bg-surface text-ink-2 hover:bg-muted hover:text-ink",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}

/** A heart for a creative or one result of an iteration; saved on the server. */
export function FavoriteButton({ target, className }: { target: FavoriteTarget; className?: string }) {
  const { isFavorite, toggle } = useFavoritesContext();
  return (
    <HeartButton
      saved={isFavorite(target)}
      onToggle={() => toast.success(toggle(target) ? "Saved to favorites" : "Removed from favorites")}
      className={className}
    />
  );
}

/** A heart for sample content (generator examples, studio sounds); saved in this browser. */
export function SampleFavoriteButton({
  creativeId,
  kind,
  iteration = 0,
  className,
}: {
  creativeId: string;
  kind: SampleFavoriteKind;
  iteration?: number;
  className?: string;
}) {
  const { isSaved, toggle } = useSampleFavorites();
  return (
    <HeartButton
      saved={isSaved(sampleFavoriteKey(creativeId, kind, iteration))}
      onToggle={() => toast.success(toggle(creativeId, kind, iteration) ? "Saved to favorites" : "Removed from favorites")}
      className={className}
    />
  );
}

export const creativeTarget = (creativeId: string): FavoriteTarget => ({
  creativeId,
  type: "creative",
  iterationId: null,
  itemIndex: null,
});

export function CreativeCard({ creative }: { creative: CreativeSummary }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-popover">
      <Link
        href={creativeHref(creative)}
        className="flex flex-1 flex-col focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {creative.posterPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={creative.posterPath}
              alt={`${creative.id} reference frame`}
              loading="lazy"
              className="absolute inset-0 size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
          <span className="absolute right-3 bottom-3 grid size-8 place-items-center rounded-full bg-surface/90 text-ink shadow-sm">
            <Play className="size-3.5 fill-current" />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <span className="text-caption text-ink-3">{creative.tags[0] ?? "No category"}</span>
          <h3 className="font-num text-body font-semibold text-ink">{creativeLabel(creative.id)}</h3>
          <p className="line-clamp-2 min-h-9 text-body-sm text-ink-2">{creative.hook || "Opening text not added yet"}</p>
          <span className="mt-2 text-body-sm text-accent-text">View original & iterations →</span>
        </div>
      </Link>
      <FavoriteButton target={creativeTarget(creative.id)} className="absolute top-3 right-3" />
    </div>
  );
}

export const tabClass = (active: boolean) =>
  cn(
    "h-11 rounded-t-lg border px-3 xl:px-5 font-bomstad text-body transition-colors focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none",
    active
      ? // --accent-text is plain ink in light Lilac / Green, so light mode uses the accent's text shade.
        "border-line border-b-surface bg-surface text-accent-active [.dark_&]:text-accent-text"
      : "border-transparent text-ink-3 hover:text-ink",
  );

export function Tabs({
  value,
  onChange,
  options,
  leading,
}: {
  value: string;
  /** Rendered before the tabs, e.g. a toggle styled with `tabClass`. */
  leading?: React.ReactNode;
  onChange: (value: string) => void;
  /** With an icon, the tab shows only the icon (filled while selected); the label names it for screen readers. */
  options: { value: string; label: string; icon?: React.ComponentType<{ className?: string }> }[];
}) {
  return (
    <div role="tablist" aria-label="Category" className="-mb-px flex flex-wrap">
      {leading}
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={o.icon ? o.label : undefined}
            title={o.icon ? o.label : undefined}
            onClick={() => onChange(o.value)}
            className={tabClass(active)}
          >
            {o.icon ? <o.icon className={cn("size-4.5", active && "fill-current")} /> : o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Without `href` (nothing generated yet) it shows disabled. */
export function DownloadButton({
  href,
  filename,
  label,
  className,
}: {
  href?: string;
  filename?: string;
  label: string;
  className?: string;
}) {
  if (!href) {
    return (
      <IconButton size="sm" aria-label={label} title="Available once the visual is generated" disabled className={className}>
        <Download className="size-3.5" />
      </IconButton>
    );
  }
  return (
    <IconButton size="sm" aria-label={label} title={label} asChild className={className}>
      <a href={href} download={filename} target="_blank" rel="noopener noreferrer">
        <Download className="size-3.5" />
      </a>
    </IconButton>
  );
}

export function CopyTextButton({ text }: { text: string }) {
  return (
    <IconButton
      size="sm"
      aria-label="Copy text"
      title={text ? "Copy text" : "No text to copy yet"}
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast.success("Text copied");
        } catch {
          toast.error("Copy is unavailable in this browser. Select the text manually.");
        }
      }}
    >
      <Copy className="size-3.5" />
    </IconButton>
  );
}

/** Sets AI suggestions apart from the original material above them. */
export function AiPanel({
  title = "AI Suggested",
  note,
  actions,
  children,
}: {
  title?: string;
  note?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-5 rounded-2xl border border-accent-border bg-accent-subtle p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-contrast">
          <Sparkles className="size-3.5" />
        </span>
        <h2 className="text-body font-semibold text-ink">{title}</h2>
        {note ? <span className="text-caption text-ink-3">· {note}</span> : null}
        {actions ? <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-line bg-surface p-6 text-body-sm text-ink-3">{children}</p>;
}
