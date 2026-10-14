# Form controls: Checkbox, RadioGroup, Input, SearchInput, Select, Label

Spec: design-system.md §8.3, §8.4. Code in `src/components/design-system/`
(`checkbox.tsx`, `radio-group.tsx`, `input.tsx`, `select.tsx`, `label.tsx`),
imported from `@/components/design-system`. Checkbox, RadioGroup and Select
are Radix primitives: keyboard, focus and `Esc` / outside click come with
them. Every control is `font-bomstad` (dates and times keep Bomstad digits).

## Checkbox

```tsx
<Checkbox checked={on} onCheckedChange={(v) => setOn(v === true)} aria-label="Meta" />
```

18px, r6. Empty: `bg-surface`, 1.5px `border-line-strong`. Checked:
`bg-accent` with a 13px check in `text-accent-contrast`. No label of its own;
the row it sits in (DropdownPanel) provides one.

## RadioGroup

```tsx
<RadioGroup
  aria-label="Visibility"
  value={visibility}
  onValueChange={setVisibility}
  options={[
    { value: "me", label: "Only you" },
    { value: "project", label: "Everyone in this project" },
  ]}
/>
```

Dot 13px, 1px `ink-3` ring; picked: accent ring with an 8px accent dot.
Labels `text-body text-ink-2`, 6px from the dot, options 16px apart in a row
(`orientation="vertical"` stacks them 8px apart).

## Input, SearchInput

```tsx
<Input value={from} onChange={…} aria-label="From" />            // md, 34px
<Input size="sm" value="00:00:00" aria-label="From time" />       // sm, 28px
<SearchInput placeholder="Search apps…" aria-label="Search apps" />
```

| | Height | Padding | Text | Box |
|---|---|---|---|---|
| `md` | 34 | 10 | `text-body` | `bg-surface`, `border-line`, r8 |
| `sm` | 28 | 8 | `text-body-sm` | same |
| SearchInput | 32 | 8 left (icon 16, gap 4) | `text-body` | `bg-page`, no border, r8 |

Value `text-ink`, placeholder `text-ink-3`. Dates in inputs follow the
content rule (`22 Sep 2026`), not the ISO strings of the mockup.

## Select

```tsx
<Select
  aria-label="Range mode"
  value={mode}
  onValueChange={setMode}
  options={[
    { value: "between", label: "Between" },
    { value: "last", label: "Last" },
    { value: "since", label: "Since" },
    { value: "this", label: "This" },
  ]}
/>
```

Trigger 32px, r8, `border-line`, `text-body text-ink-2`, 10×6 chevron in a
20px column. Open: `border-accent`, `bg-accent-subtle`, `text-accent-text`
(the same look as an active FilterPill). Menu: r16, `border-line`,
`shadow-popover`, at least 125px wide; rows 40px, 16px sides,
`text-body-sm`; the picked row `bg-accent-subtle text-accent-text`, the
keyboard-highlighted one `bg-muted` (interim).

## Label

```tsx
<Label htmlFor="preset-name">Preset name</Label>
```

`text-body-sm font-semibold text-ink` (12 / 18 / 600), 8px above its field.
