"use client";

import * as React from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type ScriptableContext,
  type TooltipModel,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { cn } from "@/lib/utils";
import { formatCompact, formatCurrencyCompact, formatPercent } from "@/lib/format";
import { Button } from "./button";
import { DropdownPanel, type DropdownOption } from "./dropdown-panel";
import { SegmentedControl } from "./segmented-control";
import {
  BarViewIcon,
  CloseIcon,
  CombinedViewIcon,
  LineViewIcon,
  PerAppViewIcon,
  PieViewIcon,
  PlusIcon,
  TrendIcon,
} from "./icons/ui-icons";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip);

// Trend ChartCard (docs/frontend/components/trend-chart-card.md, design doc
// §8.7). Metric chips with
// Add Metric and Delete All, the title with its data source, the period /
// view / chart type controls, a legend and the chart. Line and Bar draw
// counts on the left axis and money on the right; a third
// unit gets an axis of its own without ticks and shows in the tooltip. Pie
// is one metric split across apps, its total in the middle. The component
// draws what it is given; the page decides the series (metrics, or apps in
// the Per App view).

export type ChartUnit = "count" | "currency" | "percent";

export type TrendSeries = {
  id: string;
  label: string;
  /** A CSS variable (`--viz-installs`) or a colour. */
  color: string;
  unit: ChartUnit;
  /** One value per bucket; null leaves a gap. */
  values: (number | null)[];
};

export type PieSlice = { id: string; label: string; color: string; value: number };

export type TrendPeriod = "month" | "week" | "day";
export type TrendView = "combined" | "per-app";
export type TrendChartType = "line" | "bar" | "pie";

export type TrendChartCardProps = {
  title?: string;
  /** The data source badge next to the title. */
  source?: string;
  /** X axis labels ("Jun", "17 Sep"); `bucketTitles` head the tooltip when given. */
  buckets: string[];
  bucketTitles?: string[];
  series: TrendSeries[];
  /** What Pie shows: one metric split across apps. */
  pie?: { unit: ChartUnit; slices: PieSlice[] };
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
  view: TrendView;
  onViewChange: (view: TrendView) => void;
  chart: TrendChartType;
  onChartChange: (chart: TrendChartType) => void;
  /** The Add Metric list (DropdownPanel options, with `leading` colour dots) and the picked ids. */
  metricOptions: DropdownOption[];
  metrics: string[];
  onMetricsChange: (ids: string[]) => void;
  loading?: boolean;
  className?: string;
};

const UNIT_ORDER: ChartUnit[] = ["count", "currency", "percent"];

export function formatChartValue(value: number, unit: ChartUnit): string {
  if (unit === "currency") return formatCurrencyCompact(value);
  if (unit === "percent") return formatPercent(value);
  return formatCompact(value);
}

// Colours and fonts live in CSS variables and change with theme and mode;
// the canvas needs them as strings, read again whenever <html> changes.
function useCssVars(names: readonly string[]): Record<string, string> {
  const key = names.join("|");
  const read = React.useCallback(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(key.split("|").map((n) => [n, style.getPropertyValue(n).trim()]));
  }, [key]);
  const [values, setValues] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    setValues(read());
    const observer = new MutationObserver(() => setValues(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => observer.disconnect();
  }, [read]);
  return values;
}

const BASE_VARS = ["--text-primary", "--text-tertiary", "--border", "--bg-surface", "--font-num", "--font-bomstad"] as const;

