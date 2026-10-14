// Moves "wall texts" that are really captions to the caption list. An item is
// a caption when its words are read out in the voiceover (>= 90% of them, in
// a row) AND it is on screen only briefly. A hook that stays on screen is
// still a wall text, even when the voiceover reads it.

export type WallTextItem = {
  text: string;
  start: number;
  end: number;
  persistent?: boolean;
  position?: string;
  style?: string;
};

export type CaptionItem = { text: string; start: number; end: number };

export type WallTextResult = {
  has_wall_text: boolean;
  wall_text: WallTextItem[];
  captions: CaptionItem[];
  all_wall_text: string;
  moved_to_captions?: string[];
};

const PERSIST_SECONDS = 3;
const MIN_COVERAGE = 0.9;

/** Lowercase words without accents, punctuation, apostrophes or emoji: "YOU'D" → "youd". */
export function normalizeWords(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** The share (0–1) of `text`'s words found in `script` as the longest run in a row. */
export function spokenCoverage(text: string, script: string): number {
  const t = normalizeWords(text);
  const s = normalizeWords(script);
  if (t.length === 0 || s.length === 0) return 0;
  let best = 0;
  for (let i = 0; i < s.length; i++) {
    let k = 0;
    for (let j = 0; j < t.length && i + k < s.length; j++) {
      if (s[i + k] === t[j]) k++;
      else if (k > 0) break;
    }
    best = Math.max(best, k);
    if (best === t.length) break;
  }
  return best / t.length;
}

export function reclassifyWallText(result: WallTextResult, voiceoverScript: string): WallTextResult {
  const keep: WallTextItem[] = [];
  const captions: CaptionItem[] = [...(result.captions ?? [])];
  const moved: string[] = [];

  for (const item of result.wall_text ?? []) {
    const duration = (item.end ?? 0) - (item.start ?? 0);
    const isLong = item.persistent === true || duration >= PERSIST_SECONDS;
    const spoken = spokenCoverage(item.text, voiceoverScript) >= MIN_COVERAGE;
    if (spoken && !isLong) {
      captions.push({ text: item.text, start: item.start, end: item.end });
      moved.push(item.text);
    } else {
      keep.push(item);
    }
  }

  captions.sort((a, b) => a.start - b.start);
  return {
    has_wall_text: keep.length > 0,
    wall_text: keep,
    captions,
    all_wall_text: [...new Set(keep.map((w) => w.text))].join("\n"),
    moved_to_captions: moved,
  };
}
