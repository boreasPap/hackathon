# Switch

Spec: design-system.md §8.9. Code: `src/components/design-system/switch.tsx`,
imported from `@/components/design-system`.

```tsx
<Switch checked={on} onCheckedChange={setOn} aria-label="Set preset as my default" />
```

Track 35×19, fully round; on `bg-accent`, off `bg-line`. Knob 16px,
`bg-surface` with `shadow-sm`, 1.5px from the edge (in dark mode the knob is
the dark surface). `role="switch"` with `aria-checked`; give it
an `aria-label` or a visible label. Focus ring 2px `accent-border`, disabled
40% opacity.

`SwitchTrack` (same file) is the visual only; FilterToggle uses it so the
whole pill can be one switch button.
