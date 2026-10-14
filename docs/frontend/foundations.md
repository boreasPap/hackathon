# Foundations: how the design system is wired into the code

Values come from [design-system.md](design-system.md). This file says where
they live and which utility to write. Everything here is in
`src/app/globals.css` and `src/app/layout.tsx` unless stated otherwise.

## Tokens and utilities

Raw tokens are CSS variables with the design doc's names (`--bg-surface`,
`--accent-subtle`, …). Tailwind utilities are mapped to them in the
`@theme inline` block, so a utility always reads the token of the subtree it
is used in. Write the utility, not the variable.

### Color

| Design token | Utility (bg / text / border) | Use |
|---|---|---|
| `--bg-page` | `bg-page` | page background, search input |
| `--bg-surface` | `bg-surface` | card, sidebar, dropdown, pill |
| `--bg-muted` | `bg-muted` | segmented track, subtle fill, hover (interim) |
| `--border` | `border-line` (also the default border color) | card / pill / dropdown edge, divider |
| `--border-strong` | `border-line-strong` | secondary button edge |
| `--text-primary` | `text-ink` | headings, values, main text |
| `--text-secondary` | `text-ink-2` | body, labels, icons |
| `--text-tertiary` | `text-ink-3` | description, caption, placeholder, dates |
| `--accent` | `bg-accent` | primary button, active nav item, selected range ends, toggle on |
| `--accent-hover` / `--accent-active` | `bg-accent-hover` / `bg-accent-active` | hover / pressed of accent fills |
| `--accent-muted` | `bg-accent-muted` | chip, badge background |
| `--accent-subtle` | `bg-accent-subtle` | selected row, calendar range band |
| `--accent-border` | `border-accent-border` | accent border, focus ring |
| `--accent-contrast` | `text-accent-contrast` | text and icons on an accent fill |
| `--accent-text` | `text-accent-text` | accent-colored text: links, selected row text |
| `--success` / `--success-bg` | `text-success` / `bg-success-bg` | good delta |
| `--danger` / `--danger-bg` | `text-danger` / `bg-danger-bg` | bad delta, real error |
| `--warning` / `--warning-bg` | `text-warning` / `bg-warning-bg` | attention, data missing |
| info (= accent) | `text-info` / `bg-info-bg` | information |
| `--viz-<metric>` | `bg-viz-installs`, `text-viz-cost`, … | chart series, legend dots (fixed per metric) |
| `--series-<slot>` | `bg-series-own`, `bg-series-1` … `bg-series-7`, `bg-series-other` | chart series that are categories, not metrics (design-system.md §3.7) |
| `--workspace-<name>` | `bg-workspace-papcorns`, … | workspace identity only, never a theme |

Accent as text is always `text-accent-text`, never `text-accent`: in dark
mode the accent text is lighter (`#6B97FF`) while accent fills stay the same.

For chart libraries that need a color string in JS, read the variable at
runtime (`getComputedStyle(el).getPropertyValue("--viz-revenue")`) instead
of copying the hex.

### Type

`text-<name>` sets size, line height and weight (weight stays overridable
with `font-*`). Family and case are separate utilities.

| Utility | Size / line height / weight | Add |
|---|---|---|
| `text-page-title` | 28 / 39 / 600 | |
| `text-section-title` | 28 / 39 / 600, tracking -0.35px | |
| `text-page-desc` | 14 / 20 / 500 | `text-ink-3` |
| `text-kpi-value` | 32 / 38 / 600 | `font-num tabular-nums` |
| `text-kpi-label` | 11 / 15 / 600 | `uppercase` |
| `text-body` | 13 / 19.5 / 500 | controls: pill, button, input, search |
| `text-body-sm` | 12 / 18 / 500 | list rows, legend, chips |
| `text-caption` | 11 / 16.5 / 500 | `text-ink-3` |
| `text-micro` | 10 / 15 / 500 | compact KPI card, counters |
| `text-delta` | 11 / 15 / 600 | `font-num tabular-nums` |
| `text-overline` | 11 / 15 / 600, tracking 1px | `uppercase` |
| `text-code` | 12 / 18 / 400 | `font-mono` |

Half sizes in the design (12.5, 10.5) round down to 12 / 10.

### Radius, shadow, spacing

| Design token | Utility |
|---|---|
| `--radius-xs` 6 | `rounded-xs` |
| `--radius-sm` 8 | `rounded-sm` |
| `--radius-md` 10 | `rounded-md` |
| `--radius-lg` 12 | `rounded-lg` |
| `--radius-xl` 16 | `rounded-xl` |
| `--radius-full` | `rounded-full` |
| `--shadow-xs`, `--shadow-sm`, `--shadow-popover`, `--shadow-modal` | `shadow-xs`, `shadow-sm`, `shadow-popover`, `shadow-modal` (switch with mode) |

