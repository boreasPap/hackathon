import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ACCENT_THEME_SCRIPT } from "@/lib/accent-theme";
import { BOMSTAD_FACES_CSS, BOMSTAD_FILES, BOMSTAD_PRELOAD, BOMSTAD_VARIABLES_CSS } from "@/lib/bomstad-font";
import { ChartThemeSync } from "@/components/providers/ChartThemeSync";
import { Toaster } from "react-hot-toast";

const dmMono = DM_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Creative Asset Libraries & Auto-Iteration",
  description: "A tool for generating and iterating on creative ideas using AI.",
};

// Bomstad Display is licensed and not in the repository (src/lib/bomstad-font.ts).
// Its faces are added only when the files are in public/fonts/, so a checkout
// without them asks for nothing and renders in the system font.
const hasBomstad = () =>
  Object.values(BOMSTAD_FILES).every((file) => existsSync(path.join(process.cwd(), "public", "fonts", file)));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bomstad = hasBomstad();
  return (
    <html lang="en" data-theme="blue" className={dmMono.variable} suppressHydrationWarning>
      <head>
        {bomstad
          ? BOMSTAD_PRELOAD.map((href) => (
              <link key={href} rel="preload" as="font" type="font/woff2" href={href} crossOrigin="anonymous" />
            ))
          : null}
        <style dangerouslySetInnerHTML={{ __html: BOMSTAD_VARIABLES_CSS + (bomstad ? BOMSTAD_FACES_CSS : "") }} />
        {/* The stored accent theme (Theme Color popover) before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: ACCENT_THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ChartThemeSync />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
