// Date ranges of the DateRangePicker (docs/frontend/components/date-range-picker.md).
// A range keeps what was picked, not fixed dates, so a link or a saved preset
// re-resolves every time it is opened:
//   between  two fixed days (the calendar, typed dates, "Custom")
//   last     the N days that end on the last selectable day ("Last 7 Days")
//   since    a fixed first day up to the last selectable day
//   this     this week / month / quarter / year, up to the last selectable day
//   yesterday  the day before today, none while it is after the last selectable day
// The last selectable day is `maxDate`: today for live data, the last
// complete day for data that arrives later. Days are "YYYY-MM-DD" on the UTC
// calendar. Weeks start on Monday.

import { formatDate, formatDateRange } from "./format";

export type DateRangeUnit = "week" | "month" | "quarter" | "year";

/** "HH:mm:ss" ends of a range, when the page shows hourly data. */
export type TimeRange = { from: string; to: string };

export type DateRangeValue = (
  | { mode: "between"; from: string; to: string }
  | { mode: "last"; days: number }
  | { mode: "since"; from: string }
  | { mode: "this"; unit: DateRangeUnit }
  | { mode: "yesterday" }
) & { time?: TimeRange };

export type DateRangeMode = DateRangeValue["mode"];

export type DayRange = { from: string; to: string };

export type DateBounds = {
  /** Last selectable day. */
  maxDate: string;
  /** First selectable day, where a page's data starts. */
  minDate?: string;
  /** Today on the UTC calendar. Only "this" and "yesterday" ranges read it. */
  today?: string;
};

export type DateRangePreset = { id: string; label: string; value: DateRangeValue };

/** A range saved with "Save as Preset". */
export type SavedDateRangePreset = {
  id: number;
  name: string;
  value: DateRangeValue;
  visibility: "private" | "everyone";
  /** The viewer may remove it: their own, or any for admins. */
  removable: boolean;
};

export type SavePresetInput = {
  name: string;
  value: DateRangeValue;
  visibility: "private" | "everyone";
  isDefault: boolean;
};

export const DATE_RANGE_UNITS: readonly DateRangeUnit[] = ["week", "month", "quarter", "year"];

const UNIT_LABEL: Record<DateRangeUnit, string> = {
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};

export function unitLabel(unit: DateRangeUnit): string {
  return UNIT_LABEL[unit];
}

/** The built-in rows of the presets list, between "Default" and "Custom". */
export const DATE_RANGE_PRESETS: readonly DateRangePreset[] = [
  { id: "yesterday", label: "Yesterday", value: { mode: "yesterday" } },
  { id: "last-7-days", label: "Last 7 Days", value: { mode: "last", days: 7 } },
  { id: "last-30-days", label: "Last 30 Days", value: { mode: "last", days: 30 } },
  { id: "last-60-days", label: "Last 60 Days", value: { mode: "last", days: 60 } },
  { id: "last-90-days", label: "Last 90 Days", value: { mode: "last", days: 90 } },
  { id: "this-week", label: "This Week", value: { mode: "this", unit: "week" } },
  { id: "this-month", label: "This Month", value: { mode: "this", unit: "month" } },
  { id: "this-quarter", label: "This Quarter", value: { mode: "this", unit: "quarter" } },
  { id: "this-year", label: "This Year", value: { mode: "this", unit: "year" } },
];

// ─── Days ───

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

