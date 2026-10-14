"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatDateRange } from "@/lib/format";
import {
  METRICS,
  formatMetricDelta,
  formatMetricValue,
  type DeltaStyle,
  type DeltaTone,
  type MetricFormat,
  type MetricKey,
  type MetricPolarity,
} from "@/lib/metrics";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "./icons/ui-icons";

// KpiCard (docs/frontend/components/kpi-card.md, design doc §8.6).
// Two sizes: `lg` 342×125 in rows of four, `sm` 223×124 in rows
// of six. Label and value top left, sparkline top right, delta badge bottom
// left, date range bottom right. The delta colour comes from the metric's
// polarity (src/lib/metrics.ts), the arrow from the direction. Data values
// are the system font, the label and the dates Bomstad.

export type KpiCardProps = {
  /** A METRICS key: label, format, delta style and polarity come from it. */
  metric?: MetricKey;
  label?: string;
  format?: MetricFormat;
  deltaStyle?: DeltaStyle;
  polarity?: MetricPolarity;
  /** null shows `emptyText`. */
  value: number | null;
  /** The comparison period's value; the badge is left out without it. */
  previous?: number | null;
  /** The comparison period's days, named in the badge's tooltip ("vs 3 Aug – 9 Aug 2026"). */
  previousRange?: { from: string; to: string };
  /** Daily values of the period, oldest first. */
  sparkline?: (number | null)[];
  /** The period, "YYYY-MM-DD", written as "10 Aug – 16 Aug 2026". */
  range?: { from: string; to: string };
  size?: "lg" | "sm";
  loading?: boolean;
  /** What a missing value reads, e.g. "Not reached" for breakeven. */
  emptyText?: string;
  className?: string;
};

const TONE: Record<DeltaTone, { badge: string; text: string }> = {
  success: { badge: "bg-success-bg", text: "text-success" },
  danger: { badge: "bg-danger-bg", text: "text-danger" },
  neutral: { badge: "bg-muted", text: "text-ink-2" },
};

export function KpiCard({
  metric,
  label,
  format,
  deltaStyle,
  polarity,
  value,
  previous,
  previousRange,
  sparkline,
  range,
  size = "lg",
  loading = false,
  emptyText = "—",
  className,
}: KpiCardProps) {
  const def = metric ? METRICS[metric] : undefined;
  const name = label ?? def?.label ?? "";
  const spec = {
    format: format ?? def?.format ?? "number",
    delta: deltaStyle ?? def?.delta ?? "abs+pct",
    polarity: polarity ?? def?.polarity ?? "neutral",
  };
  const delta =
    value !== null && previous !== null && previous !== undefined
      ? formatMetricDelta(value, previous, spec)
      : null;
  const tone = TONE[delta?.tone ?? "neutral"];
  // The line takes the delta's colour; a neutral or missing delta draws it grey.
  const lineColor = delta && delta.tone !== "neutral" ? tone.text : "text-ink-3";
  const lg = size === "lg";

  return (
    <div
      role="group"
      aria-label={name}
      aria-busy={loading || undefined}
      className={cn(
        "flex flex-col justify-between rounded-xl bg-surface p-4 pb-3.5 font-bomstad",
        lg ? "h-[125px]" : "h-[124px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex shrink-0 flex-col gap-1">
          <span className="text-kpi-label whitespace-nowrap uppercase text-ink-2">{name}</span>
          {loading ? (
            <span className="my-1.5 h-7 w-24 animate-pulse rounded-xs bg-muted" />
          ) : (
            <span className="font-num text-kpi-value whitespace-nowrap tabular-nums text-ink">
              {value === null ? emptyText : formatMetricValue(value, spec.format)}
            </span>
          )}
        </div>
        {!loading && sparkline ? (
          <Sparkline
            values={sparkline}
            className={cn(lineColor, lg ? "h-14 max-w-[119px]" : "h-[45px] max-w-[79px]")}
            stroke={lg ? 2 : 1.5}
            dot={lg ? 2.5 : 2}
          />
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        {loading ? (
          <span className="h-7 w-20 animate-pulse rounded-sm bg-muted" />
        ) : delta ? (
          <span
            title={previousRange ? `vs ${formatDateRange(previousRange.from, previousRange.to)}` : undefined}
            className={cn("inline-flex shrink-0 items-center gap-1 rounded-sm p-2", tone.badge)}
          >
            {delta.direction === "up" ? (
              <ArrowUpRightIcon className={cn("shrink-0", tone.text)} />
            ) : delta.direction === "down" ? (
              <ArrowDownRightIcon className={cn("shrink-0", tone.text)} />
            ) : null}
            <span
              className={cn(
                "font-num tabular-nums",
                lg ? "text-delta" : "text-micro font-semibold",
                tone.text,
              )}
            >
              {delta.main}
            </span>
            {delta.pct ? (
              <span className={cn("font-num tabular-nums text-ink-3", lg ? "text-delta font-medium" : "text-micro")}>
                {delta.pct}
              </span>
            ) : null}
          </span>
        ) : (
          <span />
        )}
        {range ? <RangeText from={range.from} to={range.to} className={lg ? "text-caption" : "text-micro"} /> : null}
      </div>
    </div>
  );
}

// "10 Aug – 16 Aug 2026"; when it has to wrap (compact cards) it breaks only
// after the dash, as in Figma.
function RangeText({ from, to, className }: { from: string; to: string; className?: string }) {
  const [start, end] = formatDateRange(from, to).split(" – ");
  return (
    <span className={cn("text-right text-ink-3", className)}>
      {end ? (
        <>
          <span className="whitespace-nowrap">{start} –</span> <span className="whitespace-nowrap">{end}</span>
        </>
      ) : (
        <span className="whitespace-nowrap">{start}</span>
      )}
    </span>
  );
}

// A line of the period's values with a fading area under it and a dot on the
// last point (design doc §3.4), in currentColor. It takes the room the value
// leaves (Figma: 119px wide on large cards, 48 – 79px on compact ones), so
// the box is measured and the line drawn at that width.
function Sparkline({
  values,
  stroke,
  dot,
  className,
}: {
  values: (number | null)[];
  stroke: number;
  dot: number;
  className?: string;
}) {
  const id = React.useId();
  const ref = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({ width: Math.floor(entry.contentRect.width), height: Math.floor(entry.contentRect.height) }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const points = values.flatMap((v, i) => (v === null || !Number.isFinite(v) ? [] : [{ i, v }]));
  const { width, height } = box;
  let svg: React.ReactNode = null;
  if (points.length >= 2 && width > 0 && height > 0) {
    const min = Math.min(...points.map((p) => p.v));
    const max = Math.max(...points.map((p) => p.v));
    const pad = dot + stroke / 2;
    const bottom = height * 0.85;
    const x = (i: number) => pad + (i / (values.length - 1)) * (width - 2 * pad);
    const y = (v: number) => (max === min ? (pad + bottom) / 2 : bottom - ((v - min) / (max - min)) * (bottom - pad));
    const line = points.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
    const first = points[0];
    const last = points[points.length - 1];
    const area = `${line} L${x(last.i).toFixed(1)},${height} L${x(first.i).toFixed(1)},${height} Z`;
    svg = (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.27" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(last.i)} cy={y(last.v)} r={dot} fill="currentColor" />
      </svg>
    );
  }
  return (
    <div ref={ref} aria-hidden className={cn("min-w-12 flex-1", className)}>
      {svg}
    </div>
  );
}