function withAlpha(color: string, alpha: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color);
  if (!hex) return color;
  const n = parseInt(hex[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

type TooltipState = {
  left: number;
  top: number;
  title: string;
  rows: { label: string; color: string; value: string }[];
} | null;

// Line markers as in Figma: a 7px white dot with a 2px ring in the series
// colour on a 12px halo of the same colour at 15%.
const pointHalo: Plugin<"line"> = {
  id: "pointHalo",
  beforeDatasetDraw(chart, { index }) {
    const meta = chart.getDatasetMeta(index);
    const color = (chart.data.datasets[index] as { borderColor?: string }).borderColor;
    if (meta.hidden || typeof color !== "string") return;
    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = withAlpha(color, 0.15);
    for (const point of meta.data as unknown as { x: number; y: number; skip?: boolean }[]) {
      if (point.skip) continue;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};

export function TrendChartCard({
  title = "Trend Chart",
  source,
  buckets,
  bucketTitles,
  series,
  pie,
  period,
  onPeriodChange,
  view,
  onViewChange,
  chart,
  onChartChange,
  metricOptions,
  metrics,
  onMetricsChange,
  loading = false,
  className,
}: TrendChartCardProps) {
  const colorVars = [...new Set([...series, ...(pie?.slices ?? [])].map((s) => s.color).filter((c) => c.startsWith("--")))];
  const vars = useCssVars([...BASE_VARS, ...colorVars]);
  const colorOf = React.useCallback(
    (color: string) => (color.startsWith("--") ? vars[color] || "#999999" : color),
    [vars],
  );
  const ready = Boolean(vars["--text-primary"]);

  const picked = metrics.flatMap((id) => metricOptions.find((o) => o.id === id) ?? []);

  return (
    <section className={cn("rounded-xl bg-surface px-4 pt-6 pb-4 font-bomstad", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownPanel
          trigger={
            <Button variant="secondary">
              <PlusIcon />
              Add Metric
            </Button>
          }
          searchPlaceholder="Search metrics…"
          options={metricOptions}
          value={metrics}
          onApply={onMetricsChange}
          showCount
        />
        {picked.map((option) => (
          <span
            key={option.id}
            className="inline-flex h-7.5 items-center gap-1.5 rounded-sm border border-line bg-surface pr-2 pl-2.5 text-body-sm text-ink"
          >
            {option.leading}
            {option.label}
            <button
              type="button"
              aria-label={`Remove ${option.label}`}
              onClick={() => onMetricsChange(metrics.filter((id) => id !== option.id))}
              className="ml-0.5 flex size-3.5 cursor-pointer items-center justify-center rounded-full text-ink-3 outline-none hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-accent-border"
            >
              <CloseIcon />
            </button>
          </span>
        ))}
        {picked.length > 0 ? (
          <Button variant="link" className="ml-3" onClick={() => onMetricsChange([])}>
            Delete All
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendIcon className="text-ink" />
          <h2 className="text-section-title text-ink">{title}</h2>
          {source ? (
            <span className="ml-1 rounded-xs bg-ink px-2 py-0.5 text-caption font-semibold text-surface">{source}</span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Period"
            value={period}
            onValueChange={onPeriodChange}
            options={[
              { value: "month", label: "Month" },
              { value: "week", label: "Week" },
              { value: "day", label: "Day" },
            ]}
          />
          <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
          <SegmentedControl
            aria-label="View"
            value={view}
            onValueChange={onViewChange}
            options={[
              { value: "combined", label: "Combined", icon: <CombinedViewIcon /> },
              { value: "per-app", label: "Per App", icon: <PerAppViewIcon /> },
            ]}
          />
          <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
          <SegmentedControl
            aria-label="Chart type"
            value={chart}
            onValueChange={onChartChange}
            options={[
              { value: "line", label: "Line", icon: <LineViewIcon /> },
              { value: "bar", label: "Bar", icon: <BarViewIcon /> },
              { value: "pie", label: "Pie", icon: <PieViewIcon /> },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 h-px bg-line" />

      {chart !== "pie" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-2.5">
          {series.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 text-caption text-ink">
              <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: colorOf(s.color) }} />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative mt-6 h-[370px]">
        {loading || !ready ? (
          <div className="h-full animate-pulse rounded-lg bg-muted" />
        ) : chart === "pie" ? (
          <PieView pie={pie} colorOf={colorOf} vars={vars} />
        ) : series.length === 0 ? (
          <div className="flex h-full items-center justify-center text-body text-ink-3">Add a metric to see its trend.</div>
        ) : (
          <SeriesChart
            type={chart}
            buckets={buckets}
            bucketTitles={bucketTitles}
            series={series}
            colorOf={colorOf}
            vars={vars}
          />
        )}
      </div>
    </section>
  );
}

function SeriesChart({
  type,
  buckets,
  bucketTitles,
  series,
  colorOf,
  vars,
}: {
  type: "line" | "bar";
  buckets: string[];
  bucketTitles?: string[];
  series: TrendSeries[];
  colorOf: (color: string) => string;
  vars: Record<string, string>;
}) {
  const [tooltip, setTooltip] = React.useState<TooltipState>(null);

  // Pages often rebuild the series arrays on every render; the chart only
  // gets new data and options when their content changes.
  const seriesKey = JSON.stringify(series);
  const bucketsKey = JSON.stringify([buckets, bucketTitles]);
  const stableSeries = React.useMemo(() => JSON.parse(seriesKey) as TrendSeries[], [seriesKey]);
  const [stableBuckets, stableTitles] = React.useMemo(
    () => JSON.parse(bucketsKey) as [string[], string[] | undefined],
    [bucketsKey],
  );

  const external = React.useCallback(
    ({ chart, tooltip: model }: { chart: ChartJS; tooltip: TooltipModel<"line" | "bar"> }) => {
      if (model.opacity === 0 || !model.dataPoints?.length) {
        setTooltip((prev) => (prev === null ? prev : null));
        return;
      }
      const index = model.dataPoints[0].dataIndex;
      const next = {
        left: model.caretX,
        top: chart.chartArea.top,
        title: stableTitles?.[index] ?? stableBuckets[index] ?? "",
        rows: model.dataPoints.map((p) => {
          const s = stableSeries[p.datasetIndex];
          return { label: s.label, color: colorOf(s.color), value: formatChartValue(Number(p.raw), s.unit) };
        }),
      };
      // The chart calls this on every update; only a real change re-renders.
      setTooltip((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    },
    [stableBuckets, stableTitles, stableSeries, colorOf],
  );

  // Counts left, money right, any other unit on an axis of its own (no ticks).
  const units = React.useMemo(() => UNIT_ORDER.filter((u) => stableSeries.some((s) => s.unit === u)), [stableSeries]);
  const axisOf = React.useCallback((unit: ChartUnit) => ["y", "y1", "y2"][units.indexOf(unit)], [units]);

  const options = React.useMemo<ChartOptions<"line" | "bar">>(() => {
    const scales: ChartOptions<"line">["scales"] = {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: vars["--text-primary"], font: { family: vars["--font-bomstad"], size: 12, weight: 500 }, padding: 12 },
      },
    };
    units.forEach((unit, i) => {
      scales[axisOf(unit)] = {
        position: i === 1 ? "right" : "left",
        display: i < 2,
        beginAtZero: true,
        border: { display: false },
        grid: { display: i === 0, color: vars["--border"] },
        ticks: {
          color: vars["--text-primary"],
          font: { family: vars["--font-num"], size: 12, weight: 500 },
          maxTicksLimit: 6,
          padding: 8,
          callback: (value) => formatChartValue(Number(value), unit),
        },
      };
    });
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false }, tooltip: { enabled: false, external } },
      scales,
    };
  }, [units, axisOf, vars, external]);

  const lineData = React.useMemo<ChartData<"line">>(
    () => ({
      labels: stableBuckets,
      datasets: stableSeries.map((s) => {
        const color = colorOf(s.color);
        return {
          label: s.label,
          data: s.values,
          yAxisID: axisOf(s.unit),
          borderColor: color,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          backgroundColor: (ctx: ScriptableContext<"line">) => {
            const area = ctx.chart.chartArea;
            if (!area) return withAlpha(color, 0.15);
            const gradient = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            gradient.addColorStop(0, withAlpha(color, 0.15));
            gradient.addColorStop(1, withAlpha(color, 0));
            return gradient;
          },
          pointRadius: 3.5,
          pointHoverRadius: 4.5,
          pointBorderWidth: 2,
          pointBackgroundColor: vars["--bg-surface"],
          pointBorderColor: color,
        };
      }),
    }),
    [stableBuckets, stableSeries, colorOf, axisOf, vars],
  );

  const barData = React.useMemo<ChartData<"bar">>(
    () => ({
      labels: stableBuckets,
      datasets: stableSeries.map((s) => ({
        label: s.label,
        data: s.values,
        yAxisID: axisOf(s.unit),
        backgroundColor: colorOf(s.color),
        maxBarThickness: 84,
        categoryPercentage: 0.6,
        barPercentage: 0.9,
      })),
    }),
    [stableBuckets, stableSeries, colorOf, axisOf],
  );

  return (
    <>
      {type === "line" ? (
        <Line data={lineData} options={options as ChartOptions<"line">} plugins={[pointHalo]} />
      ) : (
        <Bar data={barData} options={options as ChartOptions<"bar">} />
      )}
      <ChartTooltip state={tooltip} />
    </>
  );
}

// The hover card: r12, `shadow-popover`, the bucket on top,
// one row per series with its colour dot and the value on the right.
function ChartTooltip({ state }: { state: TooltipState }) {
  if (!state) return null;
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 min-w-44 -translate-x-1/2 rounded-lg bg-surface p-4 shadow-popover"
      style={{ left: state.left, top: state.top }}
    >
      <div className="text-body-sm text-ink">{state.title}</div>
      <div className="mt-2.5 flex flex-col gap-3">
        {state.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-body-sm text-ink">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: row.color }} />
              {row.label}
            </span>
            <span className="font-num font-semibold tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pie: a donut of one metric across apps with the total in
// the middle, and the apps with value and share on the right.
function PieView({
  pie,
  colorOf,
  vars,
}: {
  pie?: { unit: ChartUnit; slices: PieSlice[] };
  colorOf: (color: string) => string;
  vars: Record<string, string>;
}) {
  const slices = (pie?.slices ?? []).filter((s) => s.value > 0);
  if (!pie || slices.length === 0) {
    return <div className="flex h-full items-center justify-center text-body text-ink-3">No data to split.</div>;
  }
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const data: ChartData<"doughnut"> = {
    labels: slices.map((s) => s.label),
    datasets: [
      {
        data: slices.map((s) => s.value),
        backgroundColor: slices.map((s) => colorOf(s.color)),
        borderColor: vars["--bg-surface"],
        borderWidth: 2,
      },
    ],
  };
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    cutout: "62%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };
  return (
    <div className="flex h-full items-center justify-center gap-24">
      <div className="relative size-[300px]">
        <Doughnut data={data} options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-num text-[40px] leading-12 font-semibold text-ink tabular-nums">
            {formatChartValue(total, pie.unit)}
          </span>
          <span className="text-base text-ink-3">Total</span>
        </div>
      </div>
      <ul className="flex min-w-56 flex-col gap-3">
        {slices.map((s) => (
          <li key={s.id} className="grid grid-cols-[1fr_auto_3rem] items-center gap-3 text-body-sm text-ink">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorOf(s.color) }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="text-right font-num font-medium tabular-nums">{formatChartValue(s.value, pie.unit)}</span>
            <span className="text-right font-num text-caption text-ink-3 tabular-nums">{formatPercent(s.value / total, 0)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
