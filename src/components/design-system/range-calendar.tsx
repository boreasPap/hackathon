"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { dayToLocalDate } from "@/lib/date-range";
import { ChevronRightIcon } from "./icons/ui-icons";

// The range calendar of DateRangePicker and ComparePicker:
// Monday weeks, days after `maxDate` (and before `minDate`) dimmed and closed.
// It works on "YYYY-MM-DD" days; DayPicker's local dates stay in here. The
// caller decides what a click does (first click starts a range, the second
// ends it) and draws the hover preview through `selected`.

const toLocal = dayToLocalDate;

function fromLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The month to show first so that `day` is in the last of `months`. */
export function calendarMonthFor(day: string, months: 1 | 2 = 2): Date {
  const d = toLocal(day);
  return new Date(d.getFullYear(), d.getMonth() - (months - 1), 1);
}

export type RangeCalendarProps = {
  months?: 1 | 2;
  month: Date;
  onMonthChange: (month: Date) => void;
  maxDate: string;
  minDate?: string;
  selected: { from: string; to: string } | null;
  onPick: (day: string) => void;
  /** The day under the pointer; null when it leaves the calendar. */
  onHover: (day: string | null) => void;
};

export function RangeCalendar({
  months = 2,
  month,
  onMonthChange,
  maxDate,
  minDate,
  selected,
  onPick,
  onHover,
}: RangeCalendarProps) {
  return (
    <div onMouseLeave={() => onHover(null)}>
      <DayPicker
        mode="range"
        numberOfMonths={months}
        navLayout="around"
        weekStartsOn={1}
        showOutsideDays={false}
        month={month}
        onMonthChange={onMonthChange}
        startMonth={minDate ? toLocal(minDate) : undefined}
        endMonth={toLocal(maxDate)}
        disabled={[{ after: toLocal(maxDate) }, ...(minDate ? [{ before: toLocal(minDate) }] : [])]}
        selected={selected ? { from: toLocal(selected.from), to: toLocal(selected.to) } : undefined}
        onSelect={(_, day) => onPick(fromLocal(day))}
        onDayMouseEnter={(day) => onHover(fromLocal(day))}
        components={{ Chevron: CalendarChevron }}
        classNames={{
          root: "",
          months: "flex",
          month: "relative first:pl-6 not-first:ml-4 not-first:border-l not-first:border-line not-first:pl-4",
          month_caption: "flex h-5 items-center",
          caption_label: "text-body font-semibold text-ink",
          button_previous:
            "absolute -top-0.5 -left-1 flex size-6 cursor-pointer items-center justify-center rounded-full text-ink-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-border aria-disabled:pointer-events-none aria-disabled:opacity-40",
          button_next:
            "absolute -top-0.5 right-0 flex size-6 cursor-pointer items-center justify-center rounded-full text-ink-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-border aria-disabled:pointer-events-none aria-disabled:opacity-40",
          month_grid: "mt-3 border-separate border-spacing-0",
          weekdays: "",
          weekday: "h-6 w-7 p-0 pt-0.5 align-top text-caption text-ink-3",
          weeks: "",
          week: "",
          day: "size-7 p-0 text-center",
          day_button:
            "flex size-7 cursor-pointer items-center justify-center rounded-full text-body-sm text-ink-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-border",
          range_start:
            "rounded-l-full bg-accent [&>button]:font-semibold [&>button]:text-accent-contrast [&>button]:hover:bg-transparent",
          range_end:
            "rounded-r-full bg-accent [&>button]:font-semibold [&>button]:text-accent-contrast [&>button]:hover:bg-transparent",
          range_middle: "bg-accent-subtle [&>button]:text-accent-text [&>button]:hover:bg-accent-muted",
          selected: "",
          today: "",
          disabled: "[&>button]:cursor-default [&>button]:opacity-40 [&>button]:hover:bg-transparent",
          outside: "invisible",
          hidden: "invisible",
        }}
      />
    </div>
  );
}

function CalendarChevron({ orientation, className }: { orientation?: "up" | "down" | "left" | "right"; className?: string }) {
  return <ChevronRightIcon className={cn(orientation === "left" && "rotate-180", className)} />;
}
