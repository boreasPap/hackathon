"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// RadioGroup (docs/frontend/components/form-controls.md; in the design,
// Visibility in Save as Preset). Dot 13px with a 1px `ink-3` ring; the picked one
// turns the ring to the accent with an 8px accent dot. Labels `text-body`,
// gap 6; options 16 apart in a row.

export type RadioOption<T extends string> = { value: T; label: React.ReactNode; disabled?: boolean };

export type RadioGroupProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: RadioOption<T>[];
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
  className?: string;
};

export function RadioGroup<T extends string>({
  value,
  onValueChange,
  options,
  orientation = "horizontal",
  className,
  ...props
}: RadioGroupProps<T>) {
  const id = React.useId();
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      orientation={orientation}
      aria-label={props["aria-label"]}
      className={cn(
        "flex font-bomstad",
        orientation === "horizontal" ? "flex-row flex-wrap gap-x-4 gap-y-2" : "flex-col gap-2",
        className,
      )}
    >
      {options.map((option) => {
        const itemId = `${id}-${option.value}`;
        return (
          <label
            key={option.value}
            htmlFor={itemId}
            className="inline-flex cursor-pointer items-center gap-1.5 text-body text-ink-2 has-disabled:cursor-default has-disabled:opacity-40"
          >
            <RadioGroupPrimitive.Item
              id={itemId}
              value={option.value}
              disabled={option.disabled}
              className="inline-flex size-3.25 shrink-0 items-center justify-center rounded-full border border-ink-3 bg-surface outline-none focus-visible:ring-2 focus-visible:ring-accent-border data-[state=checked]:border-accent"
            >
              <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-accent" />
            </RadioGroupPrimitive.Item>
            {option.label}
          </label>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
