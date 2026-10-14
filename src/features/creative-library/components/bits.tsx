"use client";

import { Heart } from "lucide-react";
import type * as React from "react";
import { IconButton } from "@/components/design-system";
import { cn } from "@/lib/utils";
import type { JobStatus } from "../types";

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-surface p-6", className)} {...props} />;
}

export function Tag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-sm bg-accent-muted px-2 py-0.5 text-caption text-ink-2", className)}
      {...props}
    />
  );
}

export function Overline({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-overline text-ink-3 uppercase", className)} {...props} />;
}

const STATUS_STYLE: Record<JobStatus, string> = {
  idle: "bg-muted text-ink-2",
  running: "bg-info-bg text-accent-text",
  completed: "bg-success-bg text-success",
  failed: "bg-danger-bg text-danger",
};

export function StatusBadge({ status, labels }: { status: JobStatus; labels?: Partial<Record<JobStatus, string>> }) {
  const text = labels?.[status] ?? { idle: "Not started", running: "Running", completed: "Completed", failed: "Failed" }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-caption font-semibold whitespace-nowrap",
        STATUS_STYLE[status],
      )}
    >
      {status === "running" ? <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden /> : null}
      {text}
    </span>
  );
}

export function FavoriteButton({
  on,
  onToggle,
  label,
  className,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <IconButton
      aria-label={on ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
      aria-pressed={on}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(on && "text-accent-text", className)}
    >
      <Heart className={cn(on && "fill-current")} />
    </IconButton>
  );
}

export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    // The baseline is an inset shadow, not a border: tabs draw their underline
    // on top of it without overflowing, so no scrollbar shows. On narrow
    // screens the row still swipes sideways, with the scrollbar hidden.
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 overflow-x-auto font-bomstad shadow-[inset_0_-1px_0_var(--border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 pt-1 pb-2.5 text-body whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-border",
              active ? "border-accent text-ink" : "border-transparent text-ink-3 hover:text-ink-2",
            )}
          >
            {tab.label}
            {tab.count ? (
              <span className="rounded-xs bg-muted px-1.5 text-caption font-num text-ink-2 tabular-nums">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
      <p className="text-body font-semibold text-ink">{title}</p>
      {children ? <div className="max-w-md text-body-sm text-ink-3">{children}</div> : null}
    </div>
  );
}
