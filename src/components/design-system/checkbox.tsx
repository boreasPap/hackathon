"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Checkbox (docs/frontend/components/form-controls.md). 18px, r6; empty is the surface with a 1.5px
// `line-strong` border, checked is the accent with a white 13px check.

export type CheckboxProps = Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "checked"> & {
  checked: boolean;
};

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "inline-flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-xs border-[1.5px] border-line-strong bg-surface text-accent-contrast transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40",
        "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check className="size-3.25" strokeWidth={3} aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
