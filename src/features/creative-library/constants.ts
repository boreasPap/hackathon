import type { Avatar, FavoriteType, IterationType } from "./types";

export const ITERATION_TABS: {
  type: IterationType;
  slug: string;
  label: string;
  description: string;
  /** Example for the direction box, when the default one does not fit. */
  directionHint?: string;
}[] = [
  { type: "wallText", slug: "wall-texts", label: "Wall Texts", description: "Hooks & on-screen messaging" },
  { type: "voiceover", slug: "voiceover-scripts", label: "Voiceover Scripts", description: "Narratives, angles & winner mixes" },
  { type: "similarAvatar", slug: "similar-avatars", label: "Similar Avatars", description: "Similar aesthetics. New identities.", directionHint: "e.g. a woman in her 30s, a brighter outdoor setting…" },
  { type: "avatarVariation", slug: "avatar-variations", label: "Avatar Variations", description: "Same identity. New settings." },
  { type: "music", slug: "music", label: "Music", description: "Energy, mood & sound" },
  { type: "template", slug: "templates", label: "Templates", description: "Layouts, styles & visual concepts" },
];

/** Iterations whose workflow takes only its own inputs, not the whole analysis as context. */
export const OWN_INPUT_TYPES: ReadonlySet<IterationType> = new Set([
  "wallText",
  "voiceover",
  "similarAvatar",
  "avatarVariation",
  "music",
  "template",
]);

/** Iterations whose workflow takes no direction from the page, so the box is hidden. */
export const NO_DIRECTION_TYPES: ReadonlySet<IterationType> = new Set(["wallText", "voiceover", "avatarVariation", "music", "template"]);

/** Iterations whose workflow reads the video itself, so they need no analysis first. */
export const VIDEO_ONLY_TYPES: ReadonlySet<IterationType> = new Set(["template"]);

export const AVATAR_TYPES: ReadonlySet<IterationType> = new Set(["similarAvatar", "avatarVariation"]);

/** The avatar frames a generation can start from, best first. The first one is the default. */
export function avatarFrames(avatar: Avatar | null | undefined): string[] {
  const urls = avatar?.candidates?.map((c) => c.url) ?? [];
  return urls.length ? urls : avatar?.imageUrl ? [avatar.imageUrl] : [];
}

export const TYPE_LABELS: Record<FavoriteType, string> = {
  creative: "Creatives",
  ...(Object.fromEntries(ITERATION_TABS.map((t) => [t.type, t.label])) as Record<IterationType, string>),
};

export function tabBySlug(slug: string | null) {
  return ITERATION_TABS.find((t) => t.slug === slug?.toLowerCase());
}

/** The tab of an iteration type; every type has one. */
export const tabOf = (type: IterationType) => ITERATION_TABS.find((t) => t.type === type)!;
