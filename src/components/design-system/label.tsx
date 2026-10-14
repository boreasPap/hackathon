import * as React from "react";
import { cn } from "@/lib/utils";

// Field label ("Preset name", "Visibility" in Save as Preset): 12 / 18,
// SemiBold, `text-ink`.

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("font-bomstad text-body-sm font-semibold text-ink", className)}
      {...props}
    />
  );
}
