"use client";

import * as React from "react";
import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import {
  DATE_RANGE_PRESETS,
  DATE_RANGE_UNITS,
  availablePresets,
  dateRangeLabel,
  daysBetween,
  parseDayInput,
  parseTimeInput,
  resolveDateRange,
  sameDateRange,
  unitLabel,
  utcToday,
  type DateBounds,
  type DateRangeMode,
  type DateRangePreset,
  type DateRangeUnit,
  type DateRangeValue,
  type SavedDateRangePreset,
  type SavePresetInput,
} from "@/lib/date-range";
import { formatDate } from "@/lib/format";
import { Button } from "./button";
import { FilterPill } from "./filter-pill";
import { Input } from "./input";
import { Label } from "./label";
import { RadioGroup } from "./radio-group";
import { Select } from "./select";
import { Switch } from "./switch";
import { CalendarIcon, CloseIcon } from "./icons/ui-icons";
import { RangeCalendar, calendarMonthFor } from "./range-calendar";

// DateRangePicker (docs/frontend/components/date-range-picker.md, design doc
// §8.4).
// 664px, r16: presets on the left (176px), on the right the range type with
// its fields, an optional time window, two months and the footer. Picks are a
// draft until Apply, like DropdownPanel. Days after `maxDate` cannot be
// picked: a page whose data ends before today passes its last complete day.
// Range logic lives in src/lib/date-range.ts.

export type DateRangePickerProps = {
  value: DateRangeValue;
  onApply: (value: DateRangeValue) => void;
  /** What "Default" stands for: the page's range, or the viewer's default preset. */
  defaultValue: DateRangeValue;
  /** Last selectable day, "YYYY-MM-DD"; today (UTC) when left out. */
  maxDate?: string;
  /** First selectable day, where the page's data starts. */
  minDate?: string;
  /** One line under the calendar on why later days are closed. */
  maxDateNote?: string;
  /** The built-in rows between "Default" and "Custom". */
  presets?: readonly DateRangePreset[];
  savedPresets?: SavedDateRangePreset[];
  /** Shows "Save as Preset". A rejected promise keeps the form open. */
  onSavePreset?: (input: SavePresetInput) => Promise<void> | void;
  onDeletePreset?: (id: number) => Promise<void> | void;
  /** "+ Add time", for pages on hourly data only. */
  allowTime?: boolean;
  align?: "start" | "end";
  /** A FilterPill with the calendar icon and the range's name by default. */
  trigger?: React.ReactElement;
};

// The Type select's modes. Yesterday is a preset row only; the select shows
// it as Between with the day in both fields.
type PickerMode = Exclude<DateRangeMode, "yesterday">;

const MODE_OPTIONS: { value: PickerMode; label: string }[] = [
  { value: "between", label: "Between" },
  { value: "last", label: "Last" },
  { value: "since", label: "Since" },
  { value: "this", label: "This" },
];

const DEFAULT_TIME = { from: "00:00:00", to: "23:59:59" };

// The left of the two months shown, so that `day` is in the right one.
const monthBefore = (day: string) => calendarMonthFor(day, 2);

function withTime(value: DateRangeValue, time: DateRangeValue["time"]): DateRangeValue {
  const next = { ...value };
  delete next.time;
  return time ? { ...next, time } : next;
}

