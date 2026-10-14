// Metric dictionary (design doc §9): one place for a metric's name, format,
// polarity and tooltip text, so every card, table and chart shows it the
// same way. Polarity decides the delta colour (good / bad), the arrow only
// shows the direction. Spend-like metrics are neutral.

import {
  formatCompact,
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatPercent,
} from "./format";

/** How a value is written. `percent` values are ratios (0.465 → "46.5%"). */
export type MetricFormat = "currency" | "currency-compact" | "number" | "compact" | "percent" | "days";

/** Which way is good. */
export type MetricPolarity = "higher-better" | "lower-better" | "neutral";

/**
 * What the delta badge shows: `abs+pct` the difference and the relative
 * change ("-$5.6K (-18.7%)"), `pct` the relative change only ("-6.0%"),
 * `pp` the difference of two ratios in percentage points ("-8.0 pp"),
 * `abs` the difference only ("+30d").
 */
export type DeltaStyle = "abs+pct" | "pct" | "pp" | "abs";

export type MetricDef = {
  label: string;
  short?: string;
  format: MetricFormat;
  delta: DeltaStyle;
  polarity: MetricPolarity;
  /** One sentence for the `?` tooltip. */
  desc: string;
  formula?: string;
};

export const METRICS = {
  total_spend: {
    label: "Total Spend",
    short: "Spend",
    format: "currency-compact",
    delta: "abs+pct",
    polarity: "neutral",
    desc: "Ad spend in the period.",
    formula: "Sum of campaign cost",
  },
  total_revenue: {
    label: "Total Revenue",
    short: "Revenue",
    format: "currency-compact",
    delta: "abs+pct",
    polarity: "higher-better",
    desc: "Revenue in the period.",
    formula: "Sum of revenue",
  },
  d0_roas: {
    label: "Day 0 ROAS",
    short: "ROAS",
    format: "percent",
    delta: "pp",
    polarity: "higher-better",
    desc: "Revenue returned on ad spend.",
    formula: "Total Revenue ÷ Total Spend",
  },
  subscriptions: {
    label: "Subscriptions",
    format: "number",
    delta: "abs+pct",
    polarity: "higher-better",
    desc: "New subscriptions in the period.",
    formula: "Count of new subscribers",
  },
  breakeven_days: {
    label: "Breakeven (Days)",
    short: "Breakeven",
    format: "days",
    delta: "abs",
    polarity: "lower-better",
    desc: "Days until revenue covers ad spend.",
    formula: "First day cumulative revenue reaches Total Spend",
  },
  total_installs: {
    label: "Total Installs",
    short: "Installs",
    format: "number",
    delta: "abs+pct",
    polarity: "higher-better",
    desc: "Installs in the period.",
    formula: "Sum of installs",
  },
  d0_cancellation_rate: {
    label: "D0 Cancellation Rate",
    short: "D0 Cancels",
    format: "percent",
    delta: "pp",
    polarity: "lower-better",
    desc: "Share of subscribers who cancelled on the first day.",
    formula: "Day 0 cancellations ÷ subscribers",
  },
  avg_cpi: {
    label: "Avg CPI",
    short: "CPI",
    format: "currency",
    delta: "pct",
    polarity: "lower-better",
    desc: "Average cost of one install.",
    formula: "Total Spend ÷ Total Installs",
  },
} satisfies Record<string, MetricDef>;

export type MetricKey = keyof typeof METRICS;

export function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "currency-compact":
      return formatCurrencyCompact(value);
    case "number":
      return formatNumber(value);
    case "compact":
      return formatCompact(value);
    case "percent":
      return formatPercent(value);
    case "days":
      return `${Math.round(value)}d`;
  }
}

export type DeltaTone = "success" | "danger" | "neutral";

/** Good or bad by polarity; neutral metrics and no change stay neutral. */
export function deltaTone(polarity: MetricPolarity, diff: number): DeltaTone {
  if (diff === 0 || polarity === "neutral") return "neutral";
  return (diff > 0) === (polarity === "higher-better") ? "success" : "danger";
}

export type FormattedDelta = {
  tone: DeltaTone;
  direction: "up" | "down" | "flat";
  /** The coloured part: "-$5.6K", "-8.0 pp", "+30d", "-6.0%". */
  main: string;
  /** The relative change in brackets, for `abs+pct`: "(-18.7%)". */
  pct: string | null;
};

const signed = (text: string, diff: number) => (diff > 0 ? `+${text}` : text);

/** The badge text for a change from `previous` to `current`; null when there is nothing to compare. */
export function formatMetricDelta(
  current: number,
  previous: number,
  def: Pick<MetricDef, "format" | "delta" | "polarity">,
): FormattedDelta | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  const diff = current - previous;
  const relative = previous !== 0 ? diff / Math.abs(previous) : null;
  const base = {
    tone: deltaTone(def.polarity, diff),
    direction: diff > 0 ? ("up" as const) : diff < 0 ? ("down" as const) : ("flat" as const),
  };
  const pctText = (ratio: number) => signed(formatPercent(ratio), ratio);
  switch (def.delta) {
    case "abs+pct":
      return {
        ...base,
        main: signed(formatMetricValue(diff, def.format), diff),
        pct: relative === null ? null : `(${pctText(relative)})`,
      };
    case "pct":
      return relative === null ? null : { ...base, main: pctText(relative), pct: null };
    case "pp":
      return { ...base, main: signed(`${(diff * 100).toFixed(1)} pp`, diff), pct: null };
    case "abs":
      return { ...base, main: signed(formatMetricValue(diff, def.format), diff), pct: null };
  }
}
