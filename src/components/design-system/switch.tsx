import * as React from "react";
import { cn } from "@/lib/utils";

// Switch (docs/frontend/components/switch.md, design doc §8.9): 35×19 track,
// 16px knob. Off is `bg-line`, the value the Bar chart screen shows.

export function SwitchTrack({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-4.75 w-8.75 shrink-0 rounded-full transition-colors",
        checked ? "bg-accent" : "bg-line",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 left-[1.5px] size-4 -translate-y-1/2 rounded-full bg-surface shadow-sm transition-transform",
          checked && "translate-x-4",
        )}
      />
    </span>
  );
}

export type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Switch({ checked, onCheckedChange, onClick, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-slot="switch"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) onCheckedChange?.(!checked);
      }}
      className={cn(
        "inline-flex shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      <SwitchTrack checked={checked} />
    </button>
  );
}
