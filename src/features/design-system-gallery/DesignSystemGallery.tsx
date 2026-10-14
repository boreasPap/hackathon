"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import * as NavIcons from "@/components/design-system/icons/nav-icons";
import {
  COMPARE_OFF,
  addDays,
  dateRangeToParams,
  resolveCompare,
  resolveDateRange,
  utcToday,
  type CompareValue,
  type DateRangeValue,
  type SavedDateRangePreset,
  type SavePresetInput,
} from "@/lib/date-range";
import { formatDate, formatDateRange } from "@/lib/format";
import type { IconProps } from "@/components/design-system/icons/nav-icons";
import {
  AllPlatformsIcon,
  AndroidIcon,
  AppleIcon,
  AppsIcon,
  BarViewIcon,
  Button,
  CalendarIcon,
  Checkbox,
  CombinedViewIcon,
  ComparePicker,
  Sidebar,
  type SidebarSection,
  type SidebarWorkspace,
  DateRangePicker,
  KpiCard,
  PageHeader,
  TrendChartCard,
  type TrendChartType,
  type TrendPeriod,
  type TrendSeries,
  type TrendView,
  CountriesIcon,
  DiscountIcon,
  DropdownPanel,
  type DropdownOption,
  FilterPill,
  FilterToggle,
  GoogleAdsLogo,
  GridIcon,
  BoxIcon,
  BarChartIcon,
  ShoppingBagIcon,
  UserIcon,
  PapcornsMark,
  WorkspaceEyeIcon,
  IconButton,
  Input,
  Label,
  LineViewIcon,
  MetaLogo,
  MoonIcon,
  NonOrganicIcon,
  OrganicIcon,
  PerAppViewIcon,
  PieViewIcon,
  PlatformsIcon,
  PlusIcon,
  RadioGroup,
  SearchIcon,
  SearchInput,
  SegmentedControl,
  Select,
  SidebarIcon,
  Switch,
  TikTokLogo,
  WebFunnelIcon,
} from "@/components/design-system";

type Theme = "blue" | "lilac" | "green";
type Mode = "light" | "dark";

const THEMES: Theme[] = ["blue", "lilac", "green"];
const MODES: Mode[] = ["light", "dark"];

type Swatch = { token: string; utility: string; className: string };

const COLOR_GROUPS: { title: string; swatches: Swatch[] }[] = [
  {
    title: "Neutral",
    swatches: [
      { token: "--bg-page", utility: "bg-page", className: "bg-page" },
      { token: "--bg-surface", utility: "bg-surface", className: "bg-surface" },
      { token: "--bg-muted", utility: "bg-muted", className: "bg-muted" },
      { token: "--border", utility: "border-line", className: "bg-line" },
      { token: "--border-strong", utility: "border-line-strong", className: "bg-line-strong" },
      { token: "--text-primary", utility: "text-ink", className: "bg-ink" },
      { token: "--text-secondary", utility: "text-ink-2", className: "bg-ink-2" },
      { token: "--text-tertiary", utility: "text-ink-3", className: "bg-ink-3" },
    ],
  },
  {
    title: "Accent",
    swatches: [
      { token: "--accent", utility: "bg-accent", className: "bg-accent" },
      { token: "--accent-hover", utility: "bg-accent-hover", className: "bg-accent-hover" },
      { token: "--accent-active", utility: "bg-accent-active", className: "bg-accent-active" },
      { token: "--accent-muted", utility: "bg-accent-muted", className: "bg-accent-muted" },
      { token: "--accent-subtle", utility: "bg-accent-subtle", className: "bg-accent-subtle" },
      { token: "--accent-border", utility: "border-accent-border", className: "bg-accent-border" },
      { token: "--accent-contrast", utility: "text-accent-contrast", className: "bg-accent-contrast" },
      { token: "--accent-text", utility: "text-accent-text", className: "bg-accent-text" },
    ],
  },
  {
    title: "Semantic",
    swatches: [
      { token: "--success", utility: "text-success", className: "bg-success" },
      { token: "--success-bg", utility: "bg-success-bg", className: "bg-success-bg" },
      { token: "--danger", utility: "text-danger", className: "bg-danger" },
      { token: "--danger-bg", utility: "bg-danger-bg", className: "bg-danger-bg" },
      { token: "--warning", utility: "text-warning", className: "bg-warning" },
      { token: "--warning-bg", utility: "bg-warning-bg", className: "bg-warning-bg" },
      { token: "info = --accent", utility: "text-info", className: "bg-info" },
      { token: "info-bg = --accent-subtle", utility: "bg-info-bg", className: "bg-info-bg" },
    ],
  },
  {
    title: "Data viz",
    swatches: [
      { token: "--viz-installs", utility: "bg-viz-installs", className: "bg-viz-installs" },
      { token: "--viz-cost", utility: "bg-viz-cost", className: "bg-viz-cost" },
      { token: "--viz-cps", utility: "bg-viz-cps", className: "bg-viz-cps" },
      { token: "--viz-revenue", utility: "bg-viz-revenue", className: "bg-viz-revenue" },
      { token: "--viz-subscribe", utility: "bg-viz-subscribe", className: "bg-viz-subscribe" },
      { token: "--viz-arpu", utility: "bg-viz-arpu", className: "bg-viz-arpu" },
      { token: "--viz-retention", utility: "bg-viz-retention", className: "bg-viz-retention" },
      { token: "--viz-pltv", utility: "bg-viz-pltv", className: "bg-viz-pltv" },
    ],
  },
  {
    title: "Workspace identity",
    swatches: [
      { token: "--workspace-papcorns", utility: "bg-workspace-papcorns", className: "bg-workspace-papcorns" },
      { token: "--workspace-intelligence", utility: "bg-workspace-intelligence", className: "bg-workspace-intelligence" },
      { token: "--workspace-growth", utility: "bg-workspace-growth", className: "bg-workspace-growth" },
      { token: "--workspace-creative", utility: "bg-workspace-creative", className: "bg-workspace-creative" },
    ],
  },
];

