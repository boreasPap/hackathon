"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { IconButton, Select } from "@/components/design-system";
import { cn } from "@/lib/utils";
import { SoundVisualizer } from "./SoundVisualizer";
import { MusicStudio, type SampleVideo } from "./music-studio/MusicStudio";
import { CopyTextButton, SampleFavoriteButton, TYPE_ICONS } from "./parts";
import { BASE_PATH } from "./paths";
import {
  CATEGORIES,
  EXAMPLE_VERSIONS,
  type CategoryId,
  type ScriptKind,
  exampleIteration,
  getCategory,
  getScriptExample,
  getScriptExamples,
  getTextIterations,
  sampleAnchor,
} from "./sample-data";

// Script and music generators for a category. Generation is simulated: the
// results are the prepared category suggestions, until a model is connected.

const AUTOPLAY_MS = 3000;

function Block({
  icon: Icon,
  title,
  description,
  aside,
  href,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  aside?: React.ReactNode;
  /** Clicking the block's empty space opens this page; its controls keep their own clicks. */
  href?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const open = (e: React.MouseEvent<HTMLElement>) => {
    if (!href || window.getSelection()?.toString()) return;
    if ((e.target as HTMLElement).closest("a, button, input, select, textarea, label, audio, [role=slider], [role=radio]")) return;
    router.push(href);
  };
  return (
    <section
      onClick={href ? open : undefined}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-2xl border border-accent-border bg-accent-subtle p-4 md:p-5",
        href && "cursor-pointer transition-colors hover:border-accent",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-contrast">
          <Icon className="size-4.5" />
        </span>
        {/* Title on the tile's top edge, description on its bottom edge. */}
        <div className="flex h-9 flex-col justify-between">
          <h2 className="flex items-center gap-2 text-page-desc leading-5 font-semibold text-ink">
            {title}
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-micro font-semibold text-accent-contrast">
              <Sparkles className="size-3" />
              AI
            </span>
          </h2>
          <p className="text-caption leading-none text-ink-3 opacity-75">{description}</p>
        </div>
        {aside ? <div className="ml-auto shrink-0 self-end">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

function CategoryPicker({ value, onChange }: { value: CategoryId; onChange: (c: CategoryId) => void }) {
  return (
    <Select
      aria-label="Category"
      value={value}
      onValueChange={onChange}
      options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
      // Only the label takes the theme accent; the box stays the standard select.
      className="font-semibold text-accent-active"
    />
  );
}

// Position of a card relative to the active one, wrapped around the deck.
function offsetOf(index: number, active: number, count: number) {
  let d = index - active;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

/**
 * Cover-flow deck: the active card in front, its neighbours smaller and faded
 * behind it. It moves on by itself; hovering it or playing audio in it holds it.
 */
function CoverDeck({
  count,
  active,
  onActive,
  height,
  label,
  renderCard,
  footer,
  flash = false,
}: {
  count: number;
  active: number;
  onActive: (index: number) => void;
  height: string;
  label: string;
  renderCard: (index: number, center: boolean) => React.ReactNode;
  /** Shown at the right end of the dots row, sharing its baseline. */
  footer?: React.ReactNode;
  flash?: boolean;
}) {
  const go = (i: number) => onActive(((i % count) + count) % count);
  const [hover, setHover] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (hover || playing) return;
    const id = window.setTimeout(() => onActive((active + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [active, hover, playing, count, onActive]);

  return (
    <div
      className="flex flex-col gap-2"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPlayCapture={() => setPlaying(true)}
      onPauseCapture={() => setPlaying(false)}
      onEndedCapture={() => setPlaying(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]",
          height,
        )}
      >
        {Array.from({ length: count }, (_, i) => {
          const offset = offsetOf(i, active, count);
          const visible = Math.abs(offset) <= 2;
          const center = offset === 0;
          const scale = [1, 0.9, 0.8][Math.abs(offset)] ?? 0.7;
          return (
            <div
              key={i}
              aria-hidden={!visible}
              onClick={center ? undefined : () => go(i)}
              style={{
                transform: `translateX(calc(-50% + ${offset * 70}%)) scale(${visible ? scale : 0.6})`,
                zIndex: 10 - Math.abs(offset),
                opacity: visible ? [1, 0.45, 0.15][Math.abs(offset)] : 0,
                filter: center ? undefined : "blur(0.5px)",
              }}
              className={cn(
                "group/card absolute top-0 left-1/2 flex h-full w-[58%] max-w-xs flex-col gap-1 rounded-xl border bg-surface px-3 py-2 transition-all duration-500 ease-out",
                center ? "border-accent-border shadow-sm" : "cursor-pointer border-transparent [&_*]:pointer-events-none",
                "has-[[data-playing=true]]:animate-[al-glow_1.6s_ease-in-out_infinite]",
                center && flash && "ring-2 ring-accent",
                !visible && "pointer-events-none",
              )}
            >
              {renderCard(i, center)}
            </div>
          );
        })}
        <button
          type="button"
          aria-label="Previous suggestion"
          onClick={() => go(active - 1)}
          className="absolute top-1/2 left-1 z-20 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next suggestion"
          onClick={() => go(active + 1)}
          className="absolute top-1/2 right-1 z-20 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink-3 transition-colors hover:bg-surface hover:text-ink"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end">
        <span />
        <div className="flex h-5 items-end justify-center gap-1.5 pb-[3px]">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show suggestion ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === active ? "w-4 bg-accent" : "w-1 bg-line-strong hover:bg-ink-3",
              )}
            />
          ))}
        </div>
        <div className="flex justify-end">{footer}</div>
      </div>
    </div>
  );
}

function OpenLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-5 items-end gap-0.5 font-bomstad text-body-sm leading-none font-semibold text-accent-active hover:underline"
    >
      Open
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}

