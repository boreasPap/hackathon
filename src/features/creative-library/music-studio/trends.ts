// Sample weekly trending sounds. Previews are the in-browser demo tracks.

export type TrendingSound = {
  id: string;
  title: string;
  artist: string;
  uses: number;
  rank: number;
  /** Last week's rank; null when the sound is new on the chart. */
  previousRank: number | null;
};

export const TREND_WEEK = { from: "2026-10-05", to: "2026-10-11" };

export const TRENDING_SOUNDS: TrendingSound[] = [
  { id: "golden-hour-glow", title: "Golden Hour Glow", artist: "Lumi Beats", uses: 2_400_000, rank: 1, previousRank: 3 },
  { id: "salon-talk", title: "Salon Talk (Sped Up)", artist: "Kiko", uses: 1_900_000, rank: 2, previousRank: 1 },
  { id: "mirror-mirror", title: "Mirror Mirror", artist: "Nova Lane", uses: 1_600_000, rank: 3, previousRank: 7 },
  { id: "fresh-cut-bounce", title: "Fresh Cut Bounce", artist: "DJ Fade", uses: 1_300_000, rank: 4, previousRank: null },
  { id: "soft-glam", title: "Soft Glam", artist: "Aria Moon", uses: 1_100_000, rank: 5, previousRank: 4 },
  { id: "main-character", title: "Main Character", artist: "The Loops", uses: 980_000, rank: 6, previousRank: 9 },
  { id: "glow-up-montage", title: "Glow Up Montage", artist: "Velvet Kid", uses: 870_000, rank: 7, previousRank: 5 },
  { id: "bob-era", title: "Bob Era", artist: "Mira", uses: 760_000, rank: 8, previousRank: null },
  { id: "before-after", title: "Before After", artist: "Sunny Days", uses: 640_000, rank: 9, previousRank: 6 },
  { id: "late-night-fringe", title: "Late Night Fringe", artist: "Lo Club", uses: 520_000, rank: 10, previousRank: 8 },
  { id: "color-pop", title: "Color Pop", artist: "Pastel", uses: 410_000, rank: 11, previousRank: 15 },
  { id: "old-money-waves", title: "Old Money Waves", artist: "Gatsby Bros", uses: 330_000, rank: 12, previousRank: 10 },
];

export type TrendFilter = "all" | "rising" | "falling" | "new";

export const movementOf = (s: TrendingSound) => (s.previousRank === null ? null : s.previousRank - s.rank);

export function filterTrends(filter: TrendFilter) {
  return TRENDING_SOUNDS.filter((s) => {
    const m = movementOf(s);
    if (filter === "rising") return m !== null && m > 0;
    if (filter === "falling") return m !== null && m < 0;
    if (filter === "new") return m === null;
    return true;
  });
}
