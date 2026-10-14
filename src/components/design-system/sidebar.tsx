"use client";

import * as React from "react";
import Link from "next/link";
import { DropdownMenu, Popover, Tooltip } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_THEMES, type AccentTheme } from "@/lib/accent-theme";
import { PapcornsMark, PapcornsWordmark } from "./icons/brand-icons";
import { ChevronRightIcon, CloseIcon, MoonIcon, PaletteIcon, SelectorIcon, SidebarIcon } from "./icons/ui-icons";

// Sidebar (docs/frontend/components/sidebar.md, design doc §8.1). 232px, or
// 64px collapsed (icons with a tooltip). Header: the accent tile, "Papcorns."
// and the workspace switcher, the collapse button on the right; another
// workspace puts its own tile and name there instead. Nav rows 44px r12, a
// group opens its links under it (36px, indented to the label). Footer: the
// user (a click opens their menu), the palette button (Theme Color) and the
// moon (light / dark). Presentational:
// src/components/dashboard/ProductSidebar.tsx fills it.

export type SidebarLink = {
  id: string;
  label: string;
  href: string;
  /** A 24px icon (nav-icons.tsx, or a lucide icon at 20px). */
  icon?: React.ReactNode;
  active?: boolean;
};

export type SidebarGroup = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** The page is inside the group (opens it on arrival). */
  active?: boolean;
  children: SidebarLink[];
};

export type SidebarItem = SidebarLink | SidebarGroup;

export type SidebarSection = {
  id: string;
  /** An overline over the section; left out for an unnamed first block. */
  label?: string;
  items: SidebarItem[];
  /** Shown when the section has no page yet ("Coming soon"). */
  emptyText?: string;
};

export type WorkspaceColor = "papcorns" | "intelligence" | "growth" | "creative";

export type SidebarWorkspace = {
  id: string;
  name: string;
  href: string;
  color: WorkspaceColor;
  /** White on the workspace colour in the switcher (and in the header, at 16px). */
  icon: React.ReactNode;
};

export type SidebarUserMenuItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "toggle"; label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }
  | { kind: "action"; label: string; onSelect: () => void };

export type SidebarProps = {
  /** The workspaces the viewer can open, the current one included. */
  workspaces: SidebarWorkspace[];
  current: string;
  /** The header shows the current workspace (its tile and name) instead of Papcorns (every workspace but the main one). */
  workspaceInHeader?: boolean;
  sections: SidebarSection[];
  collapsed?: boolean;
  /** The collapse button; without it (mobile drawer) `onClose` puts a close button there. */
  onCollapsedChange?: (collapsed: boolean) => void;
  onClose?: () => void;
  user: { name: string; role?: string; email?: string; menu?: SidebarUserMenuItem[] };
  accent: AccentTheme;
  onAccentChange: (theme: AccentTheme) => void;
  dark: boolean;
  onDarkChange: (dark: boolean) => void;
  className?: string;
};

// Static classes so Tailwind keeps them.
const WORKSPACE_BG: Record<WorkspaceColor, string> = {
  papcorns: "bg-workspace-papcorns",
  intelligence: "bg-workspace-intelligence",
  growth: "bg-workspace-growth",
  creative: "bg-workspace-creative",
};
const SWATCH: Record<AccentTheme, string> = {
  lilac: "bg-theme-lilac",
  green: "bg-theme-green",
  blue: "bg-theme-blue",
};
const ACCENT_LABEL: Record<AccentTheme, string> = { lilac: "Lilac", green: "Green", blue: "Blue" };

const isGroup = (item: SidebarItem): item is SidebarGroup => "children" in item;

const ICON_BOX = "flex size-6 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-5";

const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-accent-border";

