import { parseLooseJson } from "@/features/creative-library/server/loose-json";
import {
  type CaptionItem,
  normalizeWords,
  reclassifyWallText,
  spokenCoverage,
  type WallTextItem,
} from "@/features/creative-library/server/wall-text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called by the `finalize` http step, the last step of the v2 analyzer
// workflow. Merges the LLM steps' answers into one JSON and settles wall text
// vs caption with fixed rules instead of trusting a single LLM:
//   1. wall_text_timeline (reads the HD frames) proposes wall texts and captions.
//   2. Each wall text must also appear in `visual` (reads the sprite sheet).
//      Unseen → made up, dropped. Seen only as a caption and short → caption.
//   3. Short text the voiceover reads out → caption (see wall-text.ts).
// The workflow stops on any non-2xx, so missing or broken fields count as
// empty and never fail the request. Set EACHLABS_PARSE_SECRET to require
// `Authorization: Bearer <secret>`.

type VisualText = { start: number; end: number; text: string; type?: string; position?: string; style?: string };
type Visual = { wall_text?: VisualText[]; end_card?: { present?: boolean; start?: number }; duration_seconds?: number };
type Timeline = { has_wall_text?: boolean; wall_text?: WallTextItem[]; captions?: CaptionItem[] };
type VoLine = { start: number | null; end: number | null; speaker?: string; text: string };
type Vo = { language?: string; full_script?: string; lines?: VoLine[] };
type Ranking = { index: number; second: number; url: string; score: number; notes?: string };
type AvatarPick = { best_index?: number; best_second?: number; best_url?: string; reason?: string; ranking?: Ranking[] };

/** Below this many seconds, a text that is not persistent counts as short. */
const SHORT_SECONDS = 3;
/** How much of a text must match for both LLMs to have seen the same one. */
const MATCH_COVERAGE = 0.7;
/** How much of a caption must be in a voiceover line to give the line its timing. */
const LINE_COVERAGE = 0.6;

/** The items of a list that have text; anything else is dropped. */
function withText<T extends { text: string }>(value: unknown): T[] {
  return Array.isArray(value)
    ? value.filter((v): v is T => !!v && typeof v === "object" && typeof (v as { text?: unknown }).text === "string")
    : [];
}

function sameText(a: string, b: string): boolean {
  return normalizeWords(a).join(" ") === normalizeWords(b).join(" ");
}

function finalize(body: Record<string, unknown>) {
  const visual = parseLooseJson<Visual>(body.visual);
  const timeline = parseLooseJson<Timeline>(body.wall_text);
  const vo = parseLooseJson<Vo>(body.vo_script);
  const pick = parseLooseJson<AvatarPick>(body.avatar_pick);
  const candidates = (Array.isArray(body.avatar_candidates) ? body.avatar_candidates : []).filter(
    (u): u is string => typeof u === "string" && u.length > 0,
  );
  const voLines = withText<VoLine>(vo.lines);
  const script = typeof vo.full_script === "string" ? vo.full_script : voLines.map((l) => l.text).join(" ");

  // Layer 2: both LLMs must have seen it. A match is the same text, or 70% of
  // the words in a row ("SEE STYLES" does not match "TRY STYLES YOU'D").
  const visualItems = withText<VisualText>(visual.wall_text);
  const matchVisual = (text: string) =>
    visualItems.filter(
      (v) =>
        sameText(v.text, text) ||
        spokenCoverage(text, v.text) >= MATCH_COVERAGE ||
        spokenCoverage(v.text, text) >= MATCH_COVERAGE,
    );

  const demoted: CaptionItem[] = [];
  const unconfirmed: string[] = [];
  const timelineWall = withText<WallTextItem>(timeline.wall_text).filter((w) => {
    const seen = matchVisual(w.text);
    if (seen.length === 0) {
      unconfirmed.push(w.text);
      return false;
    }
    const short = !w.persistent && (w.end ?? 0) - (w.start ?? 0) < SHORT_SECONDS;
    if (short && seen.every((v) => v.type !== "wall_text")) {
      demoted.push({ text: w.text, start: w.start, end: w.end });
      return false;
    }
    return true;
  });

  let captions: CaptionItem[] = [...withText<CaptionItem>(timeline.captions), ...demoted];
  if (captions.length === 0) {
    captions = visualItems
      .filter((v) => v.type !== "wall_text")
      .map((v) => ({ text: v.text, start: v.start, end: v.end }));
  }

  // Layer 3: the voiceover check.
  const checked = reclassifyWallText(
    { has_wall_text: timelineWall.length > 0, wall_text: timelineWall, captions, all_wall_text: "" },
    script,
  );

  // Voiceover lines without timing take it from the captions that read them.
  const lines: VoLine[] = voLines.map((line) => {
    if (typeof line.start === "number" && typeof line.end === "number") return line;
    const matched = checked.captions.filter((c) => spokenCoverage(c.text, line.text) >= LINE_COVERAGE);
    if (!matched.length) return line;
    return {
      ...line,
      start: Math.min(...matched.map((c) => c.start)),
      end: Math.max(...matched.map((c) => c.end)),
    };
  });

  // The model may misspell the URL it picked; fall back to its index.
  let bestUrl = typeof pick.best_url === "string" && pick.best_url ? pick.best_url : null;
  let bestIndex = typeof pick.best_index === "number" ? pick.best_index : null;
  if (!bestUrl || (candidates.length && !candidates.includes(bestUrl))) {
    bestUrl = candidates[(bestIndex ?? 1) - 1] ?? candidates[0] ?? null;
    bestIndex = bestUrl ? candidates.indexOf(bestUrl) + 1 : null;
  }

  return {
    text: {
      has_wall_text: checked.has_wall_text,
      wall_text: checked.wall_text,
      all_wall_text: checked.all_wall_text,
      captions: checked.captions,
      demoted_to_captions: [...demoted.map((d) => d.text), ...(checked.moved_to_captions ?? [])],
      dropped_unconfirmed: unconfirmed,
      variation_input: checked.has_wall_text ? checked.all_wall_text : script,
      variation_source: checked.has_wall_text ? "wall_text" : "voiceover",
    },
    voiceover: { language: vo.language ?? null, full_script: script, lines },
    avatar: {
      best_url: bestUrl,
      best_index: bestIndex,
      best_second: pick.best_second ?? null,
      reason: pick.reason ?? null,
      ranking: Array.isArray(pick.ranking) ? pick.ranking : [],
      candidates,
    },
    end_card: visual.end_card ?? null,
    duration_seconds: visual.duration_seconds ?? null,
  };
}

export async function POST(request: Request) {
  const secret = process.env.EACHLABS_PARSE_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fields = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  return Response.json(finalize(fields));
}