const TYPE_SCALE: { utility: string; extra?: string; spec: string; sample: string }[] = [
  { utility: "text-page-title", spec: "28 / 39 · 600", sample: "Weekly Report" },
  { utility: "text-section-title", spec: "28 / 39 · 600 · -0.35", sample: "Trend Chart" },
  { utility: "text-page-desc", extra: "text-ink-3", spec: "14 / 20 · 500", sample: "Multi-channel cross-app performance, lifetime cohort forecasts & ad attribution." },
  { utility: "text-kpi-value", extra: "font-num tabular-nums", spec: "system 32 / 38 · 600", sample: "$24.4K" },
  { utility: "text-kpi-label", extra: "uppercase text-ink-2", spec: "11 / 15 · 600 · uppercase", sample: "Total Spend" },
  { utility: "text-body", extra: "text-ink-2", spec: "13 / 19.5 · 500", sample: "Last 7 Days · All Apps · Channels" },
  { utility: "text-body-sm", extra: "text-ink-2", spec: "12 / 18 · 500", sample: "Apple Search Ads · Cost per Subscribe" },
  { utility: "text-caption", extra: "text-ink-3", spec: "11 / 16.5 · 500", sample: "17 Sep – 24 Sep 2026" },
  { utility: "text-micro", extra: "text-ink-3", spec: "10 / 15 · 500", sample: "1 of 8 selected" },
  { utility: "text-delta", extra: "font-num tabular-nums text-danger", spec: "system 11 / 15 · 600", sample: "-$5.6K" },
  { utility: "text-body-sm", extra: "font-num font-semibold tabular-nums", spec: "system 12 · 600 · axis, tooltip value", sample: "800K   754K   144K" },
  { utility: "text-body-sm", extra: "font-num tabular-nums text-ink", spec: "system 12 · 500 · legend value", sample: "28K   48%" },
  { utility: "font-sans", extra: "text-body text-ink", spec: "default stack · words Bomstad, numbers system", sample: "Spend $12,345.67 · Installs 1,204 · CPI -3.2%" },
  { utility: "font-bomstad", extra: "text-body text-ink", spec: "every glyph Bomstad · dates, calendar, counters", sample: "17 Sep – 24 Sep 2026 · Y1 D0 ROAS · Last 7 Days" },
  { utility: "text-overline", extra: "uppercase text-ink-3", spec: "11 / 15 · 600 · ls 1 · uppercase", sample: "Presets" },
  { utility: "text-code", extra: "font-mono text-ink-2", spec: "DM Mono 12 / 18 · 400", sample: "weekly.14.99.with.11.99.intro" },
];

const RADII = [
  { utility: "rounded-xs", value: "6" },
  { utility: "rounded-sm", value: "8" },
  { utility: "rounded-md", value: "10" },
  { utility: "rounded-lg", value: "12" },
  { utility: "rounded-xl", value: "16" },
  { utility: "rounded-full", value: "9999" },
];

const SHADOWS = ["shadow-xs", "shadow-sm", "shadow-popover", "shadow-modal"];

const ICONS: [string, ComponentType<IconProps>][] = Object.entries(NavIcons).filter(([name]) =>
  name.endsWith("Icon"),
);

function AllTile() {
  return (
    <span className="flex size-6 items-center justify-center rounded-xs bg-accent text-accent-contrast">
      <AllPlatformsIcon />
    </span>
  );
}