export function Sidebar({
  workspaces,
  current,
  workspaceInHeader = false,
  sections,
  collapsed = false,
  onCollapsedChange,
  onClose,
  user,
  accent,
  onAccentChange,
  dark,
  onDarkChange,
  className,
}: SidebarProps) {
  const workspace = workspaces.find((w) => w.id === current) ?? workspaces[0];

  // Groups holding the page open on arrival; the others close, as before.
  const groups = sections.flatMap((s) => s.items.filter(isGroup));
  const activeGroups = groups.filter((g) => g.active || g.children.some((c) => c.active)).map((g) => g.id);
  const activeKey = activeGroups.join(",");
  const [open, setOpen] = React.useState<string[]>(activeGroups);
  React.useEffect(() => {
    setOpen(activeKey ? activeKey.split(",") : []);
  }, [activeKey]);

  const toggle = (id: string) => setOpen((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  // A group clicked in the collapsed rail opens the sidebar on it.
  const openFromRail = (id: string) => {
    onCollapsedChange?.(false);
    setOpen((ids) => (ids.includes(id) ? ids : [...ids, id]));
  };

  return (
    <Tooltip.Provider delayDuration={0}>
      <aside
        aria-label="Sidebar"
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-line bg-surface font-bomstad text-ink",
          collapsed ? "w-(--sidebar-w-collapsed)" : "w-(--sidebar-w)",
          className,
        )}
      >
        <SidebarHeader
          workspaces={workspaces}
          workspace={workspace}
          ownBrand={workspaceInHeader}
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          onClose={onClose}
        />

        <nav
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2.5 py-4",
            // The rail has no room for a scrollbar; the full sidebar gets a thin one.
            collapsed ? "[scrollbar-width:none]" : "[scrollbar-width:thin]",
          )}
        >
          {sections.map((section, i) => (
            <div key={section.id} className={cn(i > 0 && (section.label ? "mt-4" : "mt-1.5"))}>
              {section.label ? (
                collapsed ? (
                  <div role="separator" className="mx-2 mb-1.5 border-t border-line" />
                ) : (
                  <div className="px-3 pb-1.5 text-overline uppercase text-ink-3">{section.label}</div>
                )
              ) : null}
              <ul className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    {isGroup(item) ? (
                      collapsed ? (
                        <RailButton label={item.label} icon={item.icon} active={item.children.some((c) => c.active)} onClick={() => openFromRail(item.id)} />
                      ) : (
                        <NavGroup group={item} open={open.includes(item.id)} onToggle={() => toggle(item.id)} />
                      )
                    ) : collapsed ? (
                      <RailLink link={item} />
                    ) : (
                      <NavLink link={item} />
                    )}
                  </li>
                ))}
              </ul>
              {section.items.length === 0 && section.emptyText && !collapsed ? (
                <p className="px-3 py-2 text-body-sm text-ink-3">{section.emptyText}</p>
              ) : null}
            </div>
          ))}
        </nav>

        <SidebarFooter
          collapsed={collapsed}
          user={user}
          accent={accent}
          onAccentChange={onAccentChange}
          dark={dark}
          onDarkChange={onDarkChange}
        />
        {collapsed ? null : <SidebarLogo accent={accent} />}
      </aside>
    </Tooltip.Provider>
  );
}

// ─── Header ───

function SidebarHeader({
  workspaces,
  workspace,
  ownBrand,
  collapsed,
  onCollapsedChange,
  onClose,
}: {
  workspaces: SidebarWorkspace[];
  workspace: SidebarWorkspace;
  ownBrand: boolean;
  collapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onClose?: () => void;
}) {
  const canSwitch = workspaces.length > 1;
  const brand = (
    <>
      <WorkspaceTile workspace={ownBrand ? workspace : undefined} />
      {collapsed ? null : (
        <>
          {ownBrand ? (
            <span className="min-w-0 truncate text-body font-semibold text-ink">{workspace.name}</span>
          ) : (
            <PapcornsWordmark size={77} className="shrink-0 text-ink" />
          )}
          {canSwitch ? <SelectorIcon className="ml-0.5 shrink-0 text-ink-3" /> : null}
        </>
      )}
    </>
  );

  const trigger = canSwitch ? (
    <WorkspaceSwitcher workspaces={workspaces} current={workspace.id}>
      <button
        type="button"
        aria-label={`Workspace: ${workspace.name}`}
        className={cn("flex h-10 min-w-0 cursor-pointer items-center gap-2 rounded-md pr-1.5 hover:bg-muted", collapsed && "pr-0", FOCUS)}
      >
        {brand}
      </button>
    </WorkspaceSwitcher>
  ) : (
    <div className="flex h-10 min-w-0 items-center gap-2">{brand}</div>
  );

  const side = onCollapsedChange ? (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={() => onCollapsedChange(!collapsed)}
      className={cn("flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-3 hover:bg-muted", FOCUS)}
    >
      <SidebarIcon className={cn(collapsed && "rotate-180")} />
    </button>
  ) : onClose ? (
    <button
      type="button"
      aria-label="Close navigation"
      onClick={onClose}
      className={cn("flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-3 hover:bg-muted", FOCUS)}
    >
      <CloseIcon size={16} />
    </button>
  ) : null;

  return (
    <div className="shrink-0 border-b border-line">
      {collapsed ? (
        <div className="flex flex-col items-center gap-1.5 py-3">
          {trigger}
          {side}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1.5 py-3 pr-2.5 pl-3">
          {trigger}
          {side}
        </div>
      )}
    </div>
  );
}