function CardLabel({
  index,
  label,
  actions,
  lead,
}: {
  index: number;
  label: string;
  actions?: React.ReactNode;
  lead?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5 truncate text-overline text-ink-3 uppercase">
        {lead}
        {String(index + 1).padStart(2, "0")} · {label}
      </span>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}

export const SCRIPT_GENERATOR_PATH = `${BASE_PATH}/script-generator`;
export const MUSIC_GENERATOR_PATH = `${BASE_PATH}/music-generator`;

/** One themed example; refresh swaps in the theme's next version. */
function ExampleCard({
  category,
  kind,
  index,
}: {
  category: CategoryId;
  kind: ScriptKind;
  index: number;
}) {
  const [version, setVersion] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const ex = getScriptExample(category, kind, index, version);

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3">
      <CardLabel
        index={index}
        label={ex.theme}
        actions={
          <>
            <IconButton
              size="sm"
              aria-label="Refresh suggestion"
              title="Show another version"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                window.setTimeout(() => {
                  setVersion((v) => (v + 1) % EXAMPLE_VERSIONS);
                  setBusy(false);
                }, 450);
              }}
            >
              <RefreshCw className={cn("size-3.5", busy && "animate-spin")} />
            </IconButton>
            <CopyTextButton text={ex.text} />
            <SampleFavoriteButton creativeId={sampleAnchor(category)} kind={kind} iteration={exampleIteration(index, version)} className="size-7" />
          </>
        }
      />
      <p key={version} className={cn("font-prose text-body text-ink transition-opacity duration-300", busy && "opacity-30")}>
        {ex.text}
      </p>
    </article>
  );
}

