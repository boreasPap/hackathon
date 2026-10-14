# FilterPill, FilterToggle

Spec: design-system.md §8.2. Code: `src/components/design-system/filter-pill.tsx`,
imported from `@/components/design-system`.

## FilterPill

The trigger of a filter dropdown. It only renders the button; the dropdown
(DropdownPanel, DateRangePicker) is opened by the caller.

```tsx
<FilterPill icon={<CalendarIcon />} label="Last 7 Days" onClick={…} aria-expanded={open} />
<FilterPill icon={<AppsIcon />} label="Apps" count={2} />
<FilterPill icon={<CalendarIcon />} label="9 Aug – 11 Sep 2026" active />
```

Anatomy: icon box 19px (an svg without a size class fills it; the
icons are `CalendarIcon`, `AppsIcon`, `SearchIcon`, `PlatformsIcon`,
`DiscountIcon`, and `CountriesIcon` with `size-4`) · label
`text-body` · count badge · chevron 11px. 34px high, r8, `border-line`,
`bg-surface`, padding 6/10/6/12, gap 6. Text and icon `text-ink-2`.
`font-bomstad`: the digits of a date label or the counter stay in Bomstad
(the app default would draw them in the system font).

| Prop | Effect |
|---|---|
| `count` | Accent badge after the label (20px, `bg-accent`, `text-accent-contrast`, 12/16). Hidden at 0 or when undefined. |
| `active` | `border-accent`, `bg-accent-subtle`, `text-accent-text` (label, icon, chevron). |

Hover `bg-muted`, focus ring 2px `accent-border`, disabled 40% opacity
(interim values). Extra button props pass through,
including `ref`, so a popover library can use it as its trigger.

Labels follow the URL filter rules in CLAUDE.md (Filters live in the URL): `All Apps` / `All
Countries` when nothing is picked, the single name when one is, the plural
with `count` for several. Dates inside a pill use `formatDate` (`17 Sep 2026`).

## FilterToggle

A pill that turns one option on or off; the whole pill is the switch
(`role="switch"`, `aria-checked`).

```tsx
<FilterToggle
  icon={<DiscountIcon />}
  label="Apply discount"
  checked={discount}
  onCheckedChange={setDiscount}
/>
```

Same box as FilterPill, without chevron, with the Switch track at the end.
The icon stays `text-accent` in both states (light and dark).
