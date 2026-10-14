"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Chart as ChartJS } from "chart.js";

// Chart.js reads its colors from JS, not CSS, so the `.dark` palette remap in
// globals.css cannot reach it. Keep the library defaults (axis labels, grid
// lines, legend text) in step with the theme and redraw mounted charts.
// Charts that set explicit colors in their own `options` are unaffected.
const LIGHT = { color: "#666", borderColor: "rgba(0, 0, 0, 0.1)" };
const DARK = { color: "#828282", borderColor: "rgba(255, 255, 255, 0.1)" };

export function ChartThemeSync() {
  const { resolvedTheme } = useTheme();

  // Canvas text takes the app's default stack too, so axis numbers and
  // tooltip values come out in the system font and labels in Bomstad, as in
  // the design (docs/frontend/foundations.md#typography). Redraw once the
  // web fonts are in; a canvas does not repaint on its own when they load.
  useEffect(() => {
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim();
    if (!family) return;
    ChartJS.defaults.font.family = family;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      for (const chart of Object.values(ChartJS.instances)) chart.update("none");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const palette = resolvedTheme === "dark" ? DARK : LIGHT;
    ChartJS.defaults.color = palette.color;
    ChartJS.defaults.borderColor = palette.borderColor;
    for (const chart of Object.values(ChartJS.instances)) {
      chart.update("none");
    }
  }, [resolvedTheme]);

  return null;
}
