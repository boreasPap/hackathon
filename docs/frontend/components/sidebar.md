# Sidebar (the app shell)

Spec: design-system.md §8.1. Code: `src/components/design-system/sidebar.tsx`
(presentational, imported from `@/components/design-system`) and
`src/components/dashboard/ProductSidebar.tsx` (fills it from the menu).

## The menu

`src/components/dashboard/Sidebar.tsx` only lists the menu:

```tsx
const NAV: NavSectionDef[] = [
  {
    items: [
      { name: "Weekly Report", href: "/dashboard/weekly-report", permission: "dashboard/weekly-report", icon: <GridIcon className="size-6" /> },
      {
        name: "My Reports",
        icon: <BarChartIcon className="size-6" />,
        permission: "dashboard/my-reports",
        prefixes: ["/dashboard/my-reports"],
        children: [
          { name: "Weekly", href: "/dashboard/my-reports/weekly", permission: "dashboard/my-reports/weekly" },
        ],
      },
    ],
  },
];
export default function Sidebar() {
  return <ProductSidebar product="dashboard" nav={NAV} defaultMatch="exact" />;
}
```

1. **`permission`** is the page's key (its route without the leading slash).
   Nothing checks it in this repo; every entry shows.
2. **Active link**: `match: "prefix"` lights it on the pages under it too;
   the default here is exact. A group opens by itself when a child is active
   or the page is under one of its `prefixes` (minus `excludePrefixes`); the
   others close.
3. **Sections**: `label` puts an overline over them; `emptyText` ("Coming
   soon") is shown while a section has no page at all.
4. **Icons**: the design system's set (`nav-icons.tsx`, `className="size-6"`)
   where it has one; others are lucide icons, drawn at 20px in the 24px box.

## Anatomy

1. 232px (`--sidebar-w`), `bg-surface`, `border-line` on the right; 64px
   collapsed (`--sidebar-w-collapsed`).
2. **Header**: the 28px accent tile with the Papcorns mark (it follows the
   theme), the "Papcorns." wordmark and the collapse button (28px, r10).
   When more than one workspace is passed, a click on the header opens the
   workspace switcher (194px, r16, rows 56px r12 with a 40px tile in the
   workspace colour, the name 13 / 600; the current one is `bg-muted`), and a
   workspace other than the main one shows its own tile and name in the
   header (`workspaceInHeader`, `WorkspaceTile`).
3. **Nav**: rows 44px, r12, padding 12, icon 24 + label 12 / 500 `text-ink`,
   hover `bg-muted`. Active: `bg-accent`, `text-accent-contrast`, label
   13 / 600. A group's chevron turns down when open; its links are 36px,
   13 / 500, indented to the label (44px), 2px apart, the active one like an
   active row.
4. **Footer**: avatar 32 (initial on `bg-line`), name 12 / 600 and role 10 in
   `text-ink-3`. A click on the user opens the account menu (the items passed
   in `user.menu`: links, toggles, actions). On the right the palette button
   (Theme Color) and the moon (light / dark), 24px r8 with a border; the moon
   is accent-tinted while dark mode is on.
5. **Theme Color popover**: 170px, r16, padding 16, "Theme Color" 12 / 600,
   three 26px swatches (Lilac, Green, Blue) with 10px labels; the picked one
   has a 2px accent ring and a check. A pick applies at once and is stored per
   browser (`papcorns-accent`, set on `<html data-theme>` before paint by
   `ACCENT_THEME_SCRIPT` in the root layout). Mode stays with next-themes
   (`papcorns-theme`).
6. **Logo** under the footer: the wordmark in the accent with the frosted
   glass mark over its first letters, which blurs them. One SVG with the
   gradient, rim, drop shadow and inner shadows as SVG filters; the first
   glow is lilac (green in the Green theme), the second the accent. Its size
   follows the window: the block under the footer is `100dvh - 640px` tall,
   at most 318px, and the whole logo scales with it, so a shorter window
   shows a smaller logo rather than a cut one. Under 760px it is left out, so
   the menu keeps its room. Not drawn when collapsed.
7. **Collapsed**: tile and expand button stacked, icon-only rows with a
   tooltip, section labels become dividers; a group icon opens the sidebar on
   that group. The footer stacks palette, moon and avatar. The state is kept
   per browser (`sidebar-collapsed` in localStorage).
8. **Phones** (below `md`): no rail. `MobileTopBar` (menu button, tile,
   name) sits over the page and opens the sidebar as a drawer with a close
   button; a route change closes it (`MobileNavProvider`).

## No top header

The design has none. The user and both theme controls are in the footer.