Spacing needs no tokens: the design's `--space-N` equals Tailwind's `N`
(`--space-1_5` 6px = `gap-1.5`, `--space-4` 16px = `p-4`).

Layout tokens are plain variables: `--sidebar-w` 232px,
`--sidebar-w-collapsed` 64px, `--content-max-w` 1416px, `--content-pad-l`
32px, `--content-pad-r` 24px (`max-w-(--content-max-w)`, `pl-(--content-pad-l)`).

## Typography

The rule: **words are Bomstad, numbers that are data are the system font.**
In a chart the month names and legend names are Bomstad while the axis
numbers, tooltip values and legend values are the system font; a KPI label
is Bomstad, its value and delta the system font.

Bomstad Display is a licensed font: its files are not in the repository.
When they are in `public/fonts/` (see the README there) the root layout adds
the faces declared in `src/lib/bomstad-font.ts`; without them every stack
below falls through to the system font and nothing else changes. Bomstad is
declared twice from the same files, once without numerals, which gives these
stacks:

| Utility | Stack | Use |
|---|---|---|
| `font-sans` | Bomstad for letters, the system font for `0-9 $ % + , - . £ € −` (and for `ğ Ğ ş Ş İ ₺`, missing from the web subset, and `ı`, which the files draw broken) | **Default of the whole app** (`<html>`). |
| `font-bomstad` | Bomstad for every glyph it has | Where the design sets digits in Bomstad: dates, calendar days, filter counters, labels like `D0 ROAS`, `Last 7 Days`. Design system components put it on their root. |
| `font-num` | System font for everything (SF Pro on Apple, Segoe UI, Roboto) | A data value whose letters must match too: `$24.4K` (the `K`), `120d`. Always with `tabular-nums`. |
| `font-prose` | System font for everything, like `font-num` | Long text: AI answers and chat bubbles, notes, summaries. Bomstad is a display face and falls apart over paragraphs, Turkish ones above all. Put it on the wrapper of the markdown or the paragraph, not on the page. |
| `font-mono` | DM Mono (Google Fonts) | Code, ids, routes. |

How it works: the letters-only face is declared with a `unicode-range`
that leaves out the numerals and the signs around them, so the browser takes
those glyphs from the next font in the stack, the system font. Chart.js takes the same
default stack (`ChartThemeSync`), so canvas labels are Bomstad and canvas
numbers the system font.

Only Medium (500), SemiBold (600) and ExtraBold (800, logo only) are shipped.
`font-bold` (700) is mapped to the SemiBold file and `font-normal` falls to
Medium, so nothing jumps to ExtraBold.

### Data values use the system font

Give data values `font-num tabular-nums` explicitly, weight 600
(`font-semibold`) unless noted. The default stack already puts their digits
in the system font, but `font-num` also takes the `K`, `M`, `d` suffixes and
keeps the number in one font.

| Data | Size / weight | Code |
|---|---|---|
| KPI value `$24.4K` | 32 / 600 | `text-kpi-value font-num tabular-nums` |
| Delta in the badge `-$5.6K` | 10–11 / 600 | `text-delta font-num tabular-nums` |
| Chart axis `40K` | 12 / 600 | `text-body-sm font-num font-semibold tabular-nums` |
| Tooltip value `36K` | 12 / 600 | `text-body-sm font-num font-semibold tabular-nums` |
| Legend value `28K`, `48%` | 12 / 500 | `text-body-sm font-num tabular-nums` (500) |
| Chart total `59K` | 40 / 600 | `font-num font-semibold tabular-nums` at 40px |
| Numeric table cells | | `font-num tabular-nums` |

Stay in Bomstad (`font-bomstad` on the element or its component): date
ranges (`10 Aug – 16 Aug 2026`), calendar days, date inputs, filter count
badges, labels with digits (`D0 ROAS`), "Total" and other words next to a
number.

## Theme and mode

Two independent axes, both inherited by a subtree:

1. **Accent theme**: `data-theme="blue" | "lilac" | "green"`. A user
   preference. `<html>` carries `data-theme="blue"` (the default). The user
   picks it in the **Theme Color** popover, opened by the palette button in
   the sidebar footer: 170px wide, r16, `border-line`, `shadow-popover`,
   padding 16, title "Theme Color" (12 / 600), three 26px swatches with 10px
   labels; the selected one has a 2px accent ring and a white check, its
   label in `text-ink`, the others in `text-ink-3`. The pick is stored per
   browser (`papcorns-accent`) and put on `<html>` before paint by
   `ACCENT_THEME_SCRIPT` (`src/lib/accent-theme.ts`); `useAccentTheme()`
   changes it. The moon button next to it switches the mode (sidebar.md).
