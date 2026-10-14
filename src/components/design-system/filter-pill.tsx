import * as React from "react";
import { cn } from "@/lib/utils";
import { SwitchTrack } from "./switch";
import { ChevronDownIcon } from "./icons/ui-icons";

// Filter bar triggers (docs/frontend/components/filter-pill.md, design doc
// §8.2). Both are 34px, r8, padding 6/10/6/12, gap 6.
// Labels, dates and the counter keep Bomstad digits, as in Figma.

const PILL =
  "inline-flex h-8.5 shrink-0 cursor-pointer items-center gap-1.5 rounded-sm border bg-surface pr-2.5 pl-3 font-bomstad text-body whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40";

const ICON =
  "flex size-4.75 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.75";

export type FilterPillProps = React.ComponentProps<"button"> & {
  icon?: React.ReactNode;
  label: React.ReactNode;
  // Number of selected values; the badge shows only above zero.
  count?: number;
  // Accent look (border, tint, text). The design doc calls it the open state.
  active?: boolean;
};

export function FilterPill({
  icon,
  label,
  count,
  active = false,
  className,
  type,
  ...props
}: FilterPillProps) {
  return (
    <button
      type={type ?? "button"}
      data-slot="filter-pill"
      data-active={active || undefined}
      className={cn(
        PILL,
        active ? "border-accent bg-accent-subtle text-accent-text" : "border-line text-ink-2 hover:bg-muted",
        className,
      )}
      {...props}
    >
      {icon ? <span className={ICON}>{icon}</span> : null}
      <span>{label}</span>
      {count != null && count > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-body-sm leading-4 text-accent-contrast tabular-nums">
          {count}
        </span>
      ) : null}
      <ChevronDownIcon className="ml-0.5 size-2.75 shrink-0" />
    </button>
  );
}

export type FilterToggleProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  icon?: React.ReactNode;
  label: React.ReactNode;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

// A pill that switches one option on or off. The whole pill is the switch;
// the icon stays in the accent.
export function FilterToggle({
  icon,
  label,
  checked,
  onCheckedChange,
  onClick,
  className,
  ...props
}: FilterToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-slot="filter-toggle"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onCheckedChange?.(!checked);
      }}
      className={cn(PILL, "border-line text-ink-2 hover:bg-muted", className)}
      {...props}
    >
      {icon ? <span className={cn(ICON, "text-accent")}>{icon}</span> : null}
      <span>{label}</span>
      <SwitchTrack checked={checked} />
    </button>
  );
}
