# Trend ChartCard

Spec: design-system.md §8.7, data-viz palette §3.4. Code:
`src/components/design-system/trend-chart-card.tsx`, imported from
`@/components/design-system`.

```tsx
<TrendChartCard
  source="Sample"
  buckets={["Jun", "Jul", "Aug", "Sep"]}
  bucketTitles={["Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026"]}
  series={[
    { id: "installs", label: "Installs", color: "--viz-installs", unit: "count", values: [42000, 48000, 45000, 51000] },
    { id: "revenue", label: "Revenue", color: "--viz-revenue", unit: "currency", values: [30000, 36000, 33000, 40000] },
  ]}
  pie={{ unit: "currency", slices: revenueByApp }}
  period={period} onPeriodChange={setPeriod}
  view={view} onViewChange={setView}
  chart={chart} onChartChange={setChart}
  metricOptions={METRIC_OPTIONS} metrics={metrics} onMetricsChange={setMetrics}
/>
```

The card draws what it is given; the page owns the data and the URL state
(period, view, chart, metrics). In the Per App view the page passes one
series per app instead of one per metric.

## Anatomy

`bg-surface`, r16, padding 24 on top and 16 on the sides.

1. **Metric chips**: `+ Add Metric` (Button `secondary`, opens a DropdownPanel
   with `showCount`), one chip per picked metric (30px, r8, `border-line`,
   its colour dot, the name in `text-body-sm`, a 14px × that removes it),
   `Delete All` (link) when any is picked.
2. **Header** 24px below: `TrendIcon` 32 + the title in `text-section-title`
   + the source badge (`bg-ink text-surface`, r6, `text-caption` semibold;
   it inverts in dark mode). On the right the three SegmentedControls
   (Month · Week · Day, Combined · Per App, Line · Bar · Pie) with the 1×20
   dividers.
3. A 1px `bg-line` rule, then the **legend** (Line and Bar): 10px dots and
   `text-caption` names, padding 10 / 20, gap 16, a `border-line` under it.
4. **Chart**, 370px high (Chart.js):
   - **Line**: 2px smooth lines, an area fading from the colour at 15% to 0,
     markers of a 7px white dot with a 2px ring on a 12px halo at 15%.
   - **Bar**: grouped bars in the series colours, at most 84px wide.
   - Grid lines 1px `--border`, horizontal only. Y labels in the system
     font (`text-primary`, 12 / 500), x labels Bomstad (dates keep Bomstad
     digits).
   - **Tooltip** on hover over a bucket: `bg-surface`,
     r12, `shadow-popover`, padding 16, the bucket title, then one row per
     series: dot, name, value right aligned in `font-num` semibold.
   - **Pie** (`chart="pie"`): a donut of `pie.slices` with the total in the
     middle (system font 40px semibold, "Total" under it) and the slices
     on the right with value and share. No legend row in this mode.

Values are compact: counts `48K`, money `$36K`, percentages `33.0%`
(`formatChartValue`).

## Units and axes

Line and Bar put counts on the left axis and money on the right, each with
its own scale, so Installs and Revenue are both readable. A third unit
(percentages, e.g. Retention) gets an axis of its own without labels; its
values show in the tooltip. Metrics of the same unit share an axis, so a
small one next to a large one (ARPU next to Revenue) still sits low.

Pie is one metric split across apps: the page passes the
apps' values of the first picked metric as `pie.slices`.
