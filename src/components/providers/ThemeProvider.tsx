"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

// Light/dark theme. Light is the default and the OS preference is ignored so
// nobody lands on dark mode without picking it. Persisted per browser in
// localStorage; next-themes sets the `dark` class on <html> before hydration
// so there is no flash of the wrong theme.
export const THEME_STORAGE_KEY = "papcorns-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
