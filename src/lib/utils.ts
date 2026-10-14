import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The design system's type and shadow names (globals.css @theme). Without
// them tailwind-merge reads `text-body` as a color and drops it next to
// `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "page-title",
        "section-title",
        "page-desc",
        "kpi-value",
        "kpi-label",
        "body",
        "body-sm",
        "caption",
        "micro",
        "delta",
        "overline",
        "code",
      ],
      shadow: ["popover", "modal"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
