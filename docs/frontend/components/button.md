# Button, IconButton

Spec: design-system.md §8.8. Code: `src/components/design-system/button.tsx`,
imported from `@/components/design-system`.

## Button

```tsx
<Button>Apply</Button>                                  // primary, md
<Button size="lg" block>Apply</Button>                  // full-width dropdown footer
<Button variant="secondary"><Plus />Add Metric</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="link">Delete All</Button>
<Button asChild><Link href="…">Open</Link></Button>    // renders the child element
```

| Variant | Look | Size |
|---|---|---|
| `primary` (default) | `bg-accent`, `text-accent-contrast`, `text-body`; hover `bg-accent-hover`, pressed `bg-accent-active` | `md` 32px, r8, px 12 · `lg` 40px, r16, px 12 |
| `secondary` | transparent, `border-line-strong`, `text-ink-2`, `text-body-sm`, icon 12px, gap 6; hover `bg-muted` | 30px, r8, px 10 |
| `ghost` | `text-ink-2`, `text-body`; hover `bg-muted` + `text-ink` | `md` 32px · `lg` 40px, r8, px 12 |
| `link` | `text-accent-text`, `text-body-sm`, no padding; hover underline | text height |

`block` makes it full width. `type` defaults to `"button"` so a button in a
form never submits by accident; pass `type="submit"` when it should.

All variants: focus ring 2px `accent-border` (interim). Disabled: the primary
is designed (grey fill, grey text) and uses `bg-line text-ink-3`; the other
variants keep the interim 40% opacity. Labels are `font-bomstad`, so a digit in a
label ("Last 7 Days") stays in Bomstad.

## IconButton

```tsx
<IconButton aria-label="Collapse sidebar"><PanelLeft /></IconButton>      // md 28px, r10
<IconButton size="sm" bordered aria-label="Theme"><Moon /></IconButton>   // sm 24px, r8, border
<IconButton tone="danger" aria-label="Delete row"><Trash2 /></IconButton>
```

`aria-label` is required. `tone="danger"` stays calm (`text-ink-3`) and turns
`text-danger` on `bg-danger-bg` only on hover; the caller
shows the confirmation.

## Rules

1. One primary action per page or panel; everything else is secondary,
   ghost or link.
2. Do not restyle a variant with color classes at the call site. If a new look
   is needed, it is a new variant here and in this doc.