export function isDay(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const m = DAY.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

function utcDate(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dayOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function utcToday(now: Date = new Date()): string {
  return dayOf(now);
}

export function addDays(day: string, n: number): string {
  const d = utcDate(day);
  d.setUTCDate(d.getUTCDate() + n);
  return dayOf(d);
}

/** Whole days from `from` to `to` (0 for the same day). */
export function daysBetween(from: string, to: string): number {
  return Math.round((utcDate(to).getTime() - utcDate(from).getTime()) / MS_PER_DAY);
}

/** A day as local midnight, for pickers that work on Date (react-day-picker). */
export function dayToLocalDate(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Ends a `{ startDate, endDate }` range on `maxDay`
 * at the latest; null when it starts after `maxDay`, so a caller drops it.
 */
export function capDayRange<T extends { startDate: string; endDate: string }>(range: T, maxDay: string): T | null {
  if (range.startDate > maxDay) return null;
  return range.endDate > maxDay ? { ...range, endDate: maxDay } : range;
}

export function periodStart(day: string, unit: DateRangeUnit): string {
  const d = utcDate(day);
  if (unit === "week") d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  else if (unit === "month") d.setUTCDate(1);
  else if (unit === "quarter") d.setUTCMonth(Math.floor(d.getUTCMonth() / 3) * 3, 1);
  else d.setUTCMonth(0, 1);
  return dayOf(d);
}

// ─── Resolving ───

/**
 * The days a range covers right now, or null when it has no selectable day:
 * "This Month" on the 1st, while the 1st is not complete yet, or a link whose
 * days all lie after `maxDate`.
 */
export function resolveDateRange(value: DateRangeValue, bounds: DateBounds): DayRange | null {
  const { maxDate, minDate } = bounds;
  let from: string;
  let to: string;
  switch (value.mode) {
    case "between":
      [from, to] = value.from <= value.to ? [value.from, value.to] : [value.to, value.from];
      if (to > maxDate) to = maxDate;
      break;
    case "last":
      to = maxDate;
      from = addDays(maxDate, -(Math.max(1, Math.floor(value.days)) - 1));
      break;
    case "since":
      from = value.from;
      to = maxDate;
      break;
    case "this":
      from = periodStart(bounds.today ?? utcToday(), value.unit);
      to = maxDate;
      break;
    case "yesterday":
      from = addDays(bounds.today ?? utcToday(), -1);
      to = from < maxDate ? from : maxDate;
      break;
  }
  if (minDate && from < minDate) from = minDate;
  return from <= to ? { from, to } : null;
}

/** The built-in presets that have at least one selectable day right now. */
export function availablePresets(
  bounds: DateBounds,
  presets: readonly DateRangePreset[] = DATE_RANGE_PRESETS,
): DateRangePreset[] {
  return presets.filter((p) => resolveDateRange(p.value, bounds) !== null);
}

export function sameDateRange(a: DateRangeValue, b: DateRangeValue): boolean {
  if (a.mode !== b.mode) return false;
  if ((a.time?.from ?? "") !== (b.time?.from ?? "") || (a.time?.to ?? "") !== (b.time?.to ?? "")) return false;
  switch (a.mode) {
    case "between":
      return b.mode === "between" && a.from === b.from && a.to === b.to;
    case "last":
      return b.mode === "last" && a.days === b.days;
    case "since":
      return b.mode === "since" && a.from === b.from;
    case "this":
      return b.mode === "this" && a.unit === b.unit;
    case "yesterday":
      return true;
  }
}

/**
 * The words for a range: the preset name, "Since 1 Sep 2026", or the days.
 * Fixed days that match a preset today are named after it (CLAUDE.md, URL
 * filters); the value itself stays fixed.
 */
export function dateRangeLabel(
  value: DateRangeValue,
  bounds: DateBounds,
  presets: readonly DateRangePreset[] = DATE_RANGE_PRESETS,
): string {
  const named = presets.find((p) => sameDateRange(p.value, { ...value, time: undefined }));
  if (named) return named.label;
  switch (value.mode) {
    case "last":
      return `Last ${value.days} ${value.days === 1 ? "Day" : "Days"}`;
    case "this":
      return `This ${UNIT_LABEL[value.unit]}`;
    case "since":
      return `Since ${formatDate(value.from)}`;
    case "yesterday":
      return "Yesterday";
    case "between": {
      const range = resolveDateRange(value, bounds) ?? { from: value.from, to: value.to };
      const preset = presets.find((p) => {
        const r = resolveDateRange(p.value, bounds);
        return r && r.from === range.from && r.to === range.to;
      });
      return preset ? preset.label : formatDateRange(range.from, range.to);
    }
  }
}

// ─── Typed input ───

const MONTH_INDEX: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

function makeDay(y: number, m: number, d: number): string | null {
  const day = `${String(y).padStart(4, "0")}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return isDay(day) ? day : null;
}

/**
 * A day typed into a date field: "22 Sep 2026" (the display format),
 * "Sep 22, 2026", "2026-09-22" or "22.09.2026" / "22/09/2026" (day first).
 */
export function parseDayInput(text: string): string | null {
  const s = text.trim().toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ");
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (m) return makeDay(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{1,2}) ([a-z]+)\.? (\d{4})$/.exec(s);
  if (m && m[2].slice(0, 3) in MONTH_INDEX) return makeDay(+m[3], MONTH_INDEX[m[2].slice(0, 3)], +m[1]);
  m = /^([a-z]+)\.? (\d{1,2}) (\d{4})$/.exec(s);
  if (m && m[1].slice(0, 3) in MONTH_INDEX) return makeDay(+m[3], MONTH_INDEX[m[1].slice(0, 3)], +m[2]);
  m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(s);
  if (m) return makeDay(+m[3], +m[2] - 1, +m[1]);
  return null;
}

/** "9:30" → "09:30:00"; null when it is not a time of day. */
export function parseTimeInput(text: string): string | null {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim());
  if (!m) return null;
  const [h, min, sec] = [+m[1], +m[2], +(m[3] ?? 0)];
  if (h > 23 || min > 59 || sec > 59) return null;
  return [h, min, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

// ─── URL and storage ───

export type DateRangeParams = {
  range: string | null;
  from: string | null;
  to: string | null;
  time: string | null;
};

/**
 * The query keys for a range (CLAUDE.md, Filters live in the URL): a relative
 * range by name (`range=last-7-days`, `range=this-month`, `range=yesterday`), fixed days as
 * `from`/`to`, a "since" range as `from` alone, a time window as
 * `time=09:00:00-18:00:00`. The page default writes nothing.
 */
export function dateRangeToParams(value: DateRangeValue, defaultValue: DateRangeValue): DateRangeParams {
  if (sameDateRange(value, defaultValue)) return { range: null, from: null, to: null, time: null };
  const time = value.time ? `${value.time.from}-${value.time.to}` : null;
  switch (value.mode) {
    case "last":
      return { range: `last-${value.days}-days`, from: null, to: null, time };
    case "this":
      return { range: `this-${value.unit}`, from: null, to: null, time };
    case "yesterday":
      return { range: "yesterday", from: null, to: null, time };
    case "since":
      return { range: null, from: value.from, to: null, time };
    case "between":
      return { range: null, from: value.from, to: value.to, time };
  }
}

/**
 * Reads what `dateRangeToParams` writes, case-insensitively. Anything invalid,
 * or with no selectable day under `bounds`, gives `fallback`.
 */
export function dateRangeFromParams(
  params: URLSearchParams,
  fallback: DateRangeValue,
  bounds?: DateBounds,
): DateRangeValue {
  return parseDateRangeParams(params, bounds) ?? fallback;
}

/** The same, with null when the URL holds no usable range (the page default applies). */
export function parseDateRangeParams(params: URLSearchParams, bounds?: DateBounds): DateRangeValue | null {
  const value = readParams(params);
  return value && (!bounds || resolveDateRange(value, bounds)) ? value : null;
}

function readParams(params: URLSearchParams): DateRangeValue | null {
  const timeMatch = /^(\d{2}:\d{2}:\d{2})-(\d{2}:\d{2}:\d{2})$/.exec(params.get("time")?.trim() ?? "");
  const time =
    timeMatch && parseTimeInput(timeMatch[1]) && parseTimeInput(timeMatch[2])
      ? { from: timeMatch[1], to: timeMatch[2] }
      : undefined;
  const withTime = (value: DateRangeValue): DateRangeValue => (time ? { ...value, time } : value);

  const slug = (params.get("range") ?? "").trim().toLowerCase();
  if (slug === "yesterday") return withTime({ mode: "yesterday" });
  let m = /^last-(\d{1,4})-days?$/.exec(slug);
  if (m && +m[1] >= 1) return withTime({ mode: "last", days: +m[1] });
  m = /^this-(week|month|quarter|year)$/.exec(slug);
  if (m) return withTime({ mode: "this", unit: m[1] as DateRangeUnit });

  const from = params.get("from")?.trim() ?? "";
  const to = params.get("to")?.trim() ?? "";
  if (isDay(from) && isDay(to)) {
    return withTime(from <= to ? { mode: "between", from, to } : { mode: "between", from: to, to: from });
  }
  if (isDay(from) && !to) return withTime({ mode: "since", from });
  return null;
}

/** A stored or posted range, checked field by field; null when malformed. */
export function parseDateRangeValue(input: unknown): DateRangeValue | null {
  if (!input || typeof input !== "object") return null;
  const v = input as Record<string, unknown>;
  let time: TimeRange | undefined;
  if (v.time !== undefined) {
    const t = v.time as Record<string, unknown> | null;
    const from = typeof t?.from === "string" ? parseTimeInput(t.from) : null;
    const to = typeof t?.to === "string" ? parseTimeInput(t.to) : null;
    if (!from || !to) return null;
    time = { from, to };
  }
  const withTime = (value: DateRangeValue): DateRangeValue => (time ? { ...value, time } : value);
  switch (v.mode) {
    case "between":
      return isDay(v.from) && isDay(v.to) ? withTime({ mode: "between", from: v.from, to: v.to }) : null;
    case "last":
      return typeof v.days === "number" && Number.isInteger(v.days) && v.days >= 1 && v.days <= 3650
        ? withTime({ mode: "last", days: v.days })
        : null;
    case "since":
      return isDay(v.from) ? withTime({ mode: "since", from: v.from }) : null;
    case "this":
      return DATE_RANGE_UNITS.includes(v.unit as DateRangeUnit)
        ? withTime({ mode: "this", unit: v.unit as DateRangeUnit })
        : null;
    case "yesterday":
      return withTime({ mode: "yesterday" });
    default:
      return null;
  }
}

// ─── Comparison (ComparePicker) ───

/**
 * What a page compares its range with: nothing, the period of the same
 * length `periods` back (1 = right before it), or fixed days.
 */
export type CompareValue =
  | { mode: "off" }
  | { mode: "previous"; periods: 1 | 2 | 3 }
  | { mode: "custom"; from: string; to: string };

export const COMPARE_OFF: CompareValue = { mode: "off" };

export const COMPARE_PERIODS = [1, 2, 3] as const;

/** The days of the same length `n` periods before `range`. */
export function periodsBefore(range: DayRange, n: number): DayRange {
  const shift = n * (daysBetween(range.from, range.to) + 1);
  return { from: addDays(range.from, -shift), to: addDays(range.to, -shift) };
}

/** The days a comparison covers; null when it is off or the page has no range. */
export function resolveCompare(value: CompareValue, range: DayRange | null): DayRange | null {
  if (value.mode === "custom") return { from: value.from, to: value.to };
  if (value.mode === "previous" && range) return periodsBefore(range, value.periods);
  return null;
}

/** "Previous period", "2 periods ago", the custom days, "Off". */
export function compareLabel(value: CompareValue): string {
  if (value.mode === "off") return "Off";
  if (value.mode === "custom") return formatDateRange(value.from, value.to);
  return value.periods === 1 ? "Previous period" : `${value.periods} periods ago`;
}

export function sameCompare(a: CompareValue, b: CompareValue): boolean {
  if (a.mode === "previous" && b.mode === "previous") return a.periods === b.periods;
  if (a.mode === "custom" && b.mode === "custom") return a.from === b.from && a.to === b.to;
  return a.mode === b.mode;
}

/**
 * Query keys: `compare=previous-period|2-periods-ago|3-periods-ago|off`,
 * fixed days as `compare_from` / `compare_to`. The page's default
 * (`fallback`, Off unless the page says otherwise) writes nothing.
 */
export function compareToParams(
  value: CompareValue,
  fallback: CompareValue = COMPARE_OFF,
): {
  compare: string | null;
  compare_from: string | null;
  compare_to: string | null;
} {
  if (sameCompare(value, fallback)) return { compare: null, compare_from: null, compare_to: null };
  if (value.mode === "custom") return { compare: null, compare_from: value.from, compare_to: value.to };
  if (value.mode === "previous") {
    return {
      compare: value.periods === 1 ? "previous-period" : `${value.periods}-periods-ago`,
      compare_from: null,
      compare_to: null,
    };
  }
  return { compare: "off", compare_from: null, compare_to: null };
}

/**
 * Reads what `compareToParams` writes, case-insensitively; no key or an
 * unreadable one is the page's default (`fallback`).
 */
export function compareFromParams(params: URLSearchParams, fallback: CompareValue = COMPARE_OFF): CompareValue {
  const from = params.get("compare_from")?.trim() ?? "";
  const to = params.get("compare_to")?.trim() ?? "";
  if (isDay(from) && isDay(to)) return from <= to ? { mode: "custom", from, to } : { mode: "custom", from: to, to: from };
  const slug = (params.get("compare") ?? "").trim().toLowerCase();
  if (slug === "off") return COMPARE_OFF;
  if (slug === "previous-period") return { mode: "previous", periods: 1 };
  const m = /^([23])-periods-ago$/.exec(slug);
  return m ? { mode: "previous", periods: Number(m[1]) as 2 | 3 } : fallback;
}