/** The 28px header tile: the Papcorns mark on the accent, or a workspace's icon on its colour. */
export function WorkspaceTile({ workspace }: { workspace?: Pick<SidebarWorkspace, "color" | "icon"> }) {
  return workspace ? (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-sm text-white [&_svg]:size-4",
        WORKSPACE_BG[workspace.color],
      )}
    >
      {workspace.icon}
    </span>
  ) : (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-contrast">
      <PapcornsMark />
    </span>
  );
}

function WorkspaceSwitcher({
  workspaces,
  current,
  children,
}: {
  workspaces: SidebarWorkspace[];
  current: string;
  children: React.ReactElement;
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="z-50 flex w-[194px] flex-col gap-1 rounded-xl border border-line bg-surface p-2 font-bomstad shadow-popover outline-none"
        >
          {workspaces.map((w) => (
            <DropdownMenu.Item key={w.id} asChild>
              <Link
                href={w.href}
                aria-current={w.id === current ? "page" : undefined}
                className={cn(
                  "flex h-14 cursor-pointer items-center gap-3.5 rounded-lg py-2 pr-3 pl-2 text-body font-semibold text-ink outline-none data-highlighted:bg-muted",
                  w.id === current && "bg-muted",
                )}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg text-white", WORKSPACE_BG[w.color])}>
                  {w.icon}
                </span>
                <span className="min-w-0 truncate">{w.name}</span>
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// ─── Nav ───

const ROW = "flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left transition-colors";

function NavLink({ link }: { link: SidebarLink }) {
  return (
    <Link
      href={link.href}
      aria-current={link.active ? "page" : undefined}
      className={cn(
        ROW,
        FOCUS,
        link.active ? "bg-accent text-body font-semibold text-accent-contrast" : "text-body-sm text-ink hover:bg-muted",
      )}
    >
      <span className={ICON_BOX}>{link.icon}</span>
      <span className="min-w-0 truncate">{link.label}</span>
    </Link>
  );
}

function NavGroup({ group, open, onToggle }: { group: SidebarGroup; open: boolean; onToggle: () => void }) {
  const id = React.useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className={cn(ROW, FOCUS, "text-body-sm text-ink hover:bg-muted")}
      >
        <span className={ICON_BOX}>{group.icon}</span>
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <ChevronRightIcon className={cn("shrink-0 transition-transform", open && "rotate-90")} />
      </button>
      {open ? (
        <ul id={id} className="flex flex-col gap-0.5 pt-1 pb-0.5">
          {group.children.map((child) => (
            <li key={child.id}>
              <Link
                href={child.href}
                aria-current={child.active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center rounded-lg pr-3 pl-11 text-body transition-colors",
                  FOCUS,
                  child.active ? "bg-accent font-semibold text-accent-contrast" : "text-ink hover:bg-muted",
                )}
              >
                <span className="min-w-0 truncate">{child.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const RAIL = "flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors";

function RailTip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="z-50 rounded-sm bg-ink px-2 py-1 font-bomstad text-body-sm text-surface shadow-popover"
        >
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

function RailLink({ link }: { link: SidebarLink }) {
  return (
    <RailTip label={link.label}>
      <Link
        href={link.href}
        aria-label={link.label}
        aria-current={link.active ? "page" : undefined}
        className={cn(RAIL, FOCUS, link.active ? "bg-accent text-accent-contrast" : "text-ink hover:bg-muted")}
      >
        <span className={ICON_BOX}>{link.icon}</span>
      </Link>
    </RailTip>
  );
}

function RailButton({ label, icon, active, onClick }: { label: string; icon?: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <RailTip label={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cn(RAIL, FOCUS, active ? "bg-accent-subtle text-accent-text" : "text-ink hover:bg-muted")}
      >
        <span className={ICON_BOX}>{icon}</span>
      </button>
    </RailTip>
  );
}

// ─── Logo ───

// The Papcorns mark scaled to the glass in Figma (247 × 297).
const GLASS_PATH =
  "M247 63.04C247 63.98 246.98 64.91 246.94 65.84C245.69 97.18 219.11 121.57 187.73 121.64C183.4 121.64 175.19 121.68 172.62 121.69L169.07 121.69C165.77 121.71 162.6 122.36 159.74 123.55C159.27 123.73 158.83 123.94 158.4 124.14C146.83 129.7 143.21 144.5 150.27 155.22C151.4 156.92 152.45 158.6 153.22 159.95C153.81 160.73 157.48 166.02 158.61 167.95C166.26 180.74 170.61 195.69 170.6 211.67C170.54 257.2 134.06 295.09 88.58 296.8C31.07 298.97 -14.46 244.11 4.27 184.12C11.88 159.73 30.72 140.22 54.8 131.65C59.21 130.08 63.49 128.95 67.86 128.08C74.92 126.69 82.12 126.1 89.31 126.07L121.59 125.95C127.46 125.92 132.76 123.52 136.62 119.63C140.84 115.39 143.27 109.38 142.74 102.89C141.82 91.7 132.04 83.32 120.8 83.36L61.11 83.49C38.57 83.58 20.22 65.37 20.13 42.82L20.13 41.45C20.04 18.91 38.24 0.56 60.79 0.47L181.76 0C182.33 0 182.87 0 183.43 0C218.38 -0.14 246.83 28.11 246.97 63.05L247 63.04Z";

// The large glass mark under the footer: the
// wordmark in the accent with the frosted mark over its first letters, which
// blurs them. Its block takes what the window has left under the footer, up
// to Figma's 318px, and the whole logo scales with the block (container
// height units: Figma's 276 × 297 drawing, 59px past the left edge and 9px
// past the bottom, all as shares of 318), so a shorter window shows a smaller
// logo, never a cut one. Under 760px it would be under 38% and is left out,
// so the menu keeps its room. The glass colours are Figma's: brand
// art, like the platform logos, carries its own values. The first glow is
// lilac in Blue and Lilac, green in Green; the second is the accent.
function SidebarLogo({ accent }: { accent: AccentTheme }) {
  const id = React.useId().replace(/:/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;
  const glow = accent === "green" ? "[flood-color:var(--accent)]" : "[flood-color:var(--theme-lilac)]";
  const wordmark = <PapcornsWordmark size={205} x={71} y={199} />;
  return (
    <div
      aria-hidden
      className="pointer-events-none relative h-[clamp(0px,calc(100dvh_-_640px),318px)] shrink-0 overflow-hidden [container-type:size] [@media(max-height:759px)]:hidden"
    >
      <svg
        viewBox="0 0 276 297"
        className="absolute bottom-[-2.83cqh] left-[-18.55cqh] h-[93.4cqh] w-[86.79cqh] overflow-visible text-accent"
      >
        <defs>
          <clipPath id={`${id}-glass`}>
            <path d={GLASS_PATH} />
          </clipPath>
          <mask id={`${id}-outside`}>
            <rect x={-100} y={-100} width={500} height={500} fill="white" />
            <path d={GLASS_PATH} fill="black" />
          </mask>
          <filter id={`${id}-blur`} x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation={3.6} />
          </filter>
          <linearGradient id={`${id}-fill`} x1={-0.08} y1={0.06} x2={0.52} y2={0.86}>
            <stop offset={0} stopColor="#FFFFFF" stopOpacity={0.55} />
            <stop offset={1} stopColor="#EDEDF7" stopOpacity={0.35} />
          </linearGradient>
          <linearGradient id={`${id}-rim`} x1={0} y1={0} x2={0.714} y2={0.714}>
            <stop offset={0} stopColor="#FFFFFF" />
            <stop offset={0.45} stopColor="#B2B2C7" stopOpacity={0.7} />
            <stop offset={0.75} stopColor="#FFFFFF" />
            <stop offset={1} stopColor="#9999B2" stopOpacity={0.6} />
          </linearGradient>
          {/* Figma's effects: a drop shadow and three inner shadows (radius / 2 = stdDeviation). */}
          <filter id={`${id}-glass-fx`} x="-40%" y="-30%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation={17.84} />
            <feOffset dy={17.84} result="dropBlur" />
            <feFlood floodColor="#1A1A4D" floodOpacity={0.16} />
            <feComposite in2="dropBlur" operator="in" result="drop" />
            <feGaussianBlur in="SourceAlpha" stdDeviation={8.92} result="b1" />
            <feComposite in="SourceAlpha" in2="b1" operator="arithmetic" k2={1} k3={-1} result="m1" />
            <feFlood className={glow} floodOpacity={0.9} />
            <feComposite in2="m1" operator="in" result="i1" />
            <feOffset in="SourceAlpha" dx={8.33} dy={9.51} result="o2" />
            <feGaussianBlur in="o2" stdDeviation={7.73} result="b2" />
            <feComposite in="SourceAlpha" in2="b2" operator="arithmetic" k2={1} k3={-1} result="m2" />
            <feFlood className="[flood-color:var(--accent)]" floodOpacity={0.45} />
            <feComposite in2="m2" operator="in" result="i2" />
            <feOffset in="SourceAlpha" dx={-2.38} dy={-2.38} result="o3" />
            <feGaussianBlur in="o3" stdDeviation={1.78} result="b3" />
            <feComposite in="SourceAlpha" in2="b3" operator="arithmetic" k2={1} k3={-1} result="m3" />
            <feFlood floodColor="#FFFFFF" />
            <feComposite in2="m3" operator="in" result="i3" />
            <feMerge>
              <feMergeNode in="drop" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="i1" />
              <feMergeNode in="i2" />
              <feMergeNode in="i3" />
            </feMerge>
          </filter>
        </defs>
        <g mask={ref("outside")}>{wordmark}</g>
        <g clipPath={ref("glass")}>
          <g filter={ref("blur")}>{wordmark}</g>
        </g>
        <path d={GLASS_PATH} fill={ref("fill")} filter={ref("glass-fx")} />
        <path d={GLASS_PATH} fill="none" stroke={ref("rim")} strokeWidth={2.4} clipPath={ref("glass")} />
      </svg>
    </div>
  );
}

// ─── Footer ───

const FOOTER_BUTTON = cn(
  "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-line text-ink transition-colors hover:bg-muted",
  FOCUS,
);

function SidebarFooter({
  collapsed,
  user,
  accent,
  onAccentChange,
  dark,
  onDarkChange,
}: {
  collapsed: boolean;
  user: SidebarProps["user"];
  accent: AccentTheme;
  onAccentChange: (theme: AccentTheme) => void;
  dark: boolean;
  onDarkChange: (dark: boolean) => void;
}) {
  const initial = user.name.trim()[0]?.toUpperCase() ?? "?";
  const avatar = (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-line text-body font-semibold text-ink">
      {initial}
    </span>
  );
  const profile = collapsed ? (
    avatar
  ) : (
    <>
      {avatar}
      <span className="flex min-w-0 flex-col text-left">
        <span className="truncate text-body-sm font-semibold text-ink">{user.name}</span>
        {user.role ? <span className="truncate text-micro text-ink-3">{user.role}</span> : null}
      </span>
    </>
  );

  const actions = (
    <>
      <ThemeColorPopover accent={accent} onAccentChange={onAccentChange} side={collapsed ? "right" : "top"}>
        <button type="button" aria-label="Theme color" className={FOOTER_BUTTON}>
          <PaletteIcon />
        </button>
      </ThemeColorPopover>
      <button
        type="button"
        aria-label="Dark mode"
        aria-pressed={dark}
        onClick={() => onDarkChange(!dark)}
        className={cn(FOOTER_BUTTON, dark && "border-accent-border bg-accent-subtle text-accent-text")}
      >
        <MoonIcon />
      </button>
    </>
  );

  return (
    <div
      className={cn(
        "shrink-0 border-t border-line",
        collapsed ? "flex flex-col items-center gap-3 py-4" : "flex items-center justify-between gap-2 py-4 pr-5 pl-4",
      )}
    >
      {collapsed ? <div className="flex flex-col items-center gap-2">{actions}</div> : null}
      <UserMenu user={user}>
        <button
          type="button"
          aria-label={`Account: ${user.name}`}
          className={cn("flex min-w-0 cursor-pointer items-center gap-2 rounded-md p-1 hover:bg-muted", FOCUS)}
        >
          {profile}
        </button>
      </UserMenu>
      {collapsed ? null : <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

function UserMenu({ user, children }: { user: SidebarProps["user"]; children: React.ReactElement }) {
  const menu = user.menu ?? [];
  const item = "flex h-9 cursor-pointer items-center justify-between gap-3 rounded-sm px-2.5 text-body text-ink outline-none data-highlighted:bg-muted";
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="z-50 flex w-[220px] flex-col rounded-lg border border-line bg-surface p-1.5 font-bomstad shadow-popover outline-none"
        >
          <div className="flex flex-col px-2.5 pt-1.5 pb-2">
            <span className="truncate text-body-sm font-semibold text-ink">{user.name}</span>
            {user.email ? <span className="truncate text-caption text-ink-3">{user.email}</span> : null}
            {user.role ? <span className="mt-1 truncate text-overline uppercase text-ink-3">{user.role}</span> : null}
          </div>
          {menu.length > 0 ? <DropdownMenu.Separator className="mb-1 h-px bg-line" /> : null}
          {menu.map((m) =>
            m.kind === "link" ? (
              <DropdownMenu.Item key={m.label} asChild>
                <Link href={m.href} className={item}>
                  {m.label}
                </Link>
              </DropdownMenu.Item>
            ) : m.kind === "toggle" ? (
              <DropdownMenu.CheckboxItem
                key={m.label}
                checked={m.checked}
                onCheckedChange={m.onCheckedChange}
                onSelect={(e) => e.preventDefault()}
                className={item}
              >
                {m.label}
                <DropdownMenu.ItemIndicator>
                  <Check aria-hidden className="size-3.5 text-accent-text" strokeWidth={2.5} />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.CheckboxItem>
            ) : (
              <DropdownMenu.Item key={m.label} onSelect={m.onSelect} className={item}>
                {m.label}
              </DropdownMenu.Item>
            ),
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Theme Color: the three accent themes; a pick applies at once. */
export function ThemeColorPopover({
  accent,
  onAccentChange,
  side = "top",
  children,
}: {
  accent: AccentTheme;
  onAccentChange: (theme: AccentTheme) => void;
  side?: "top" | "right";
  children: React.ReactElement;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={side === "top" ? "end" : "end"}
          sideOffset={8}
          collisionPadding={16}
          aria-label="Theme color"
          className="z-50 flex w-[170px] flex-col gap-1 rounded-xl border border-line bg-surface p-4 font-bomstad shadow-popover outline-none"
        >
          <span className="text-body-sm font-semibold text-ink">Theme Color</span>
          <div role="radiogroup" aria-label="Theme color" className="flex gap-3.5">
            {ACCENT_THEMES.map((theme) => {
              const picked = theme === accent;
              return (
                <button
                  key={theme}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => onAccentChange(theme)}
                  className={cn("flex w-9 cursor-pointer flex-col items-center rounded-sm", FOCUS)}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border-2",
                      picked ? "border-accent" : "border-transparent",
                    )}
                  >
                    <span className={cn("flex size-6.5 items-center justify-center rounded-full", SWATCH[theme])}>
                      {picked ? <Check aria-hidden className="size-3 text-accent-contrast" strokeWidth={3} /> : null}
                    </span>
                  </span>
                  <span className={cn("text-micro", picked ? "text-ink" : "text-ink-3")}>{ACCENT_LABEL[theme]}</span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