export function ScriptGenerator({
  categories,
  full = false,
  kind: controlledKind,
  onCategoryChange,
}: {
  categories: CategoryId[];
  full?: boolean;
  /** Set by the generator page, which owns the Wall Text / Voiceover Script switch. */
  kind?: ScriptKind;
  /** Lets the page follow the picked category (its breadcrumb and URL). */
  onCategoryChange?: (category: CategoryId) => void;
}) {
  const [category, setCategoryState] = React.useState(categories[0]);
  const setCategory = (next: CategoryId) => {
    setCategoryState(next);
    onCategoryChange?.(next);
  };
  const kind = controlledKind ?? "wall-texts";
  const [angle, setAngle] = React.useState(0);
  const items = getTextIterations(category, kind);

  if (full) {
    const examples = getScriptExamples(category, kind);
    return (
      <Block
        icon={TYPE_ICONS.voiceover}
        title="Script Generator"
        description={`${examples.length} themed ${kind === "wall-texts" ? "wall texts" : "voiceover scripts"} for ${getCategory(category)?.name}.`}
        // Bottom edge of the picker on the description's bottom edge.
        aside={
          categories.length > 1 ? (
            <CategoryPicker value={category} onChange={setCategory} />
          ) : undefined
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {examples.map((ex, i) => (
            <ExampleCard key={`${category}-${kind}-${ex.theme}`} category={category} kind={kind} index={i} />
          ))}
        </div>
      </Block>
    );
  }

  return (
    <Block
      icon={TYPE_ICONS.voiceover}
      title="Script Generator"
      description="Hooks and voiceover scripts for your next creative."
      href={`${SCRIPT_GENERATOR_PATH}?category=${category}&type=${kind}`}
    >
      <div className="mt-2 pb-[3px]">
        <CoverDeck
          label="AI suggested texts"
          count={items.length}
          active={angle}
          onActive={setAngle}
          height={kind === "wall-texts" ? "h-24" : "h-36"}
          footer={<OpenLink href={`${SCRIPT_GENERATOR_PATH}?category=${category}&type=${kind}`} />}
          renderCard={(i, center) => (
            <>
              <CardLabel
                index={i}
                label={items[i].angle}
                actions={
                  center ? (
                    <>
                      <CopyTextButton text={items[i].text} />
                      <SampleFavoriteButton creativeId={sampleAnchor(category)} kind={kind} iteration={i + 1} className="size-7" />
                    </>
                  ) : undefined
                }
              />
              {/* Short lines sit in the middle of the space under the label. */}
              <div className="flex min-h-0 flex-1 items-center">
                <p className={cn("font-prose text-body-sm text-ink", kind === "wall-texts" ? "line-clamp-3" : "line-clamp-5")}>
                  {items[i].text}
                </p>
              </div>
            </>
          )}
        />
      </div>
    </Block>
  );
}

/** Same shape as the script generator: compact deck + Open, or the full page with controls. */
export function MusicGenerator({
  categories,
  full = false,
  videos = [],
}: {
  categories: CategoryId[];
  full?: boolean;
  /** Library videos the studio can match a sound to when nothing is uploaded. */
  videos?: SampleVideo[];
}) {
  if (full) {
    return (
      <Block icon={TYPE_ICONS.music} title="Music Generator" description="Trending sounds and sounds matched to your videos.">
        <MusicStudio videos={videos} />
      </Block>
    );
  }
  return <MusicGeneratorCompact categories={categories} />;
}

function MusicGeneratorCompact({ categories }: { categories: CategoryId[] }) {
  const category = categories[0];
  return (
    <Block
      icon={TYPE_ICONS.music}
      title="Music Generator"
      description="15-second music directions to try under your creative."
      href={`${MUSIC_GENERATOR_PATH}?category=${category}`}
    >
      <div className="mt-2 flex flex-col gap-2 pb-[3px]">
        <SoundVisualizer seed={sampleAnchor(category)} label="music preview" />
        <div className="flex h-5 items-end justify-end">
          <OpenLink href={`${MUSIC_GENERATOR_PATH}?category=${category}`} />
        </div>
      </div>
    </Block>
  );
}

export function Generators({ categories }: { categories: CategoryId[] }) {
  if (!categories.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ScriptGenerator key={`script-${categories.join()}`} categories={categories} />
      <MusicGenerator key={`music-${categories.join()}`} categories={categories} />
    </div>
  );
}
