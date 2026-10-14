// Display formats of the design system (docs/frontend/design-system.md §1, §9).
// Screens show dates as "17 Sep 2026"; ISO dates stay in CSV and technical fields.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// A "YYYY-MM-DD" string is read as a calendar day, never shifted by timezone.
export function formatDate(value: Date | string): string {
  if (typeof value === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (m) return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
    value = new Date(value);
  }
  return `${value.getDate()} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
}

// "17 Sep – 24 Sep 2026", the year once when both ends share it;
// "28 Dec 2026 – 3 Jan 2027" across years; one day is just "17 Sep 2026".
export function formatDateRange(from: Date | string, to: Date | string): string {
  const a = formatDate(from);
  const b = formatDate(to);
  if (a === b) return a;
  const [day, month, year] = a.split(" ");
  return year === b.split(" ")[2] ? `${day} ${month} – ${b}` : `${a} – ${b}`;
}

// Numbers (EN format). Cards show compact values with an upper-case K / M / B
// ("$24.4K"), tables the full value with separators ("1,797").

const COMPACT_STEPS: [number, string][] = [
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

function compact(value: number): string {
  const abs = Math.abs(value);
  for (const [step, suffix] of COMPACT_STEPS) {
    if (abs >= step) return `${(abs / step).toFixed(1).replace(/\.0$/, "")}${suffix}`;
  }
  return Math.round(abs).toLocaleString("en-US");
}

const sign = (value: number) => (value < 0 ? "-" : "");

/** 1797 → "1,797". */
export function formatNumber(value: number): string {
  return `${sign(value)}${Math.round(Math.abs(value)).toLocaleString("en-US")}`;
}

/** 24400 → "24.4K", 950 → "950". */
export function formatCompact(value: number): string {
  return `${sign(value)}${compact(value)}`;
}

/** 0.58 → "$0.58", 1234.5 → "$1,234.50". */
export function formatCurrency(value: number): string {
  return `${sign(value)}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** 24400 → "$24.4K", 950 → "$950". */
export function formatCurrencyCompact(value: number): string {
  return `${sign(value)}$${compact(value)}`;
}

/** A ratio: 0.724 → "72.4%". */
export function formatPercent(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}
