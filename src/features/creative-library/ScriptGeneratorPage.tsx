"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/design-system";
import { cn } from "@/lib/utils";
import { HAIR_APP } from "./apps";
import { ScriptGenerator } from "./Generators";
import { Breadcrumbs } from "./parts";
import { HOME_PATH, appHref, categoryHref } from "./paths";
import { APP_NAME, CATEGORIES, type ScriptKind, getCategory } from "./sample-data";

export function ScriptGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category")?.toLowerCase();
  const kind: ScriptKind = params.get("type") === "voiceover-scripts" ? "voiceover-scripts" : "wall-texts";
  const picked = getCategory(category ?? "");
  // The picked category first, so the generator opens on it; the others stay selectable.
  const categories = picked
    ? [picked.id, ...CATEGORIES.map((c) => c.id).filter((id) => id !== picked.id)]
    : CATEGORIES.map((c) => c.id);

  const setParam = (key: string, value: string) => {
    const qs = new URLSearchParams(params);
    qs.set(key, value);
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div className="flex flex-col gap-3">
        <Breadcrumbs
          items={[
            { label: "Home", href: HOME_PATH },
            { label: APP_NAME, href: appHref(HAIR_APP) },
            ...(picked ? [{ label: picked.name, href: categoryHref(HAIR_APP, picked.id) }] : []),
            { label: "Script Generator" },
          ]}
        />
        <PageHeader
          title="Script Generator"
          description="Generate hooks and voiceover scripts for your next creative."
          actions={
            <KindToggle value={kind} onChange={(next) => setParam("type", next)} />
          }
        />
      </div>
      <ScriptGenerator categories={categories} full kind={kind} onCategoryChange={(next) => setParam("category", next)} />
    </div>
  );
}

const KINDS: { value: ScriptKind; label: string }[] = [
  { value: "wall-texts", label: "Wall Text" },
  { value: "voiceover-scripts", label: "Voiceover Script" },
];

/** Two-way switch whose picked side is filled with the accent, so the choice reads at a glance. */
function KindToggle({ value, onChange }: { value: ScriptKind; onChange: (v: ScriptKind) => void }) {
  return (
    <div role="radiogroup" aria-label="Script type" className="flex h-9 items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
      {KINDS.map((k) => {
        const on = k.value === value;
        return (
          <button
            key={k.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(k.value)}
            className={cn(
              "h-full rounded-md px-3.5 font-bomstad text-body transition-colors focus-visible:ring-2 focus-visible:ring-accent-border focus-visible:outline-none",
              on ? "bg-accent font-semibold text-accent-contrast shadow-sm" : "text-ink-3 hover:bg-muted hover:text-ink",
            )}
          >
            {k.label}
          </button>
        );
      })}
    </div>
  );
}
