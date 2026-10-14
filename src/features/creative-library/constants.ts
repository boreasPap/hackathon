import type { FavoriteType, IterationType } from "./types";

export const ITERATION_TABS: {
  type: IterationType;
  slug: string;
  label: string;
  description: string;
}[] = [
  { type: "wallText", slug: "wall-texts", label: "Wall Texts", description: "Hooks and on-screen messaging" },
  { type: "voiceover", slug: "voiceover", label: "Voiceover Scripts", description: "What the avatar says" },
  { type: "similarAvatar", slug: "similar-avatars", label: "Similar Avatars", description: "Similar look, new identity" },
  { type: "avatarVariation", slug: "avatar-variations", label: "Avatar Variations", description: "Same identity, new settings" },
  { type: "music", slug: "music", label: "Music", description: "Energy, mood and sound" },
  { type: "template", slug: "templates", label: "Templates", description: "Layouts and visual concepts" },
];

/** Iterations whose workflow takes only its own input: no context, no direction from the page. */
export const OWN_INPUT_TYPES: ReadonlySet<IterationType> = new Set(["wallText", "avatarVariation", "music"]);

export const TYPE_LABELS: Record<FavoriteType, string> = {
  creative: "Creatives",
  ...(Object.fromEntries(ITERATION_TABS.map((t) => [t.type, t.label])) as Record<IterationType, string>),
};

export function tabBySlug(slug: string | null) {
  return ITERATION_TABS.find((t) => t.slug === slug?.toLowerCase()) ?? ITERATION_TABS[0];
}
