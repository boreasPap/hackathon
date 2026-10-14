import * as React from "react";
import { cn } from "@/lib/utils";
import { SearchIcon } from "./icons/ui-icons";

// Text inputs (docs/frontend/components/form-controls.md). Figma: date and
// preset name inputs in the calendar (34px, padding 6/10, `text-body`), time
// inputs (28px, padding 4/8, `text-body-sm`), the search box of the dropdown
// panels (32px, `bg-page`, no border, 16px icon; no focus ring, as in Figma,
// the caret shows focus). Values keep Bomstad digits (dates, times).

const BASE =
  "w-full min-w-0 rounded-sm bg-surface font-bomstad text-ink outline-none transition-colors placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-accent-border disabled:pointer-events-none disabled:opacity-40";

const SIZES = {
  md: "h-8.5 border border-line px-2.5 text-body",
  sm: "h-7 border border-line px-2 text-body-sm",
} as const;

export type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: keyof typeof SIZES;
};

export function Input({ className, size = "md", type = "text", ...props }: InputProps) {
  return <input type={type} data-slot="input" className={cn(BASE, SIZES[size], className)} {...props} />;
}

export type SearchInputProps = Omit<React.ComponentProps<"input">, "type">;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div
      data-slot="search-input"
      className={cn(
        "flex h-8 w-full items-center gap-1 rounded-sm bg-page pl-2 pr-2.5 font-bomstad",
        className,
      )}
    >
      <SearchIcon size={16} className="shrink-0 text-ink-2" />
      <input
        type="search"
        className="h-full w-full min-w-0 bg-transparent text-body text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
    </div>
  );
}
