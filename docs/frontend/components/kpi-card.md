# KpiCard

Spec: design-system.md §8.6, §9. Code: `src/components/design-system/kpi-card.tsx`,
imported from `@/components/design-system`. Metric dictionary and formats:
`src/lib/metrics.ts`, `src/lib/format.ts`.

```tsx
<div className="grid grid-cols-4 gap-4">
  <KpiCard
    metric="total_spend"
    value={24400}
    previous={30000}
    sparkline={dailySpend}
    range={{ from: "2026-08-10", to: "2026-08-16" }}
  />
  …
</div>
<div className="grid grid-cols-6 gap-4">
  <KpiCard metric="breakeven_days" value={breakeven} previous={prevBreakeven} emptyText="Not reached" size="sm" … />
  …
</div>
```

## Anatomy

| | `lg` | `sm` |
|---|---|---|
| Size | 342×125 (rows of four) | 223×124 (rows of six) |
| Sparkline | 119×56, 2px line, 5px dot | 48–79×45 (the room the value leaves), 1.5px, 4px dot |
| Delta text | `text-delta` (11) | `text-micro` semibold (10) |
| Date | `text-caption` (11) | `text-micro` (10) |

`bg-surface`, r16, padding 16 (14 at the bottom), no border or shadow.

1. **Label** top left: `text-kpi-label` uppercase `text-ink-2`, Bomstad
   (digits too: `D0 ROAS`).
2. **Value** 4px below: `text-kpi-value font-num tabular-nums text-ink`,
   formatted by the metric's format; a missing value shows `emptyText`
   (`—`, or `Not reached` for breakeven).
3. **Sparkline** top right: the period's daily values, a line in the delta
   colour with a dot on the last point and a fading area under it (27% to
   0). A neutral or missing delta draws it in `text-ink-3`.
4. **Delta badge** bottom left: r8, padding 8, gap 4, arrow (10px, the
   direction) + the change in the tone colour + the relative change in
   `text-ink-3`. Tone colours: `bg-success-bg text-success`,
   `bg-danger-bg text-danger`, neutral `bg-muted text-ink-2`. Left out
   without `previous` (a page whose ComparePicker is Off). `previousRange`
   names the comparison days in the badge's tooltip ("vs 22 Sep – 28 Sep 2026").
5. **Date** bottom right: `formatDateRange` in `text-ink-3`, Bomstad; on a
   compact card it wraps after the dash only.

`loading` shows skeletons for the value and the badge.

## The metric decides the look

`metric` takes the label, format, delta style and polarity from `METRICS`
(`src/lib/metrics.ts`); `label`, `format`, `deltaStyle` and `polarity`
override them for a metric that is not in the dictionary yet. The colour
follows polarity (good / bad), the arrow the direction:

| Metric | Format | Delta | Polarity |
|---|---|---|---|
| Total Spend | `$24.4K` | `-$5.6K (-18.7%)` | neutral |
| Total Revenue | `$31.2K` | `+$4.2K (+15.6%)` | higher better |
| Subscriptions, Total Installs | `1,800` | `-600 (-25.0%)` | higher better |
| Day 0 ROAS | `42.0%` | `-8.0 pp` | higher better |
| D0 Cancellation Rate | `32.0%` | `+2.0 pp` | lower better |
| Breakeven (Days) | `120d` | `+30d` | lower better |
| Avg CPI | `$0.47` | `-6.0%` | lower better |

`percent` values are ratios (`0.42`); their delta is the difference in
percentage points (`pp`), not a relative change. Compact numbers use an
upper-case `K` / `M` / `B`. The dictionary also holds `desc` and `formula`
for the `?` tooltip of abbreviations.
