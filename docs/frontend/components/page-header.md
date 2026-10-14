# PageHeader

Spec: design-system.md §8.10. Code: `src/components/design-system/page-header.tsx`,
imported from `@/components/design-system`.

```tsx
<PageHeader
  title="Weekly Report"
  description="Spend, revenue and installs across apps."
  actions={<Button variant="secondary">Export CSV</Button>}
  filters={
    <>
      <DateRangePicker … />
      <DropdownPanel trigger={<FilterPill icon={<AppsIcon />} … />} … />
      <DropdownPanel variant="checklist" trigger={<FilterPill icon={<PlatformsIcon />} … />} … />
      <FilterToggle icon={<DiscountIcon />} label="Apply discount" … />
    </>
  }
/>
```

The same template on every page:

1. Title `text-page-title` (28 / 39, `text-ink`), an `h1`.
2. 8px, then the description `text-page-desc` (14 / 20, `text-ink-3`), one
   line: keep it short enough not to wrap.
3. Actions on the right, aligned to the title; one primary action per page
   at most (design doc §1).
4. The filter bar 16px under the description, pills 8px apart, wrapping on
   narrow screens. Its controls keep their state in the URL (CLAUDE.md,
   Filters live in the URL).

## Page layout around it

The page content starts 32px right of the sidebar and 32px from the top;
the KPI grid comes 32px under the filter bar and each next block 32px under
the previous one (KPI rows 16px apart).
