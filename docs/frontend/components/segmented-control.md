# SegmentedControl

Spec: design-system.md §8.5. Code: `src/components/design-system/segmented-control.tsx`,
imported from `@/components/design-system`.

```tsx
<SegmentedControl
  aria-label="Period"
  value={period}
  onValueChange={setPeriod}
  options={[
    { value: "month", label: "Month" },
    { value: "week", label: "Week" },
    { value: "day", label: "Day" },
  ]}
/>

<SegmentedControl
  aria-label="Platform"
  value={platform}
  onValueChange={setPlatform}
  options={[
    { value: "all", label: "All Platforms", icon: <AllPlatformsIcon /> },
    { value: "ios", label: "iOS", icon: <AppleIcon className="size-4 text-ink" /> },
    { value: "android", label: "Android", icon: <AndroidIcon className="size-4" /> },
  ]}
/>
```

Anatomy: track 34px, `bg-muted`, r8, padding 2, gap 2. Items 30px, r6,
`text-body-sm` with a 16px line, gap 6. The picked item is `bg-surface` with
`shadow-xs` and `text-ink`; the others are `text-ink-3` (hover `text-ink-2`).
A text-only item is padded 12, an item with an icon 10. Icons are 11px
glyphs in a 14px box; platform marks pass `className="size-4"` for 16px.

It is a single choice that always keeps a value: clicking the picked item
does nothing. Built on Radix ToggleGroup (`role="radio"` items, arrow keys
move between them). `aria-label` is required.

## Use

1. Fixed filters with 3–4 options are a SegmentedControl, not a dropdown
   (design-system.md §8.5).
2. Several controls in one toolbar sit 12px apart with a 1×20 `bg-line`
   divider between them (Trend Chart toolbar):

   ```tsx
   <div className="flex items-center gap-3">
     <SegmentedControl … />
     <span aria-hidden className="mx-0.5 h-5 w-px bg-line" />
     <SegmentedControl … />
   </div>
   ```
