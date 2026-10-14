"use client";

import * as React from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import {
  COMPARE_OFF,
  COMPARE_PERIODS,
  compareLabel,
  periodsBefore,
  sameCompare,
  utcToday,
  type CompareValue,
  type DayRange,
} from "@/lib/date-range";
import { formatDateRange } from "@/lib/format";
import { Button } from "./button";
import { FilterPill } from "./filter-pill";
import { ChevronRightIcon, CompareIcon } from "./icons/ui-icons";
import { RangeCalendar, calendarMonthFor } from "./range-calendar";

// ComparePicker (docs/frontend/components/compare-picker.md). The "Compare
// to" pill beside the DateRangePicker: the period right before the page's
// range, two or three periods back, custom days, or Off. A row applies on
// click (one query, nothing to stage); "Custom range" turns the panel into a
// one-month calendar with Apply. Radix Popover, like DropdownPanel: Esc and an
// outside click close it.

export type ComparePickerProps = {
  value: CompareValue;
  onChange: (value: CompareValue) => void;
  /** The page's days; each row shows the days it compares with. */
  range: DayRange | null;
  /** The page's default; the pill is accent while the value is off it. Off when left out. */
  defaultValue?: CompareValue;
  /** Last selectable day of the custom calendar; today (UTC) when left out. */
  maxDate?: string;
  minDate?: string;
  align?: "start" | "end";
};

export function ComparePicker({
  value,
  onChange,
  range,
  defaultValue = COMPARE_OFF,
  maxDate,
  minDate,
  align = "start",
}: ComparePickerProps) {
  const last = maxDate ?? utcToday();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"list" | "custom">("list");
  const [draft, setDraft] = React.useState<DayRange | null>(null);
  const [anchor, setAnchor] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const [month, setMonth] = React.useState<Date>(() => calendarMonthFor(last, 1));

  const onOpenChange = (next: boolean) => {
    if (next) setView("list");
    setOpen(next);
  };

  const pick = (next: CompareValue) => {
    onChange(next);
    setOpen(false);
  };

  // The calendar starts on the custom days in use, or empty on the month
  // the page's range starts in (a comparison is usually before it).
  const openCustom = () => {
    const start = value.mode === "custom" ? { from: value.from, to: value.to } : null;
    setDraft(start);
    setAnchor(null);
    setHover(null);
    setMonth(calendarMonthFor(start?.to ?? range?.from ?? last, 1));
    setView("custom");
  };

  // The first click starts a range on that day, the second ends it.
  const pickDay = (day: string) => {
    if (anchor === null) {
      setDraft({ from: day, to: day });
      setAnchor(day);
    } else {
      setDraft(day < anchor ? { from: day, to: anchor } : { from: anchor, to: day });
      setAnchor(null);
    }
  };
  const preview = anchor && hover ? (hover < anchor ? { from: hover, to: anchor } : { from: anchor, to: hover }) : draft;

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <FilterPill icon={<CompareIcon />} label={`Compare to: ${compareLabel(value)}`} active={!sameCompare(value, defaultValue)} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={8}
          collisionPadding={16}
          aria-label="Compare to"
          className="z-50 flex max-h-(--radix-popover-content-available-height) w-[272px] flex-col overflow-hidden rounded-lg border border-line bg-surface font-bomstad shadow-popover outline-none"
        >
          {view === "list" ? (
            <>
              <div className="shrink-0 px-3.5 pt-3 pb-1.5 text-overline uppercase text-ink-3">Compare to</div>
              <div role="radiogroup" aria-label="Compare to" className="min-h-0 overflow-y-auto">
                {COMPARE_PERIODS.map((periods) => {
                  const option: CompareValue = { mode: "previous", periods };
                  const days = range ? periodsBefore(range, periods) : null;
                  return (
                    <CompareRow
                      key={periods}
                      label={compareLabel(option)}
                      detail={days ? formatDateRange(days.from, days.to) : undefined}
                      checked={value.mode === "previous" && value.periods === periods}
                      onClick={() => pick(option)}
                    />
                  );
                })}
                <Divider />
                <CompareRow
                  label="Custom range"
                  detail={value.mode === "custom" ? formatDateRange(value.from, value.to) : undefined}
                  checked={value.mode === "custom"}
                  onClick={openCustom}
                />
                <Divider />
                <CompareRow label="Off" checked={value.mode === "off"} onClick={() => pick(COMPARE_OFF)} />
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-col overflow-y-auto px-4 pt-3 pb-3">
              <div className="flex items-center gap-1 pb-3">
                <button
                  type="button"
                  aria-label="Back"
                  onClick={() => setView("list")}
                  className="-ml-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full text-ink-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-border"
                >
                  <ChevronRightIcon className="rotate-180" />
                </button>
                <span className="text-overline uppercase text-ink-3">Custom range</span>
              </div>
              <RangeCalendar
                months={1}
                month={month}
                onMonthChange={setMonth}
                maxDate={last}
                minDate={minDate}
                selected={preview}
                onPick={pickDay}
                onHover={setHover}
              />
              <p className="mt-3 text-caption text-ink-3">
                {preview ? formatDateRange(preview.from, preview.to) : "Pick the first and the last day."}
              </p>
              <div className="mt-3 flex items-center justify-end gap-2 border-t border-line pt-3">
                <Button variant="ghost" onClick={() => setView("list")}>
                  Cancel
                </Button>
                <Button disabled={!draft} onClick={() => draft && pick({ mode: "custom", ...draft })}>
                  Apply
                </Button>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function CompareRow({
  label,
  detail,
  checked,
  onClick,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left outline-none transition-colors focus-visible:bg-muted",
        checked ? "bg-accent-subtle" : "hover:bg-page",
      )}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate text-body", checked ? "text-accent-text" : "text-ink")}>{label}</span>
        {detail ? <span className="truncate text-caption text-ink-3">{detail}</span> : null}
      </span>
      {/* The RadioGroup dot (form-controls.md). */}
      <span
        aria-hidden
        className={cn(
          "flex size-3.25 shrink-0 items-center justify-center rounded-full border bg-surface",
          checked ? "border-accent" : "border-ink-3",
        )}
      >
        {checked ? <span className="size-2 rounded-full bg-accent" /> : null}
      </span>
    </button>
  );
}

function Divider() {
  return <div role="none" className="mx-3.5 my-1 border-t border-line" />;
}
