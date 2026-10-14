# DateRangePicker

Spec: design-system.md §8.4. Code: `src/components/design-system/date-range-picker.tsx`,
imported from `@/components/design-system`. Range logic: `src/lib/date-range.ts`.
The calendar is `range-calendar.tsx`, shared with [ComparePicker](compare-picker.md).

## The range is what was picked

A value keeps the choice, not fixed dates, so a link or a saved preset
re-resolves whenever it is opened:

| mode | value | example |
|---|---|---|
| `between` | `{ from, to }` | the calendar, typed days, "Custom" |
| `last` | `{ days }` | Last 7 Days = the 7 days ending on the last selectable day |
| `since` | `{ from }` | Since 1 Sep 2026, up to the last selectable day |
| `this` | `{ unit }` | This Week / Month / Quarter / Year, from its first day up to the last selectable day |
| `yesterday` | — | Yesterday = the day before today, whatever the last selectable day is |

Any of them may carry `time: { from, to }` ("HH:mm:ss") on pages with
hourly data. `resolveDateRange(value, { maxDate, minDate })` gives the days
(`{ from, to }`), or `null` when the range has no selectable day yet. Days are
`YYYY-MM-DD` on the UTC calendar. Weeks start on Monday.

## Last selectable day

`maxDate` closes every later day: they are dimmed, cannot be clicked, typed
days are pulled back to it, and every relative range ends on it.

1. **Data that arrives later** (a daily job, a report that closes overnight)
   ends on its last complete day: the page passes that day as `maxDate`.
2. **Live data** leaves `maxDate` out: today is the last day.
3. `minDate` is the first day a page has data for.

A preset with no selectable day is left out of the list (This Week on
Monday morning, This Month on the 1st, Yesterday while yesterday is not
complete). `maxDateNote` puts one line under the calendar, for example
"Data is complete through 5 Oct 2026."

## Use on a page

```tsx
const PAGE_DEFAULT: DateRangeValue = { mode: "last", days: 7 };

const [picked, setPicked] = useState<DateRangeValue | null>(() =>
  parseDateRangeParams(initialParams));                 // null = the default
const range = picked ?? PAGE_DEFAULT;
const days = resolveDateRange(range, { maxDate });      // read data with days.from / days.to

<DateRangePicker
  value={range}
  onApply={setPicked}
  defaultValue={PAGE_DEFAULT}
  maxDate={maxDate}
  maxDateNote={`Data is complete through ${formatDate(maxDate)}.`}
/>
```

URL (CLAUDE.md, Filters live in the URL): `dateRangeToParams(value, default)`
writes `range=last-30-days`, `range=this-month`, `range=yesterday`, `from`/`to` for fixed days,
`from` alone for "since", `time=09:00:00-18:00:00` for a time window, and
nothing for the default. `dateRangeFromParams(params, fallback, bounds)`
reads them back case-insensitively (`parseDateRangeParams` gives `null`
instead of a fallback); anything invalid or without a selectable day falls back.

## Anatomy

664px, r16, `border-line`, `shadow-popover`; opens 8px under the trigger,
left aligned, flips when there is no room; Esc and an outside click drop
the draft.

1. **Presets** (176px, `border-muted` on the right): "PRESETS" in
   `text-overline`, rows 36px with 12px sides, `text-body text-ink-2`; hover
   `bg-page`, the picked row `bg-accent-subtle text-accent-text`. Default ·
   Yesterday · Last 7 / 30 / 60 / 90 Days · This Week / Month / Quarter /
   Year · Custom,
   then "SAVED" with the saved presets (an × on hover removes one).
2. **Type and fields** (right column, padding 16): the Select (92px)
   Between / Last / Since / This, then the fields: two day inputs with "and",
   a number with "days", one day input, or a period select. Yesterday shows
   as Between with the day in both inputs; changing them makes it Between. Day inputs show
   `17 Sep 2026` and accept `22 Sep 2026`, `Sep 22, 2026`, `2026-09-22`,
   `22.09.2026`; Enter or leaving the field commits, anything unreadable
   puts the last day back.
3. **Time** (`allowTime`): "+ Add time" opens From / to inputs (Input `sm`,
   78px, `00:00:00` – `23:59:59`), "− Remove time" closes them.
4. **Months**: two, 28px days in `text-body-sm text-ink-2`, weekday initials
   in `text-caption text-ink-3`, a 1px divider; ‹ in the left gutter, › at the
   right of the second caption. Range ends `bg-accent` with
   `text-accent-contrast`, rounded on the outer side; days between
   `bg-accent-subtle text-accent-text`. The first click starts a range, the
   second ends it, the band follows the pointer in between.
5. **Save as Preset** (`onSavePreset`): a `bg-page` box with Preset name
   (filled with the range's name), Visibility (Only you / Everyone in this
   project), "Set preset as my default" and a full-width Create (36px). The
   link turns into "↑ Collapse".
6. **Footer**: Save as Preset link · Cancel (ghost) and Apply (primary).

The trigger is a FilterPill with `CalendarIcon` and the range's name
(`dateRangeLabel`: "Last 7 Days", "Since 1 Sep 2026", "22 Sep – 28 Sep 2026";
fixed days that equal a preset today get its name). It takes the `active`
look while the range is not the default. Digits in the panel stay Bomstad.

## Saved presets

The picker only draws them. A page that wants "Save as Preset" passes
`savedPresets`, `onSavePreset` and `onDeletePreset` and keeps the presets
wherever it stores its data; without `onSavePreset` the link is not shown.
