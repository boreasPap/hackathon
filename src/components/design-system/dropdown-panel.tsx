"use client";

import * as React from "react";
import { Popover } from "radix-ui";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { SearchInput } from "./input";

// DropdownPanel (docs/frontend/components/dropdown-panel.md, design doc §8.3).
// Two looks:
//   "list"      Apps, Channels, Add Metric: 286px, r16, search, 40px rows
//               with 16px sides, full-width Apply.
//   "checklist" Platforms: 244px, r12, a title with the count, 37px checkbox
//               rows, Clear and Apply.
// Picks are a draft until Apply, so a click does not run a query. Opens 8px
// below its trigger; Radix closes it on Esc and on an outside click.

export type DropdownOption = {
  id: string;
  label: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  group?: string;
};

export type DropdownPanelProps = {
  trigger: React.ReactElement;
  options: DropdownOption[];
  value: string[];
  onApply: (ids: string[]) => void;
  variant?: "list" | "checklist";
  multiple?: boolean;
  searchPlaceholder?: string;
  // "list" only: a first row that stands for "no filter" (empty selection).
  allOption?: { label: string; leading?: React.ReactNode };
  // "checklist" only: the header title.
  title?: string;
  // "list" only: "N of M selected" above Apply.
  showCount?: boolean;
  align?: "start" | "end";
};

function matches(option: DropdownOption, query: string) {
  const q = query.trim().toLowerCase();
  return !q || option.label.toLowerCase().includes(q) || option.id.toLowerCase().includes(q);
}

function grouped(options: DropdownOption[]) {
  const groups: { name?: string; options: DropdownOption[] }[] = [];
  for (const option of options) {
    const last = groups[groups.length - 1];
    if (last && last.name === option.group) last.options.push(option);
    else groups.push({ name: option.group, options: [option] });
  }
  return groups;
}

export function DropdownPanel({
  trigger,
  options,
  value,
  onApply,
  variant = "list",
  multiple = true,
  searchPlaceholder,
  allOption,
  title,
  showCount = false,
  align = "start",
}: DropdownPanelProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>(value);
  const [query, setQuery] = React.useState("");

  const onOpenChange = (next: boolean) => {
    if (next) {
      setDraft(value);
      setQuery("");
    }
    setOpen(next);
  };

  const toggle = (id: string) => {
    setDraft((current) => {
      if (!multiple) return current[0] === id ? [] : [id];
      return current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    });
  };

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const visible = options.filter((option) => matches(option, query));

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            // Never taller than the room under (or over) the trigger: the list
            // scrolls and the search and Apply stay on screen.
            "z-50 flex max-h-(--radix-popover-content-available-height) flex-col border border-line bg-surface font-bomstad shadow-popover outline-none",
            variant === "list" ? "w-[286px] rounded-xl py-4" : "w-[244px] rounded-lg",
          )}
        >
          {variant === "list" ? (
            <>
              {searchPlaceholder ? (
                <div className="shrink-0 px-4">
                  <SearchInput
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                  />
                </div>
              ) : null}
              <div
                role="listbox"
                aria-multiselectable={multiple}
                className={cn("max-h-104 min-h-0 overflow-y-auto", searchPlaceholder && "mt-2")}
              >
                {allOption && !query ? (
                  <ListRow
                    selected={draft.length === 0}
                    muted={draft.length > 0}
                    leading={allOption.leading}
                    label={allOption.label}
                    onClick={() => setDraft([])}
                  />
                ) : null}
                {grouped(visible).map((group, i) => (
                  <div key={group.name ?? `group-${i}`} role="group" aria-label={group.name}>
                    {group.name ? (
                      <div className="px-4 pt-2 pb-1 text-body-sm uppercase text-ink-3">{group.name}</div>
                    ) : null}
                    {group.options.map((option) => (
                      <ListRow
                        key={option.id}
                        selected={draft.includes(option.id)}
                        leading={option.leading}
                        trailing={option.trailing}
                        label={option.label}
                        onClick={() => toggle(option.id)}
                      />
                    ))}
                  </div>
                ))}
                {visible.length === 0 ? (
                  <div className="px-4 py-3 text-body-sm text-ink-3">No results</div>
                ) : null}
              </div>
              <div className={cn("shrink-0 px-4", showCount ? "mt-0 border-t border-line pt-2" : "pt-3")}>
                {showCount ? (
                  <div className="mb-3 text-micro text-ink-3">
                    {draft.length} of {options.length} selected
                  </div>
                ) : null}
                <Button size="lg" block onClick={apply}>
                  Apply
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between gap-3 px-3.5 pt-3 pb-2.5">
                <span className="text-overline uppercase text-ink-3">{title}</span>
                <span className={cn("text-caption", draft.length > 0 ? "text-accent-text" : "text-ink-3")}>
                  {draft.length} selected
                </span>
              </div>
              <div role="listbox" aria-multiselectable={multiple} className="flex max-h-80 min-h-0 flex-col gap-0.5 overflow-y-auto px-1.5 pb-1.5">
                {options.map((option) => {
                  const selected = draft.includes(option.id);
                  const id = `dp-${option.id}`;
                  return (
                    <label
                      key={option.id}
                      htmlFor={id}
                      role="option"
                      aria-selected={selected}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.75 rounded-sm px-2.5 py-2.25 text-body text-ink transition-colors",
                        selected ? "bg-accent-subtle" : "hover:bg-page",
                      )}
                    >
                      <Checkbox id={id} checked={selected} onCheckedChange={() => toggle(option.id)} />
                      {option.leading ? (
                        <span className="flex size-4.25 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
                          {option.leading}
                        </span>
                      ) : null}
                      <span className="min-w-0 truncate">{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex shrink-0 items-center justify-between border-t border-line pt-2.5 pr-3 pb-3 pl-3.5">
                <Button variant="ghost" className="-ml-3" onClick={() => setDraft([])}>
                  Clear
                </Button>
                <Button onClick={apply} disabled={draft.length === 0}>
                  Apply
                </Button>
              </div>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ListRow({
  selected,
  muted = false,
  leading,
  trailing,
  label,
  onClick,
}: {
  selected: boolean;
  muted?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex h-10 w-full cursor-pointer items-center gap-1.5 px-4 text-left text-body-sm outline-none transition-colors focus-visible:bg-muted",
        selected ? "bg-accent-subtle text-accent-text" : cn("hover:bg-page", muted ? "text-ink-3" : "text-ink-2"),
      )}
    >
      {leading ? <span className="flex shrink-0 items-center">{leading}</span> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing ? <span className="flex shrink-0 items-center [&_svg:not([class*='size-'])]:size-4">{trailing}</span> : null}
      {selected ? <Check aria-hidden className="ml-0.5 size-3.25 shrink-0" strokeWidth={2.5} /> : null}
    </button>
  );
}
