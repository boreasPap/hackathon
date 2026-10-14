"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Select (docs/frontend/components/form-controls.md; in the design, the
// "Between" mode select of the calendar). Trigger
// 32px, r8, `border-line`; open, it takes the accent look of an active
// FilterPill. Menu r16, rows 40px with 16px sides, the picked row tinted.
// Radix gives keyboard support and closes on Esc and outside click.

export type SelectOption<T extends string> = { value: T; label: React.ReactNode; disabled?: boolean };

export type SelectProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

export function Select<T extends string>({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  className,
  ...props
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={(next) => onValueChange(next as T)} disabled={disabled}>
      <SelectPrimitive.Trigger
        aria-label={props["aria-label"]}
        className={cn(
          "group inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-sm border border-line bg-surface pl-3 font-bomstad text-body whitespace-nowrap text-ink-2 outline-none transition-colors data-[state=closed]:hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40",
          "data-[state=open]:border-accent data-[state=open]:bg-accent-subtle data-[state=open]:text-accent-text",
          "data-placeholder:text-ink-3",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <span className="flex w-5 shrink-0 items-center justify-center">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 min-w-[max(var(--radix-select-trigger-width),125px)] overflow-hidden rounded-xl border border-line bg-surface font-bomstad shadow-popover"
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "flex h-10 cursor-pointer items-center px-4 text-body-sm text-ink-2 outline-none select-none",
                  "data-highlighted:bg-muted data-[state=checked]:bg-accent-subtle data-[state=checked]:text-accent-text",
                  "data-disabled:pointer-events-none data-disabled:opacity-40",
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
