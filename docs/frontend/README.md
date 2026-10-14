# Frontend: design system and UI rules

Every UI change follows this folder. Read this file first, then the part
you need.

| File | What it holds |
|---|---|
| [design-system.md](design-system.md) | **Source of truth from the design team** (tokens, type scale, spacing, component specs, global content rules). Do not edit values in it by hand. |
| [foundations.md](foundations.md) | How the design system is wired into the code: CSS variables, Tailwind utility names, fonts, theme and mode, icons. |
| [components/](components/) | One file per implemented component: anatomy, variants, states, code path, API. |

## Rules

1. **Our components first.** When building or changing a page, use the
   components listed below. Only if none fits, write a new one, and only when
   the prompt does not say otherwise (a prompt may ask for a one-off). A new
   component stays in the project's feature folder (`CLAUDE.md`, Keep it
   portable).
2. **Tokens, never raw values.** Colors, radius, shadow and type come from the
   utilities in [foundations.md](foundations.md) (`bg-surface`, `text-ink-2`,
   `border-line`, `bg-accent`, `rounded-sm`, `shadow-popover`, `text-body` …).
   No hex values, no `gray-*` / `indigo-*` palette classes, no `dark:`
   overrides: the tokens already switch with theme and mode.
   Words are Bomstad, numbers that are data are the system font. The default
   stack (`font-sans`) already draws every digit in the system font; data
   values add `font-num tabular-nums`, and components put `font-bomstad` on
   labels, dates and counters whose digits the design keeps in Bomstad
   (foundations.md, Typography).
3. **A new design maps onto what exists.** Read the mockup's values and
   translate them to the nearest token and component instead of hard-coding
   a value that has no token.
4. **Content rules** (design-system.md §1, §9): UI text in English (AI
   content stays in the user's language); dates as `17 Sep 2026`, ranges as
   `17 Sep – 24 Sep 2026`, times 24h, ISO dates only in CSV / technical fields,
   whatever the mockup shows; EN number format, compact on cards (`$24.4K`),
   full with separators in tables; delta color follows the metric's polarity
   (good / bad), the arrow follows direction (`src/lib/format.ts`, the metric
   dictionary `src/lib/metrics.ts`); three status levels (danger,
   warning, info), red only for real problems; abbreviations get a `?`
   tooltip; technical codes sit under a readable name; one primary action per
   page; every popover closes on `Esc` and outside click, one open at a time.
5. **Keep the docs current.** A change to a component updates its file here.

## Components

Code lives in `src/components/design-system/` and is imported from
`@/components/design-system`. `src/components/ui/` holds the shadcn
primitives the design system has no component for (Dialog, Sheet, Popover,
Tooltip); everything else comes from the design system.

| Component | Spec | Doc |
|---|---|---|
| Foundations (tokens, fonts, theme, icons) | design-system.md §2–§7 | [foundations.md](foundations.md) |
| Button, IconButton | §8.8 | [button.md](components/button.md) |
| FilterPill, FilterToggle | §8.2 | [filter-pill.md](components/filter-pill.md) |
| Switch | §8.9 | [switch.md](components/switch.md) |
| SegmentedControl | §8.5 | [segmented-control.md](components/segmented-control.md) |
| Checkbox, RadioGroup, Input, SearchInput, Select, Label | §8.3, §8.4 | [form-controls.md](components/form-controls.md) |
| DropdownPanel (apps, channels, metrics, platforms) | §8.3 | [dropdown-panel.md](components/dropdown-panel.md) |
| DateRangePicker | §8.4 | [date-range-picker.md](components/date-range-picker.md) |
| ComparePicker ("Compare to") | — | [compare-picker.md](components/compare-picker.md) |
| KpiCard (+ format helpers, metric dictionary) | §8.6, §9 | [kpi-card.md](components/kpi-card.md) |
| Trend ChartCard | §8.7 | [trend-chart-card.md](components/trend-chart-card.md) |
| PageHeader | §8.10 | [page-header.md](components/page-header.md) |
| Sidebar + workspace switcher + Theme Color popover (app shell) | §8.1 | [sidebar.md](components/sidebar.md) |

## Local preview

`npm run dev`, then `http://localhost:3000/design-system`. It renders every
token and component in the three themes and both modes. The route only
exists in development (it returns 404 in production).

## Interim values

A few states are not designed yet; the code uses these until they are:

1. Hover is `bg-muted`, the focus ring 2px `accent-border`, disabled 40%
   opacity.
2. Lilac and Green have no `--accent-text`. The accent itself is unreadable
   as text on white, so links and selected text use `--text-primary` in those
   themes.
3. Dark Lilac and Green tints are the accent mixed into the surface at
   15% / 25%.
4. A neutral delta (Spend and other neutral metrics) is `bg-muted` with
   `text-ink-2` and a `text-ink-3` sparkline.
