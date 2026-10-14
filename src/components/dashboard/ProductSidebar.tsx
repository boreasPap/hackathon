"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu } from "lucide-react";
import {
  PapcornsMark,
  Sidebar,
  WorkspaceTile,
  type SidebarItem,
  type SidebarLink,
  type SidebarSection,
  type SidebarWorkspace,
  type WorkspaceColor,
} from "@/components/design-system";
import { useMobileNav } from "@/components/providers/MobileNavProvider";
import { CURRENT_USER } from "@/lib/current-user";
import { useAccentTheme } from "@/lib/use-accent-theme";
import { cn } from "@/lib/utils";

// The app shell: the design-system Sidebar filled from the menu that
// Sidebar.tsx passes. The quickstart has no sign-in, so every entry shows and
// the user is CURRENT_USER. There is no top header: theme and mode are in the
// footer, and phones get MobileTopBar with the menu button.

export type ProductKey = "dashboard";

type Product = {
  key: ProductKey;
  name: string;
  href: string;
  color: WorkspaceColor;
  icon: React.ReactNode;
};

const PRODUCTS: Product[] = [
  { key: "dashboard", name: "Papcorns", href: "/dashboard/welcome", color: "papcorns", icon: <PapcornsMark size={18} /> },
];

// ─── Menu definitions (what a product's Sidebar.tsx passes) ───

export type NavLinkDef = {
  name: string;
  href: string;
  /** The page's permission key (the route without its leading slash). Not checked here. */
  permission?: string;
  icon?: React.ReactNode;
  /** "prefix" also lights the link on the pages under it; the default is the product's. */
  match?: "exact" | "prefix";
};

export type NavGroupDef = {
  name: string;
  icon: React.ReactNode;
  permission?: string;
  /** Pages that count as inside the group though no child links them. */
  prefixes?: string[];
  excludePrefixes?: string[];
  children: NavLinkDef[];
};

export type NavDef = NavLinkDef | NavGroupDef;

export type NavSectionDef = {
  label?: string;
  items: NavDef[];
  /** Shown while the section has no page at all yet. */
  emptyText?: string;
};

const isGroupDef = (item: NavDef): item is NavGroupDef => "children" in item;

const startsWithPath = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(prefix + "/");

function useShell(product: ProductKey, nav: NavSectionDef[], defaultMatch: "exact" | "prefix") {
  const pathname = usePathname() ?? "";

  const isActive = (link: NavLinkDef) =>
    (link.match ?? defaultMatch) === "prefix" ? startsWithPath(pathname, link.href) : pathname === link.href;

  const toLink = (link: NavLinkDef): SidebarLink => ({
    id: link.href,
    label: link.name,
    href: link.href,
    icon: link.icon,
    active: isActive(link),
  });

  const sections: SidebarSection[] = nav.flatMap((section, i) => {
    const items = section.items.flatMap((item): SidebarItem[] => {
      if (!isGroupDef(item)) return [toLink(item)];
      if (item.children.length === 0) return [];
      const inside =
        (item.prefixes ?? []).some((p) => startsWithPath(pathname, p)) &&
        !(item.excludePrefixes ?? []).some((p) => startsWithPath(pathname, p));
      return [{ id: `group:${item.name}`, label: item.name, icon: item.icon, active: inside, children: item.children.map(toLink) }];
    });
    const planned = section.items.length === 0 && section.emptyText;
    if (items.length === 0 && !planned) return [];
    return [{ id: `section:${section.label ?? i}`, label: section.label, items, emptyText: section.emptyText }];
  });

  const workspaces: SidebarWorkspace[] = PRODUCTS.filter((p) => p.key === product).map((p) => ({
    id: p.key,
    name: p.name,
    href: p.href,
    color: p.color,
    icon: p.icon,
  }));

  return { sections, workspaces };
}

function useDarkMode(): [boolean, (dark: boolean) => void] {
  const { resolvedTheme, setTheme } = useTheme();
  // The mode is unknown on the server; light until mounted so the markup matches.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return [mounted && resolvedTheme === "dark", (dark) => setTheme(dark ? "dark" : "light")];
}

const COLLAPSED_KEY = "sidebar-collapsed";

export function ProductSidebar({
  product,
  nav,
  defaultMatch = "prefix",
}: {
  product: ProductKey;
  nav: NavSectionDef[];
  defaultMatch?: "exact" | "prefix";
}) {
  const { sections, workspaces } = useShell(product, nav, defaultMatch);
  const [accent, setAccent] = useAccentTheme();
  const [dark, setDark] = useDarkMode();
  const { open: mobileOpen, setOpen: setMobileOpen } = useMobileNav();

  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => {
    try {
      if (localStorage.getItem(COLLAPSED_KEY) === "true") setCollapsed(true);
    } catch {}
  }, []);
  const changeCollapsed = (next: boolean) => {
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {}
  };

  const shared = {
    workspaces,
    current: product,
    workspaceInHeader: product !== "dashboard",
    sections,
    user: CURRENT_USER,
    accent,
    onAccentChange: setAccent,
    dark,
    onDarkChange: setDark,
  };

  return (
    <>
      <Sidebar {...shared} collapsed={collapsed} onCollapsedChange={changeCollapsed} className="hidden md:flex" />
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} aria-hidden />
          <Sidebar {...shared} onClose={() => setMobileOpen(false)} className="absolute inset-y-0 left-0 max-w-[85%] shadow-modal" />
        </div>
      ) : null}
    </>
  );
}

/** Phones only: the bar over the page with the menu button, where the sidebar is a drawer. */
export function MobileTopBar({ product }: { product: ProductKey }) {
  const { open, setOpen } = useMobileNav();
  const current = PRODUCTS.find((p) => p.key === product);
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 font-bomstad md:hidden">
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-border",
        )}
      >
        <Menu className="size-5" />
      </button>
      <WorkspaceTile />
      <span className="truncate text-body font-semibold text-ink">{current?.name ?? "Papcorns"}</span>
    </div>
  );
}
