"use client";

import { useCallback, useEffect, useState } from "react";
import { ACCENT_THEME_STORAGE_KEY, DEFAULT_ACCENT, isAccentTheme, type AccentTheme } from "./accent-theme";

/** The accent theme on <html> and a setter that stores it (src/lib/accent-theme.ts). */
export function useAccentTheme(): [AccentTheme, (theme: AccentTheme) => void] {
  const [theme, setThemeState] = useState<AccentTheme>(DEFAULT_ACCENT);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (isAccentTheme(current)) setThemeState(current);
  }, []);

  const setTheme = useCallback((next: AccentTheme) => {
    document.documentElement.setAttribute("data-theme", next);
    setThemeState(next);
    try {
      localStorage.setItem(ACCENT_THEME_STORAGE_KEY, next);
    } catch {}
  }, []);

  return [theme, setTheme];
}
