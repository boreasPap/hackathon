// The accent theme (docs/frontend/foundations.md, Theme and mode): Blue,
// Lilac or Green, picked in the sidebar's Theme Color popover. A user
// preference kept per browser, like the light / dark mode next to it; it
// stays the same when the workspace changes. `<html data-theme>` carries it,
// set before the first paint by ACCENT_THEME_SCRIPT so no page flashes blue.
// The hook that changes it is in use-accent-theme.ts (client only).

export const ACCENT_THEMES = ["lilac", "green", "blue"] as const;
export type AccentTheme = (typeof ACCENT_THEMES)[number];

export const ACCENT_THEME_STORAGE_KEY = "papcorns-accent";
export const DEFAULT_ACCENT: AccentTheme = "blue";

export const isAccentTheme = (value: unknown): value is AccentTheme =>
  ACCENT_THEMES.includes(value as AccentTheme);

/** Inline in the root layout's <head>: puts the stored theme on <html> before paint. */
export const ACCENT_THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(ACCENT_THEME_STORAGE_KEY)});if(${JSON.stringify(ACCENT_THEMES)}.indexOf(t)>-1)document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