2. **Mode**: the `dark` class (the design doc writes it as
   `data-mode="dark"`). Managed by `next-themes` (`ThemeProvider`, stored in
   localStorage as `papcorns-theme`); Tailwind's `dark:` variant reads the
   same class.

Every `[data-theme]` block declares all accent tokens itself, and the dark
accent tints are set per theme (`.dark[data-theme=…]`, `.dark [data-theme=…]`),
because a variable derived from another resolves where it is declared. A
preview or a widget can therefore force a look with
`<div data-theme="lilac" className="dark">`.

Dark Lilac and Green tints use an interim rule (accent mixed into the
surface at 15% / 25%), and their light `--accent-text` falls back to
`--text-primary`: the accent itself is unreadable as text on white.

## Raw palette and shadcn names

New code uses the tokens above. Two things in `globals.css` keep other
markup from breaking:

1. **Raw Tailwind palette in dark mode.** `bg-white`, `text-gray-900`,
   `bg-indigo-600` and the like are re-pointed under `.dark` onto the dark
   tokens (each gray step takes the dark token of its light role, indigo
   follows the accent theme), so a pasted snippet or a third-party component
   does not turn white in dark mode. It is a safety net, not a way to style.
2. **shadcn names.** `--border` is the design's border, `bg-muted` is
   `--bg-muted`, `bg-accent` is the brand accent. The remaining shadcn tokens
   (`--primary`, `--secondary`, `--card`, `--popover`, `--muted-foreground`,
   …) keep their light values and point at the design tokens in dark; the
   primitives in `src/components/ui/` use them.

## Icons

`src/components/design-system/icons/nav-icons.tsx` (exported from
`@/components/design-system`): the icons of the design system's `Icons`
set, `currentColor`, 24px box, `size` prop. Named after what they show:
`GridIcon`, `BoxIcon`, `BarChartIcon`, `ShoppingBagIcon`, `UserIcon`,
`SwordIcon`, `LayersIcon`, `TagIcon`, `FlaskIcon`, `CodeIcon`,
`DatabaseIcon`, `GlobeIcon`, `BrushIcon`, `SmartphoneIcon`, `ChecklistIcon`,
`ChartIcon`, `ImageIcon`. In the sidebar they take `className="size-6"`.

### UI icons

`src/components/design-system/icons/ui-icons.tsx`, `currentColor`, drawn at
their design size unless `size` or a `size-*` class is given.

| Component | Size | Use |
|---|---|---|
| `CalendarIcon`, `AppsIcon`, `SearchIcon`, `PlatformsIcon`, `DiscountIcon` | 19–20 | filter pills |
| `CountriesIcon` | 16 | Countries pill (pass `size-4` inside a pill) |
| `ChevronDownIcon` | 11 | pill chevron |
| `AllPlatformsIcon`, `CombinedViewIcon`, `PerAppViewIcon`, `LineViewIcon`, `BarViewIcon`, `PieViewIcon` | 11 | SegmentedControl options |
| `WebFunnelIcon` | 16 | SegmentedControl option (pass `size-4`) |
| `OrganicIcon`, `NonOrganicIcon` | 17 | checklist dropdown rows |
| `PlusIcon`, `CloseIcon` | 12 | Add Metric button, metric chip |
| `TrendIcon` | 32 | Trend Chart title |
| `ArrowUpRightIcon`, `ArrowDownRightIcon` | 10 | KPI delta badge |
| `SidebarIcon`, `SelectorIcon`, `PaletteIcon`, `MoonIcon`, `ChevronRightIcon` | 11–16 | sidebar header, footer, nav chevron |

Checks (checkbox, picked row) and the danger trash icon use `lucide-react`.
For anything else, `lucide-react` is the fallback set.

### Platform marks and logos

`src/components/design-system/icons/platform-icons.tsx`: `AppleIcon`,
`AndroidIcon` (16px) and `MetaLogo`, `TikTokLogo`, `GoogleAdsLogo`
(16–19px). The logos keep their brand colors, the one place a component
carries hex values. Their black parts are `currentColor`: render Apple and
TikTok inside `text-ink` so they turn light in dark mode. Inside a
SegmentedControl a platform mark takes `className="size-4"`.

The Papcorns mark, the wordmark and the workspace eye are components in
`icons/brand-icons.tsx` (`PapcornsMark`, `PapcornsWordmark`,
`WorkspaceEyeIcon`), `currentColor`.