// Stand-in for an app icon image: real pages pass <img className="size-6 rounded-xs" />.
function AppTile({ name }: { name: string }) {
  return (
    <span className="flex size-6 items-center justify-center rounded-xs bg-muted text-micro font-semibold text-ink-2">
      {name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

const APP_OPTIONS: DropdownOption[] = [
  ["photo-studio-ios", "Photo Studio", "ios"],
  ["photo-studio-android", "Photo Studio", "android"],
  ["fit-coach-ios", "Fit Coach", "ios"],
  ["fit-coach-android", "Fit Coach", "android"],
  ["sleep-sounds-ios", "Sleep Sounds", "ios"],
  ["sleep-sounds-android", "Sleep Sounds", "android"],
  ["note-scan-ios", "Note Scan", "ios"],
].map(([id, name, platform]) => ({
  id,
  label: name,
  leading: <AppTile name={name} />,
  trailing: platform === "ios" ? <AppleIcon className="text-ink" /> : <AndroidIcon />,
}));

const CHANNEL_OPTIONS: DropdownOption[] = [
  "Organic",
  "Paid Search",
  "Paid Social",
  "Display",
  "Referral",
].map((name) => ({ id: name.toLowerCase().replace(/\s+/g, "-"), label: name }));

const METRIC_OPTIONS: DropdownOption[] = [
  ["installs", "Installs", "Acquisition", "bg-viz-installs"],
  ["cost", "Cost", "Acquisition", "bg-viz-cost"],
  ["cps", "Cost per Subscribe", "Acquisition", "bg-viz-cps"],
  ["revenue", "Revenue", "Revenue", "bg-viz-revenue"],
  ["subscribe", "Subscribe", "Revenue", "bg-viz-subscribe"],
  ["arpu", "ARPU", "Revenue", "bg-viz-arpu"],
  ["retention", "Retention", "Retention", "bg-viz-retention"],
  ["pltv", "pLTV", "Retention", "bg-viz-pltv"],
].map(([id, label, group, dot]) => ({
  id,
  label,
  group,
  leading: <span className={cn("size-2.5 rounded-full", dot)} />,
}));

// Trend Chart sample data (made up).
const TREND_BUCKETS = ["Jun", "Jul", "Aug", "Sep"];
const TREND_BUCKET_TITLES = ["Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"];
const TREND_DATA: Record<string, Omit<TrendSeries, "id">> = {
  installs: { label: "Installs", color: "--viz-installs", unit: "count", values: [42000, 48000, 45000, 51000] },
  cost: { label: "Cost", color: "--viz-cost", unit: "currency", values: [18000, 21000, 20000, 22000] },
  cps: { label: "Cost per Subscribe", color: "--viz-cps", unit: "currency", values: [6, 5.8, 6.2, 5.5] },
  revenue: { label: "Revenue", color: "--viz-revenue", unit: "currency", values: [30000, 36000, 33000, 40000] },
  subscribe: { label: "Subscribe", color: "--viz-subscribe", unit: "count", values: [3000, 3600, 3200, 4000] },
  arpu: { label: "ARPU", color: "--viz-arpu", unit: "currency", values: [0.71, 0.75, 0.73, 0.78] },
  retention: { label: "Retention", color: "--viz-retention", unit: "percent", values: [0.3, 0.32, 0.31, 0.34] },
  pltv: { label: "pLTV", color: "--viz-pltv", unit: "currency", values: [36000, 42000, 39000, 46000] },
};
// Per App and Pie: Revenue split across apps.
const TREND_APPS = [
  { id: "photo-studio", label: "Photo Studio", color: "--viz-revenue", values: [12000, 15000, 13000, 16000] },
  { id: "fit-coach", label: "Fit Coach", color: "--viz-installs", values: [9000, 10000, 10000, 12000] },
  { id: "sleep-sounds", label: "Sleep Sounds", color: "--viz-subscribe", values: [6000, 7000, 6500, 8000] },
  { id: "note-scan", label: "Note Scan", color: "--viz-arpu", values: [3000, 4000, 3500, 4000] },
];

const PLATFORM_OPTIONS: DropdownOption[] = [
  { id: "organic", label: "Organic", leading: <OrganicIcon className="text-ink" /> },
  { id: "non-organic", label: "Non-Organic", leading: <NonOrganicIcon className="text-ink" /> },
  { id: "meta", label: "Meta", leading: <MetaLogo /> },
  { id: "tiktok", label: "TikTok", leading: <TikTokLogo className="text-ink" /> },
  { id: "apple", label: "Apple", leading: <AppleIcon className="text-ink" /> },
  { id: "google-ads", label: "Google Ads", leading: <GoogleAdsLogo /> },
];

function pillLabel(ids: string[], options: DropdownOption[], none: string, many: string) {
  if (ids.length === 0) return none;
  if (ids.length === 1) return options.find((o) => o.id === ids[0])?.label ?? many;
  return many;
}

function toHex(color: string): string {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const [r, g, b, a] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  const hex = "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
  return a !== undefined && a < 1 ? `${hex} / ${Math.round(a * 100)}%` : hex;
}

function SwatchCard({ swatch, version }: { swatch: Swatch; version: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  useEffect(() => {
    if (ref.current) setValue(toHex(getComputedStyle(ref.current).backgroundColor));
  }, [version]);
  return (
    <div className="flex flex-col gap-2">
      <div ref={ref} className={cn("h-14 rounded-sm border border-line", swatch.className)} />
      <div className="flex flex-col">
        <span className="text-body-sm text-ink">{swatch.token}</span>
        <span className="text-micro text-ink-3">{swatch.utility}</span>
        <span className="text-micro font-mono text-ink-3">{value}</span>
      </div>
    </div>
  );
}

const RANGE_DEFAULT: DateRangeValue = { mode: "last", days: 7 };

// Sample cards (made-up numbers) with a previous period. Colours follow
// polarity, so Spend stays neutral and a longer breakeven or a higher
// cancellation rate reads red.
const KPI_RANGE = { from: "2026-08-10", to: "2026-08-16" };
const KPI_ROW1 = [
  { metric: "total_spend", value: 24400, previous: 30000, sparkline: [48, 46, 41, 38, 36, 35, 34] },
  { metric: "total_revenue", value: 31200, previous: 27000, sparkline: [36, 38, 40, 41, 43, 44, 46] },
  { metric: "d0_roas", value: 0.42, previous: 0.5, sparkline: [0.5, 0.49, 0.47, 0.46, 0.44, 0.43, 0.42] },
  { metric: "subscriptions", value: 1800, previous: 2400, sparkline: [3.4, 3.2, 3.0, 2.8, 2.7, 2.6, 2.6] },
] as const;
const KPI_ROW2 = [
  { metric: "breakeven_days", value: 120, previous: 90, sparkline: [90, 96, 102, 108, 113, 117, 120] },
  { metric: "total_installs", value: 52000, previous: 60000, sparkline: [60, 58, 56, 55, 54, 53, 52] },
  { metric: "d0_cancellation_rate", value: 0.32, previous: 0.3, sparkline: [0.3, 0.3, 0.31, 0.31, 0.32, 0.31, 0.32] },
  { metric: "avg_cpi", value: 0.47, previous: 0.5, sparkline: [0.5, 0.5, 0.49, 0.48, 0.48, 0.47, 0.47] },
] as const;

// What the page would get from a range: its days today and the query string.
function CompareReadout({ value, range }: { value: CompareValue; range: { from: string; to: string } | null }) {
  const days = resolveCompare(value, range);
  return <span className="text-caption text-ink-3">{days ? `deltas vs ${formatDateRange(days.from, days.to)}` : "no deltas"}</span>;
}

const SIDEBAR_WORKSPACES: SidebarWorkspace[] = [
  { id: "dashboard", name: "Papcorns", href: "#", color: "papcorns", icon: <PapcornsMark size={18} /> },
  { id: "second", name: "Second Workspace", href: "#", color: "intelligence", icon: <WorkspaceEyeIcon /> },
];

// The main workspace, another one (its own tile and name in the header) and the rail.
const SIDEBAR_VARIANTS = [
  { workspace: "dashboard", rail: false },
  { workspace: "second", rail: false },
  { workspace: "second", rail: true },
];

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    id: "main",
    items: [
      { id: "overview", label: "Overview", href: "#", icon: <GridIcon className="size-6" />, active: true },
      { id: "inventory", label: "Inventory", href: "#", icon: <BoxIcon className="size-6" /> },
      {
        id: "reports",
        label: "Reports",
        icon: <BarChartIcon className="size-6" />,
        active: true,
        children: [
          { id: "daily", label: "Daily", href: "#" },
          { id: "weekly", label: "Weekly", href: "#" },
          { id: "monthly", label: "Monthly", href: "#" },
        ],
      },
      {
        id: "orders",
        label: "Orders",
        icon: <ShoppingBagIcon className="size-6" />,
        children: [{ id: "returns", label: "Returns", href: "#" }],
      },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [{ id: "team", label: "Team", href: "#", icon: <UserIcon className="size-6" /> }],
  },
  { id: "planned", label: "Planned", items: [], emptyText: "Coming soon" },
];

function RangeReadout({ value, defaultValue, maxDate }: { value: DateRangeValue; defaultValue: DateRangeValue; maxDate: string }) {
  const days = resolveDateRange(value, { maxDate });
  const query = Object.entries(dateRangeToParams(value, defaultValue))
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return (
    <span className="text-caption text-ink-3">
      {days ? formatDateRange(days.from, days.to) : "No complete day"} ·{" "}
      <code className="font-mono text-code">{query ? `?${query}` : "default, no params"}</code>
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl bg-surface p-4">
      <h2 className="text-overline uppercase text-ink-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[220px_1fr] items-center gap-4">
      <span className="text-micro text-ink-3">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-sm bg-muted p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "rounded-xs px-3 py-1 text-body capitalize",
            o === value ? "bg-surface text-ink shadow-xs" : "text-ink-3",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function DesignSystemGallery() {
  const [theme, setTheme] = useState<Theme>("blue");
  const [mode, setMode] = useState<Mode>("light");
  const [toggle, setToggle] = useState(true);
  const [switchOn, setSwitchOn] = useState(false);
  const [os, setOs] = useState<"all" | "ios" | "android" | "web">("all");
  const [period, setPeriod] = useState<"month" | "week" | "day">("month");
  const [split, setSplit] = useState<"combined" | "per-app">("combined");
  const [chart, setChart] = useState<"line" | "bar" | "pie">("line");
  const [checks, setChecks] = useState({ meta: true, tiktok: true, organic: false });
  const [visibility, setVisibility] = useState<"me" | "project">("me");
  const [rangeMode, setRangeMode] = useState<"between" | "last" | "since" | "this">("between");
  const [apps, setApps] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<string[]>(["installs"]);
  const [platforms, setPlatforms] = useState<string[]>(["organic", "asa"]);
  const [range, setRange] = useState<DateRangeValue>(RANGE_DEFAULT);
  const [hourly, setHourly] = useState<DateRangeValue>(RANGE_DEFAULT);
  const [compare, setCompare] = useState<CompareValue>(COMPARE_OFF);
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [lastDay, setLastDay] = useState<"yesterday" | "2 days ago">("yesterday");
  const [savedRanges, setSavedRanges] = useState<SavedDateRangePreset[]>([
    { id: 1, name: "Q3 2026", value: { mode: "between", from: "2026-07-01", to: "2026-09-30" }, visibility: "everyone", removable: false },
  ]);
  const [defaultRangeId, setDefaultRangeId] = useState<number | null>(null);
  const [trendMetrics, setTrendMetrics] = useState<string[]>(["installs", "cost", "revenue", "subscribe"]);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("month");
  const [trendView, setTrendView] = useState<TrendView>("combined");
  const [trendChart, setTrendChart] = useState<TrendChartType>("line");
  const trendSeries: TrendSeries[] =
    trendView === "per-app"
      ? TREND_APPS.map((app) => ({ ...app, unit: "currency" as const }))
      : trendMetrics.map((id) => ({ id, ...TREND_DATA[id] }));
  const dataDay = addDays(utcToday(), lastDay === "yesterday" ? -1 : -2);
  const rangeDefault = savedRanges.find((p) => p.id === defaultRangeId)?.value ?? RANGE_DEFAULT;
  const saveRange = (input: SavePresetInput) => {
    const id = Date.now();
    setSavedRanges((list) => [
      ...list,
      { id, name: input.name, value: input.value, visibility: input.visibility, removable: true },
    ]);
    if (input.isDefault) setDefaultRangeId(id);
  };
  const version = `${theme}-${mode}`;

  // Theme and mode go on <html>, as in the app, so popovers rendered into
  // <body> (DropdownPanel, Select) follow them too. Restored on leave.
  useEffect(() => {
    const html = document.documentElement;
    const previousTheme = html.getAttribute("data-theme");
    const wasDark = html.classList.contains("dark");
    html.setAttribute("data-theme", theme);
    html.classList.toggle("dark", mode === "dark");
    return () => {
      if (previousTheme) html.setAttribute("data-theme", previousTheme);
      html.classList.toggle("dark", wasDark);
    };
  }, [theme, mode]);

  return (
    <div className="min-h-screen bg-page font-bomstad text-ink">
      <div className="mx-auto flex max-w-(--content-max-w) flex-col gap-8 px-8 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-page-title">Design System</h1>
            <p className="text-page-desc text-ink-3">
              Tokens and components from docs/frontend. Local preview only.
            </p>
          </div>
          <div className="flex gap-3">
            <Choice options={THEMES} value={theme} onChange={setTheme} />
            <Choice options={MODES} value={mode} onChange={setMode} />
          </div>
        </header>

        {COLOR_GROUPS.map((group) => (
          <Section key={group.title} title={group.title}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {group.swatches.map((s) => (
                <SwatchCard key={s.token} swatch={s} version={version} />
              ))}
            </div>
          </Section>
        ))}

        <Section title="Typography">
          <div className="flex flex-col divide-y divide-line">
            {TYPE_SCALE.map((t) => (
              <div key={`${t.utility} ${t.extra ?? ""}`} className="grid grid-cols-[220px_1fr] items-baseline gap-4 py-3">
                <div className="flex flex-col">
                  <span className="text-body-sm text-ink">{t.utility}</span>
                  <span className="text-micro text-ink-3">
                    {t.spec}
                    {t.extra ? ` · + ${t.extra}` : ""}
                  </span>
                </div>
                <span className={cn(t.utility, t.extra)}>{t.sample}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius">
          <div className="flex flex-wrap gap-6">
            {RADII.map((r) => (
              <div key={r.utility} className="flex flex-col items-center gap-2">
                <div className={cn("size-16 border border-line-strong bg-muted", r.utility)} />
                <span className="text-micro text-ink-3">
                  {r.utility} · {r.value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Shadow">
          <div className="flex flex-wrap gap-8 bg-page p-6">
            {SHADOWS.map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <div className={cn("h-16 w-28 rounded-sm bg-surface", s)} />
                <span className="text-micro text-ink-3">{s}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Button">
          <div className="flex flex-col gap-5">
            <Row label="primary · md / lg block">
              <Button>Apply</Button>
              <Button disabled>Apply</Button>
              <div className="w-64">
                <Button size="lg" block>
                  Apply
                </Button>
              </div>
            </Row>
            <Row label="secondary">
              <Button variant="secondary">
                <PlusIcon />
                Add Metric
              </Button>
              <Button variant="secondary" disabled>
                <PlusIcon />
                Add Metric
              </Button>
            </Row>
            <Row label="ghost · link">
              <Button variant="ghost">Cancel</Button>
              <Button variant="ghost">Clear</Button>
              <Button variant="link">Delete All</Button>
              <Button variant="link">Save as Preset</Button>
              <Button variant="link">+ Add time</Button>
            </Row>
            <Row label="footer (date picker)">
              <div className="flex w-[486px] items-center justify-between border-t border-line pt-4">
                <Button variant="link">Save as Preset</Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost">Cancel</Button>
                  <Button>Apply</Button>
                </div>
              </div>
            </Row>
            <Row label="IconButton · md / sm bordered / danger">
              <IconButton aria-label="Collapse sidebar">
                <SidebarIcon />
              </IconButton>
              <IconButton size="sm" bordered aria-label="Theme">
                <MoonIcon />
              </IconButton>
              <IconButton tone="danger" aria-label="Delete">
                <Trash2 />
              </IconButton>
            </Row>
          </div>
        </Section>

        <Section title="FilterPill · FilterToggle">
          <div className="flex flex-col gap-5">
            <Row label="default · count">
              <FilterPill icon={<CountriesIcon className="size-4" />} label="Countries" />
              <FilterPill icon={<CountriesIcon className="size-4" />} label="Countries" count={2} />
              <FilterPill icon={<AppsIcon />} label="Apps" count={2} />
              <FilterPill icon={<SearchIcon />} label="Channels" count={2} />
            </Row>
            <Row label="active">
              <FilterPill icon={<CalendarIcon />} label="9 Aug – 11 Sep 2026" active />
            </Row>
            <Row label="filter bar">
              <FilterPill icon={<CalendarIcon />} label="Last 7 Days" />
              <FilterPill icon={<AppsIcon />} label="All Apps" />
              <FilterPill icon={<SearchIcon />} label="Channels" />
              <FilterToggle
                icon={<DiscountIcon />}
                label="Apply discount"
                checked={toggle}
                onCheckedChange={setToggle}
              />
            </Row>
          </div>
        </Section>

        <Section title="DropdownPanel">
          <Row label="Apps · Channels · Add Metric · Platforms">
            <DropdownPanel
              trigger={
                <FilterPill
                  icon={<AppsIcon />}
                  label={pillLabel(apps, APP_OPTIONS, "All Apps", "Apps")}
                  count={apps.length > 1 ? apps.length : undefined}
                />
              }
              searchPlaceholder="Search apps…"
              allOption={{ label: "All Apps", leading: <AllTile /> }}
              options={APP_OPTIONS}
              value={apps}
              onApply={setApps}
            />
            <DropdownPanel
              trigger={
                <FilterPill
                  icon={<SearchIcon />}
                  label={pillLabel(channels, CHANNEL_OPTIONS, "Channels", "Channels")}
                  count={channels.length > 1 ? channels.length : undefined}
                />
              }
              searchPlaceholder="Search channels…"
              allOption={{ label: "All Channels" }}
              options={CHANNEL_OPTIONS}
              value={channels}
              onApply={setChannels}
            />
            <DropdownPanel
              trigger={
                <Button variant="secondary">
                  <PlusIcon />
                  Add Metric
                </Button>
              }
              searchPlaceholder="Search metrics…"
              options={METRIC_OPTIONS}
              value={metrics}
              onApply={setMetrics}
              showCount
            />
            <DropdownPanel
              variant="checklist"
              title="Select platforms"
              trigger={
                <FilterPill
                  icon={<PlatformsIcon />}
                  label={pillLabel(platforms, PLATFORM_OPTIONS, "All Platforms", "Platforms")}
                  count={platforms.length > 1 ? platforms.length : undefined}
                />
              }
              options={PLATFORM_OPTIONS}
              value={platforms}
              onApply={setPlatforms}
            />
          </Row>
        </Section>

        <Section title="DateRangePicker">
          <Row label="data that ends on an earlier day (maxDate)">
            <DateRangePicker
              value={range}
              onApply={setRange}
              defaultValue={rangeDefault}
              maxDate={dataDay}
              maxDateNote={`Data is complete through ${formatDate(dataDay)}.`}
              savedPresets={savedRanges}
              onSavePreset={saveRange}
              onDeletePreset={(id) => setSavedRanges((list) => list.filter((p) => p.id !== id))}
            />
            <Choice options={["yesterday", "2 days ago"]} value={lastDay} onChange={setLastDay} />
            <RangeReadout value={range} defaultValue={rangeDefault} maxDate={dataDay} />
          </Row>
          <Row label="live hourly data (+ Add time)">
            <DateRangePicker value={hourly} onApply={setHourly} defaultValue={RANGE_DEFAULT} allowTime />
            <RangeReadout value={hourly} defaultValue={RANGE_DEFAULT} maxDate={utcToday()} />
          </Row>
          <Row label="ComparePicker (the range above, off by default)">
            <ComparePicker
              value={compare}
              onChange={setCompare}
              range={resolveDateRange(range, { maxDate: dataDay })}
              maxDate={dataDay}
            />
            <CompareReadout value={compare} range={resolveDateRange(range, { maxDate: dataDay })} />
          </Row>
        </Section>

        <Section title="PageHeader">
          <div className="rounded-lg bg-page p-8">
            <PageHeader
              title="Weekly Report"
              description="Spend, revenue and installs across apps."
              actions={<Button variant="secondary">Export CSV</Button>}
              filters={
                <>
                  <DateRangePicker
                    value={range}
                    onApply={setRange}
                    defaultValue={rangeDefault}
                    maxDate={dataDay}
                    maxDateNote={`Data is complete through ${formatDate(dataDay)}.`}
                  />
                  <ComparePicker
                    value={compare}
                    onChange={setCompare}
                    range={resolveDateRange(range, { maxDate: dataDay })}
                    maxDate={dataDay}
                  />
                  <DropdownPanel
                    trigger={
                      <FilterPill
                        icon={<AppsIcon />}
                        label={pillLabel(apps, APP_OPTIONS, "All Apps", "Apps")}
                        count={apps.length > 1 ? apps.length : undefined}
                      />
                    }
                    searchPlaceholder="Search apps…"
                    allOption={{ label: "All Apps", leading: <AllTile /> }}
                    options={APP_OPTIONS}
                    value={apps}
                    onApply={setApps}
                  />
                  <DropdownPanel
                    variant="checklist"
                    title="Select platforms"
                    trigger={
                      <FilterPill
                        icon={<PlatformsIcon />}
                        label={pillLabel(platforms, PLATFORM_OPTIONS, "All Platforms", "Platforms")}
                        count={platforms.length > 1 ? platforms.length : undefined}
                      />
                    }
                    options={PLATFORM_OPTIONS}
                    value={platforms}
                    onApply={setPlatforms}
                  />
                  <FilterToggle
                    icon={<DiscountIcon />}
                    label="Apply discount"
                    checked={toggle}
                    onCheckedChange={setToggle}
                  />
                </>
              }
            />
          </div>
        </Section>

        <Section title="Sidebar">
          <div className="flex h-[640px] gap-6 overflow-x-auto rounded-lg bg-page p-4">
            {SIDEBAR_VARIANTS.map(({ workspace, rail }) => (
              <Sidebar
                key={`${workspace}-${rail}`}
                workspaces={SIDEBAR_WORKSPACES}
                current={workspace}
                workspaceInHeader={workspace !== "dashboard"}
                sections={SIDEBAR_SECTIONS}
                collapsed={rail || railCollapsed}
                onCollapsedChange={rail ? undefined : setRailCollapsed}
                user={{
                  name: "Hackathon Builder",
                  role: "Designer",
                  email: "builder@example.com",
                  menu: [
                    { kind: "link", label: "Settings", href: "#" },
                    { kind: "toggle", label: "Compact mode", checked: false, onCheckedChange: () => {} },
                    { kind: "action", label: "Sign out", onSelect: () => {} },
                  ],
                }}
                accent={theme}
                onAccentChange={setTheme}
                dark={mode === "dark"}
                onDarkChange={(dark) => setMode(dark ? "dark" : "light")}
                className="rounded-lg border"
              />
            ))}
          </div>
        </Section>

        <Section title="KpiCard">
          <div className="grid grid-cols-[repeat(4,342px)] gap-4 overflow-x-auto rounded-lg bg-page p-4">
            {KPI_ROW1.map((card) => (
              <KpiCard key={card.metric} {...card} sparkline={[...card.sparkline]} range={KPI_RANGE} />
            ))}
          </div>
          <div className="grid grid-cols-[repeat(6,223px)] gap-4 overflow-x-auto rounded-lg bg-page p-4">
            {KPI_ROW2.map((card) => (
              <KpiCard key={card.metric} {...card} sparkline={[...card.sparkline]} range={KPI_RANGE} size="sm" />
            ))}
          </div>
          <Row label="loading · no comparison · not reached">
            <div className="grid w-full grid-cols-3 gap-4 rounded-lg bg-page p-4">
              <KpiCard metric="total_revenue" value={null} loading range={KPI_RANGE} />
              <KpiCard metric="total_installs" value={208372} range={KPI_RANGE} />
              <KpiCard metric="breakeven_days" value={null} emptyText="Not reached" range={KPI_RANGE} />
            </div>
          </Row>
        </Section>

        <Section title="Trend ChartCard">
          <div className="rounded-lg bg-page p-4">
            <TrendChartCard
              source="Sample"
              buckets={TREND_BUCKETS}
              bucketTitles={TREND_BUCKET_TITLES}
              series={trendSeries}
              pie={{
                unit: "currency",
                slices: TREND_APPS.map((app) => ({ id: app.id, label: app.label, color: app.color, value: app.values[3] })),
              }}
              period={trendPeriod}
              onPeriodChange={setTrendPeriod}
              view={trendView}
              onViewChange={setTrendView}
              chart={trendChart}
              onChartChange={setTrendChart}
              metricOptions={METRIC_OPTIONS}
              metrics={trendMetrics}
              onMetricsChange={setTrendMetrics}
            />
          </div>
        </Section>

        <Section title="Switch">
          <Row label="off · on · disabled">
            <Switch checked={switchOn} onCheckedChange={setSwitchOn} aria-label="Example switch" />
            <Switch checked aria-label="On" />
            <Switch checked={false} disabled aria-label="Disabled" />
          </Row>
        </Section>

        <Section title="SegmentedControl">
          <div className="flex flex-col gap-5">
            <Row label="platform">
              <SegmentedControl
                aria-label="Platform"
                value={os}
                onValueChange={setOs}
                options={[
                  { value: "all", label: "OS System", icon: <AllPlatformsIcon /> },
                  { value: "ios", label: "iOS", icon: <AppleIcon className="size-4 text-ink" /> },
                  { value: "android", label: "Android", icon: <AndroidIcon className="size-4" /> },
                  { value: "web", label: "Web", icon: <WebFunnelIcon className="size-4" /> },
                ]}
              />
            </Row>
            <Row label="Trend Chart toolbar">
              <div className="flex items-center gap-3">
                <SegmentedControl
                  aria-label="Period"
                  value={period}
                  onValueChange={setPeriod}
                  options={[
                    { value: "month", label: "Month" },
                    { value: "week", label: "Week" },
                    { value: "day", label: "Day" },
                  ]}
                />
                <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
                <SegmentedControl
                  aria-label="Split"
                  value={split}
                  onValueChange={setSplit}
                  options={[
                    { value: "combined", label: "Combined", icon: <CombinedViewIcon /> },
                    { value: "per-app", label: "Per App", icon: <PerAppViewIcon /> },
                  ]}
                />
                <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
                <SegmentedControl
                  aria-label="Chart type"
                  value={chart}
                  onValueChange={setChart}
                  options={[
                    { value: "line", label: "Line", icon: <LineViewIcon /> },
                    { value: "bar", label: "Bar", icon: <BarViewIcon /> },
                    { value: "pie", label: "Pie", icon: <PieViewIcon /> },
                  ]}
                />
              </div>
            </Row>
          </div>
        </Section>

        <Section title="Form controls">
          <div className="flex flex-col gap-5">
            <Row label="Checkbox · off · on · disabled">
              <Checkbox
                aria-label="Organic"
                checked={checks.organic}
                onCheckedChange={(v) => setChecks((c) => ({ ...c, organic: v === true }))}
              />
              <Checkbox
                aria-label="Meta"
                checked={checks.meta}
                onCheckedChange={(v) => setChecks((c) => ({ ...c, meta: v === true }))}
              />
              <Checkbox aria-label="Disabled" checked={false} disabled />
              <Checkbox aria-label="Disabled on" checked disabled />
            </Row>
            <Row label="RadioGroup">
              <RadioGroup
                aria-label="Visibility"
                value={visibility}
                onValueChange={setVisibility}
                options={[
                  { value: "me", label: "Only you" },
                  { value: "project", label: "Everyone in this project" },
                ]}
              />
            </Row>
            <Row label="Label + Input md">
              <div className="flex w-[428px] flex-col gap-2">
                <Label htmlFor="ds-preset-name">Preset name</Label>
                <Input id="ds-preset-name" defaultValue="22 Sep – 28 Sep 2026" />
              </div>
            </Row>
            <Row label="Select + Input md (calendar row)">
              <div className="flex items-center gap-2">
                <Select
                  aria-label="Range mode"
                  value={rangeMode}
                  onValueChange={setRangeMode}
                  options={[
                    { value: "between", label: "Between" },
                    { value: "last", label: "Last" },
                    { value: "since", label: "Since" },
                    { value: "this", label: "This" },
                  ]}
                />
                <Input aria-label="From" className="w-40" defaultValue="22 Sep 2026" />
                <span className="text-caption text-ink-3">and</span>
                <Input aria-label="To" className="w-40" defaultValue="28 Sep 2026" />
              </div>
            </Row>
            <Row label="Input sm (time)">
              <div className="flex items-center gap-2">
                <span className="text-body-sm text-ink-3">From</span>
                <Input aria-label="From time" size="sm" className="w-19.5" defaultValue="00:00:00" />
                <span className="text-body-sm text-ink-3">to</span>
                <Input aria-label="To time" size="sm" className="w-19.5" defaultValue="23:59:59" />
              </div>
            </Row>
            <Row label="SearchInput">
              <div className="w-[254px]">
                <SearchInput aria-label="Search apps" placeholder="Search apps…" />
              </div>
            </Row>
          </div>
        </Section>

        <Section title="Icons">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-9">
            {ICONS.map(([name, Icon]) => (
              <div key={name} className="flex flex-col items-center gap-2 rounded-sm border border-line p-3 text-ink-2">
                <Icon />
                <span className="text-micro text-ink-3">{name}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
