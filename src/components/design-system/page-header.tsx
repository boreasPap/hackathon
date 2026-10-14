import * as React from "react";
import { cn } from "@/lib/utils";

// PageHeader (docs/frontend/components/page-header.md, design doc §8.10).
// The same on every page:
// title, 8px, a one-line description, page actions on the right, and the
// filter bar 16px below. Page content starts 32px under it.

export type PageHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Page actions on the right; one primary at most (design doc §1). */
  actions?: React.ReactNode;
  /** The filter bar: FilterPill / DropdownPanel / DateRangePicker / FilterToggle. */
  filters?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, actions, filters, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4 font-bomstad", className)}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-page-title text-ink">{title}</h1>
          {description ? <p className="text-page-desc text-ink-3">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
    </header>
  );
}
