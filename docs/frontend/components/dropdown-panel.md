# DropdownPanel

Spec: design-system.md §8.3. Code: `src/components/design-system/dropdown-panel.tsx`,
imported from `@/components/design-system`.

The panel a filter trigger opens. It holds a **draft**: picks change only the
panel until Apply, then `onApply(ids)` runs once (no query per click, as the
URL filter rules ask). Closing without Apply (Esc, outside click) drops the
draft; the next open starts from `value` again. Built on Radix Popover: it
opens 8px below the trigger, left aligned, flips above when there is no room,
closes on Esc and outside click, so only one panel is open at a time. The panel
is never taller than the room Radix has next to the trigger: the list
scrolls inside and the search and Apply stay on screen (short windows).

## "list" (Apps, Channels, Add Metric)

```tsx
<DropdownPanel
  trigger={<FilterPill icon={<AppsIcon />} label={label} count={apps.length > 1 ? apps.length : undefined} />}
  searchPlaceholder="Search apps…"
  allOption={{ label: "All Apps", leading: <AllAppsTile /> }}
  options={apps.map((a) => ({
    id: a.key,
    label: a.name,
    leading: <img src={a.icon} alt="" className="size-6 rounded-xs" />,
    trailing: a.platform === "ios" ? <AppleIcon className="text-ink" /> : <AndroidIcon />,
  }))}
  value={selectedApps}
  onApply={setSelectedApps}
/>

<DropdownPanel
  trigger={<Button variant="secondary"><PlusIcon />Add Metric</Button>}
  searchPlaceholder="Search metrics…"
  options={[{ id: "installs", label: "Installs", group: "Acquisition", leading: <span className="size-2.5 rounded-full bg-viz-installs" /> }, …]}
  value={metrics}
  onApply={setMetrics}
  showCount
/>
```

286px, r16, `border-line`, `shadow-popover`, padding 16 top and bottom.
Search 32px (SearchInput) with 16px sides, gets focus on open; it matches
label and id. Rows 40px, 16px sides, `text-body-sm text-ink-2`, leading item
6px before the label (24px app tile r6, or a 10px viz dot), trailing item
(platform mark) on the right; hover `bg-page`. A picked row is
`bg-accent-subtle text-accent-text` with a 13px check at the right.
`group` adds uppercase `text-body-sm text-ink-3` headers in the order the
groups first appear. `allOption` is a first row meaning "no filter": picked
when the draft is empty, `text-ink-3` while other rows are picked, a click
clears the draft. `showCount` puts "N of M selected" (`text-micro`) over a
divider. Apply is the full-width primary (`size="lg"`). The list scrolls
past 416px.

## "checklist" (Platforms)

```tsx
<DropdownPanel
  variant="checklist"
  title="Select platforms"
  trigger={<FilterPill icon={<PlatformsIcon />} label={label} count={…} />}
  options={[
    { id: "organic", label: "Organic", leading: <OrganicIcon className="text-ink" /> },
    { id: "meta", label: "Meta", leading: <MetaLogo /> },
    { id: "tiktok", label: "TikTok", leading: <TikTokLogo className="text-ink" /> },
    …
  ]}
  value={platforms}
  onApply={setPlatforms}
/>
```

244px, r12. Header: title in `text-overline` caps, "N selected" in
`text-accent-text` (`text-ink-3` at 0). Rows 37px, r8, 6px from the panel
edge, 2px apart: Checkbox, 16px mark (`OrganicIcon`, `NonOrganicIcon`,
`MetaLogo`, `TikTokLogo`, `AppleIcon`, `GoogleAdsLogo`), label `text-body text-ink`; picked rows
`bg-accent-subtle`. Footer over a divider: Clear (ghost, empties the draft)
and Apply (primary `md`), disabled while nothing is picked.

## Labels on the trigger

The trigger shows the applied value, not the draft: nothing picked → "All
Apps" / "All Platforms"; one → its name; several → the plural with `count`.
`multiple={false}` makes it a single choice that still applies on Apply.
