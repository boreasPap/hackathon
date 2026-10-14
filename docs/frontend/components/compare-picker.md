# ComparePicker

Code: `src/components/design-system/compare-picker.tsx`, imported from
`@/components/design-system`. Logic: `src/lib/date-range.ts` (Comparison).
The calendar is the DateRangePicker's (`range-calendar.tsx`).

The "Compare to" pill and panel. Choices: Previous period, 2 periods ago,
3 periods ago, Custom range, Off. Default is Off; a page can pick another
default.

```tsx
const COMPARE_DEFAULT: CompareValue = { mode: "previous", periods: 1 }; // or leave out for Off
const [compare, setCompare] = useState<CompareValue>(() => compareFromParams(initialParams, COMPARE_DEFAULT));
const compareDays = resolveCompare(compare, days); // null when off

<ComparePicker value={compare} onChange={setCompare} range={days} defaultValue={COMPARE_DEFAULT} maxDate={maxDate} />
// URL: compareToParams(compare, COMPARE_DEFAULT)

<KpiCard previous={compareDays ? kpiValue(key, previousTotals) : undefined} previousRange={compareDays ?? undefined} … />
```

## What the choices mean

| value | days |
|---|---|
| `{ mode: "previous", periods: 1 }` Previous period | the same number of days right before the range |
| `periods: 2` / `3` | two / three such lengths back |
| `{ mode: "custom", from, to }` Custom range | the picked days, any length |
| `{ mode: "off" }` Off | no comparison: the page leaves the deltas out |

`periodsBefore(range, n)` shifts by whole lengths, so for Last 7 Days
(29 Sep – 5 Oct) the rows read 22 Sep – 28 Sep, 15 Sep – 21 Sep,
8 Sep – 14 Sep. A calendar range (This Month) shifts by its length too, not
by a calendar month.

## Look

1. Trigger: a `FilterPill` with `CompareIcon` and `Compare to: <choice>`
   ("Off", "Previous period", "2 periods ago", or the custom days); accent
   (`active`) while the choice is off the page's default (`defaultValue`),
   as the DateRangePicker is. It sits right after the DateRangePicker in the filter bar.
2. Panel 272px, r12, `border-line`, `shadow-popover`, like the checklist
   DropdownPanel. Header `Compare to` in `text-overline` caps.
3. Rows: name in `text-body text-ink`, the days they cover under it in
   `text-caption text-ink-3`, the RadioGroup dot on the right. The picked row
   is `bg-accent-subtle` with the name in `text-accent-text`. Dividers (inset
   14px) before Custom range and before Off.
4. A row applies on click and closes the panel: a single choice runs one
   query, so there is no draft or Apply.
5. Custom range turns the panel into a back arrow, one month of the range
   calendar (days after `maxDate` closed), the picked days and Cancel / Apply.

## URL

`compare=previous-period`, `compare=2-periods-ago`, `compare=3-periods-ago`,
`compare=off`, custom days as `compare_from` / `compare_to`
(`compareToParams`, `compareFromParams`, case-insensitive). Both take the
page's default: it writes nothing, and no key or an unreadable one reads as
it. So on a page that defaults to Off, Off is no key, and on a page that
defaults to Previous period, Previous period is no key and Off is
`compare=off`.
