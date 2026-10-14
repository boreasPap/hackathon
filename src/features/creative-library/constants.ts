import type { Avatar, FavoriteType, IterationType } from "./types";

export const ITERATION_TABS: {
  type: IterationType;
  slug: string;
  label: string;
  description: string;
  /** Example for the direction box, when the default one does not fit. */
  directionHint?: string;
}[] = [
  { type: "wallText", slug: "wall-texts", label: "Wall Texts", description: "Hooks and on-screen messaging" },
  { type: "voiceover", slug: "voiceover", label: "Voiceover Scripts", description: "What the avatar says" },
  { type: "similarAvatar", slug: "similar-avatars", label: "Similar Avatars", description: "Similar look, new identity", directionHint: "e.g. a woman in her 30s, a brighter outdoor setting…" },
  { type: "avatarVariation", slug: "avatar-variations", label: "Avatar Variations", description: "Same identity, new settings" },
  { type: "music", slug: "music", label: "Music", description: "Energy, mood and sound" },
  { type: "template", slug: "templates", label: "Templates", description: "Layouts and visual concepts" },
];

/** Iterations whose workflow takes only its own inputs, not the whole analysis as context. */
export const OWN_INPUT_TYPES: ReadonlySet<IterationType> = new Set([
  "wallText",
  "voiceover",
  "similarAvatar",
  "avatarVariation",
  "music",
]);

/** Iterations whose workflow takes no direction from the page, so the box is hidden. */
export const NO_DIRECTION_TYPES: ReadonlySet<IterationType> = new Set(["wallText", "voiceover", "avatarVariation", "music"]);

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
  return ITERATION_TABS.find((t) => t.slug === slug?.toLowerCase()) ?? ITERATION_TABS[0];
}