export function DateRangePicker({
  value,
  onApply,
  defaultValue,
  maxDate,
  minDate,
  maxDateNote,
  presets = DATE_RANGE_PRESETS,
  savedPresets = [],
  onSavePreset,
  onDeletePreset,
  allowTime = false,
  align = "start",
  trigger,
}: DateRangePickerProps) {
  const today = utcToday();
  const bounds: DateBounds = { maxDate: maxDate ?? today, minDate, today };
  const shown = availablePresets(bounds, presets);
  const shownSaved = savedPresets.filter((p) => resolveDateRange(p.value, bounds));

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRangeValue>(value);
  const [row, setRow] = React.useState("custom");
  const [month, setMonth] = React.useState<Date>(() => monthBefore(bounds.maxDate));
  const [anchor, setAnchor] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  // "This" offers the periods that have a complete day (and the one picked).
  const units = DATE_RANGE_UNITS.filter(
    (u) => resolveDateRange({ mode: "this", unit: u }, bounds) || (draft.mode === "this" && draft.unit === u),
  );
  const modes = MODE_OPTIONS.filter((m) => m.value !== "this" || units.length > 0);

  // The presets row a range belongs to: a built-in, a saved one, Default, or
  // Custom. Fixed days that equal a built-in today light that built-in.
  const rowFor = (v: DateRangeValue): string => {
    const dates = withTime(v, undefined);
    const preset = shown.find((p) => sameDateRange(p.value, dates));
    if (preset) return preset.id;
    const saved = shownSaved.find((p) => sameDateRange(p.value, v));
    if (saved) return `saved:${saved.id}`;
    if (sameDateRange(defaultValue, v)) return "default";
    const range = v.mode === "between" ? resolveDateRange(v, bounds) : null;
    const same = range
      ? shown.find((p) => {
          const r = resolveDateRange(p.value, bounds);
          return r?.from === range.from && r?.to === range.to;
        })
      : undefined;
    return same?.id ?? "custom";
  };

  const show = (v: DateRangeValue) => {
    const range = resolveDateRange(v, bounds);
    if (range) setMonth(monthBefore(range.to));
  };

  const onOpenChange = (next: boolean) => {
    if (next) {
      setDraft(value);
      setRow(rowFor(value));
      setAnchor(null);
      setHover(null);
      setSaving(false);
      setMonth(monthBefore(resolveDateRange(value, bounds)?.to ?? bounds.maxDate));
    }
    setOpen(next);
  };

  // A preset row, or any other change: the time window stays as it is.
  const choose = (id: string, v: DateRangeValue, move = true) => {
    const next = withTime(v, draft.time);
    setDraft(next);
    setRow(id);
    setAnchor(null);
    if (move) show(next);
  };

  const edit = (v: DateRangeValue, move = false) => {
    const next = withTime(v, draft.time);
    choose(rowFor(next), next, move);
  };

  const clampDay = (day: string) =>
    day > bounds.maxDate ? bounds.maxDate : bounds.minDate && day < bounds.minDate ? bounds.minDate : day;

  const resolved = resolveDateRange(draft, bounds);
  const fallbackRange = resolved ?? { from: bounds.maxDate, to: bounds.maxDate };
  const fields: Exclude<DateRangeValue, { mode: "yesterday" }> =
    draft.mode === "yesterday" ? { mode: "between", from: fallbackRange.from, to: fallbackRange.to } : draft;

  const changeMode = (mode: PickerMode) => {
    const r = fallbackRange;
    if (mode === "between") edit({ mode, from: r.from, to: r.to }, true);
    else if (mode === "last") edit({ mode, days: daysBetween(r.from, r.to) + 1 }, true);
    else if (mode === "since") edit({ mode, from: r.from }, true);
    else edit({ mode, unit: units.includes("month") ? "month" : (units[0] ?? "month") }, true);
  };

  // Calendar: the first click starts a range on that day, the second ends it.
  const pickDay = (day: string) => {
    if (anchor === null) {
      edit({ mode: "between", from: day, to: day });
      setAnchor(day);
    } else {
      edit(day < anchor ? { mode: "between", from: day, to: anchor } : { mode: "between", from: anchor, to: day });
    }
  };

  const preview =
    anchor && hover ? (hover < anchor ? { from: hover, to: anchor } : { from: anchor, to: hover }) : resolved;

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const label = dateRangeLabel(value, bounds, presets);

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        {trigger ?? (
          <FilterPill icon={<CalendarIcon />} label={label} active={!sameDateRange(value, defaultValue)} />
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={8}
          collisionPadding={16}
          aria-label="Date range"
          className="z-50 flex max-h-(--radix-popover-content-available-height) w-[664px] overflow-hidden rounded-xl border border-line bg-surface font-bomstad shadow-popover outline-none"
        >
          <div className="flex min-h-0 w-44 shrink-0 flex-col border-r border-muted">
            <div className="px-3 pt-3 pb-1.5 text-overline uppercase text-ink-3">Presets</div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-1">
              <PresetRow label="Default" selected={row === "default"} onClick={() => choose("default", defaultValue)} />
              {shown.map((p) => (
                <PresetRow key={p.id} label={p.label} selected={row === p.id} onClick={() => choose(p.id, p.value)} />
              ))}
              <PresetRow
                label="Custom"
                selected={row === "custom"}
                onClick={() => choose("custom", { mode: "between", from: fallbackRange.from, to: fallbackRange.to })}
              />
              {shownSaved.length > 0 ? (
                <>
                  <div className="px-3 pt-3 pb-1.5 text-overline uppercase text-ink-3">Saved</div>
                  {shownSaved.map((p) => (
                    <PresetRow
                      key={p.id}
                      label={p.name}
                      selected={row === `saved:${p.id}`}
                      onClick={() => choose(`saved:${p.id}`, p.value)}
                      onRemove={p.removable && onDeletePreset ? () => void onDeletePreset(p.id) : undefined}
                    />
                  ))}
                </>
              ) : null}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
            <div className="flex items-center gap-2 pb-3">
              <Select aria-label="Range type" value={fields.mode} onValueChange={changeMode} options={modes} className="w-23" />
              <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2">
                {fields.mode === "between" ? (
                  <>
                    <DayField
                      aria-label="First day"
                      day={fields.from}
                      onCommit={(day) => {
                        const d = clampDay(day);
                        edit(d <= fields.to ? { mode: "between", from: d, to: fields.to } : { mode: "between", from: fields.to, to: d }, true);
                      }}
                    />
                    <span className="text-caption text-ink-3">and</span>
                    <DayField
                      aria-label="Last day"
                      day={fields.to}
                      onCommit={(day) => {
                        const d = clampDay(day);
                        edit(d >= fields.from ? { mode: "between", from: fields.from, to: d } : { mode: "between", from: d, to: fields.from }, true);
                      }}
                    />
                  </>
                ) : fields.mode === "last" ? (
                  <>
                    <DaysField days={fields.days} onCommit={(days) => edit({ mode: "last", days }, true)} />
                    <span className="text-caption text-ink-3">days</span>
                  </>
                ) : fields.mode === "since" ? (
                  <DayField aria-label="First day" day={fields.from} onCommit={(day) => edit({ mode: "since", from: clampDay(day) }, true)} />
                ) : (
                  <Select
                    aria-label="Period"
                    value={fields.unit}
                    onValueChange={(unit: DateRangeUnit) => edit({ mode: "this", unit }, true)}
                    options={units.map((u) => ({ value: u, label: unitLabel(u) }))}
                    className="w-full"
                  />
                )}
              </div>
            </div>

            {allowTime && draft.time ? (
              <div className="flex items-center gap-2 pt-3 pb-2">
                <span className="text-body-sm text-ink-3">From</span>
                <TimeField
                  aria-label="From time"
                  time={draft.time.from}
                  onCommit={(t) => setDraft({ ...draft, time: { from: t, to: draft.time?.to ?? DEFAULT_TIME.to } })}
                />
                <span className="text-body-sm text-ink-3">to</span>
                <TimeField
                  aria-label="To time"
                  time={draft.time.to}
                  onCommit={(t) => setDraft({ ...draft, time: { from: draft.time?.from ?? DEFAULT_TIME.from, to: t } })}
                />
              </div>
            ) : null}
            {allowTime ? (
              <div className="flex h-8.5 items-start pt-1">
                <Button
                  variant="link"
                  onClick={() => setDraft(withTime(draft, draft.time ? undefined : DEFAULT_TIME))}
                >
                  {draft.time ? "− Remove time" : "+ Add time"}
                </Button>
              </div>
            ) : null}

            <RangeCalendar
              month={month}
              onMonthChange={setMonth}
              maxDate={bounds.maxDate}
              minDate={bounds.minDate}
              selected={preview}
              onPick={pickDay}
              onHover={setHover}
            />

            {maxDateNote ? <p className="mt-3 text-caption text-ink-3">{maxDateNote}</p> : null}

            {saving && onSavePreset ? (
              <SavePresetForm
                suggestedName={dateRangeLabel(draft, bounds, presets)}
                onCreate={async (input) => {
                  await onSavePreset({ ...input, value: draft });
                  setSaving(false);
                }}
              />
            ) : null}

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              {onSavePreset ? (
                <Button variant="link" onClick={() => setSaving((s) => !s)}>
                  {saving ? "↑ Collapse" : "Save as Preset"}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={apply}>Apply</Button>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PresetRow({
  label,
  selected,
  onClick,
  onRemove,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onClick}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center px-3 text-left text-body text-ink-2 outline-none transition-colors focus-visible:bg-muted",
          onRemove && "pr-8",
          selected ? "bg-accent-subtle text-accent-text" : "hover:bg-page",
        )}
      >
        <span className="min-w-0 truncate">{label}</span>
      </button>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="absolute top-1/2 right-2 hidden size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-xs text-ink-3 outline-none group-hover:flex hover:bg-muted hover:text-ink focus-visible:flex focus-visible:ring-2 focus-visible:ring-accent-border"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}

// A text field that takes a day as typed ("22 Sep 2026", "2026-09-22" …) and
// commits on Enter or blur; anything unreadable puts the last day back.
function DayField({ day, onCommit, ...props }: { day: string; onCommit: (day: string) => void; "aria-label": string }) {
  const [text, setText] = React.useState(formatDate(day));
  React.useEffect(() => setText(formatDate(day)), [day]);
  const commit = () => {
    const parsed = parseDayInput(text);
    if (parsed && parsed !== day) onCommit(parsed);
    else setText(formatDate(day));
  };
  return (
    <Input
      {...props}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
    />
  );
}

function DaysField({ days, onCommit }: { days: number; onCommit: (days: number) => void }) {
  const [text, setText] = React.useState(String(days));
  React.useEffect(() => setText(String(days)), [days]);
  const commit = () => {
    const n = Number(text.trim());
    if (Number.isInteger(n) && n >= 1 && n <= 3650 && n !== days) onCommit(n);
    else setText(String(days));
  };
  return (
    <Input
      aria-label="Number of days"
      inputMode="numeric"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
    />
  );
}

function TimeField({ time, onCommit, ...props }: { time: string; onCommit: (time: string) => void; "aria-label": string }) {
  const [text, setText] = React.useState(time);
  React.useEffect(() => setText(time), [time]);
  const commit = () => {
    const parsed = parseTimeInput(text);
    if (parsed && parsed !== time) onCommit(parsed);
    else setText(time);
  };
  return (
    <Input
      {...props}
      size="sm"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      className="w-19.5"
    />
  );
}

// "Save as Preset": name, visibility, default switch, Create.
function SavePresetForm({
  suggestedName,
  onCreate,
}: {
  suggestedName: string;
  onCreate: (input: Omit<SavePresetInput, "value">) => Promise<void>;
}) {
  const nameId = React.useId();
  const [name, setName] = React.useState<string | null>(null);
  const [visibility, setVisibility] = React.useState<"private" | "everyone">("private");
  const [isDefault, setIsDefault] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const shownName = name ?? suggestedName;

  const create = async () => {
    setPending(true);
    setError(null);
    try {
      await onCreate({ name: shownName.trim(), visibility, isDefault });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the preset");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-line bg-page p-3">
      <Label htmlFor={nameId} className="block pb-2">
        Preset name
      </Label>
      <Input id={nameId} value={shownName} onChange={(e) => setName(e.target.value)} maxLength={80} />
      <div className="pt-3 font-bomstad text-body-sm font-semibold text-ink">Visibility</div>
      <RadioGroup
        aria-label="Visibility"
        value={visibility}
        onValueChange={setVisibility}
        options={[
          { value: "private", label: "Only you" },
          { value: "everyone", label: "Everyone in this project" },
        ]}
        className="pt-1.5"
      />
      <label className="flex cursor-pointer items-center justify-between py-3 text-body text-ink-2">
        Set preset as my default
        <Switch checked={isDefault} onCheckedChange={setIsDefault} />
      </label>
      <Button block className="h-9" disabled={pending || !shownName.trim()} onClick={() => void create()}>
        Create
      </Button>
      {error ? <p className="pt-2 text-caption text-danger">{error}</p> : null}
    </div>
  );
}
