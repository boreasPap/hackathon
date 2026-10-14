"use client";

import * as React from "react";
import { ToggleGroup } from "radix-ui";
import { cn } from "@/lib/utils";

// SegmentedControl (docs/frontend/components/segmented-control.md, design doc
// §8.5). Track 34px,
// `bg-muted`, r8, padding and gap 2; items 30px, r6. The picked item is the
// surface with `shadow-xs`. A text-only item is padded 12, one with an icon 10;
// icons are the 11px Figma glyphs in a 14px box (platform marks 16px).

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  "aria-label": string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix sends "" when the picked item is clicked again; a segmented
      // control always keeps one value.
      onValueChange={(next) => {
        if (next) onValueChange(next as T);
      }}
      aria-label={props["aria-label"]}
      className={cn(
        "inline-flex h-8.5 shrink-0 items-center gap-0.5 rounded-sm bg-muted p-0.5 font-bomstad",
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            "inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-xs text-body-sm leading-4 whitespace-nowrap text-ink-3 transition-colors outline-none hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40",
            "data-[state=on]:bg-surface data-[state=on]:text-ink data-[state=on]:shadow-xs",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-2.75",
            option.icon ? "px-2.5" : "px-3",
          )}
        >
          {option.icon ? <span className="flex min-w-3.5 items-center justify-center">{option.icon}</span> : null}
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
