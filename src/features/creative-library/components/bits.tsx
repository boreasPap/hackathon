"use client";

import { cn } from "@/lib/utils";
import type { JobStatus } from "../types";

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
