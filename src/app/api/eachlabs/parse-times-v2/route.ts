export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called by the `parse_times` http step of the v2 analyzer workflow. Turns the
// `visual` step's text into whole seconds, which the frame-screenshot model
// needs for `frame_at_second`. Set EACHLABS_PARSE_SECRET to require
// `Authorization: Bearer <secret>`.

const AVATAR_FRAMES = 4;
const TEXT_FRAMES = 3;

type ParseTimesV2Result = {
  /** Avatar candidate frames, best first. */
  avatar_second_1: number;
  avatar_second_2: number;
  avatar_second_3: number;
  avatar_second_4: number;
  /** Text-heavy frames. */
  text_second_1: number;
  text_second_2: number;
  text_second_3: number;
  /** Same as avatar_second_1, for workflows built on v1. */
  avatar_second: number;
  avatar_present: boolean;
  end_card_start: number | null;
  duration_seconds: number | null;
  parsed_ok: boolean;
};

type Loose = Record<string, unknown>;

function isRecord(value: unknown): value is Loose {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseVisual(visual: unknown): Loose | null {
  if (isRecord(visual)) return visual;
  if (typeof visual !== "string") return null;

  const cleaned = visual.replace(/```(?:json)?/gi, "").trim();
  const candidates = [cleaned];
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) candidates.push(cleaned.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      const value: unknown = JSON.parse(candidate);
      if (isRecord(value)) return value;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

function toSecond(value: unknown): number | null {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

/** The first `count` distinct seconds before `limit`, padded with the last one (or `fallback`). */
function pickSeconds(values: unknown[], count: number, limit: number | null, fallback: number): number[] {
  const seconds: number[] = [];
  for (const value of values) {
    const n = toSecond(value);
    if (n === null || (limit !== null && n >= limit) || seconds.includes(n)) continue;
    seconds.push(n);
    if (seconds.length === count) break;
  }
  if (!seconds.length) seconds.push(fallback);
  while (seconds.length < count) seconds.push(seconds[seconds.length - 1]);
  return seconds;
}

function extractTimes(visual: unknown): ParseTimesV2Result {
  const parsed = parseVisual(visual);
  const avatar = isRecord(parsed?.avatar) ? parsed.avatar : null;
  const endCard = isRecord(parsed?.end_card) ? parsed.end_card : null;

  // A frame must come before the end card and inside the video.
  const end_card_start = endCard?.present === true ? toSecond(endCard.start) : null;
  const duration_seconds = toSecond(parsed?.duration_seconds);
  const limits = [end_card_start, duration_seconds].filter((s): s is number => s !== null && s > 0);
  const limit = limits.length ? Math.min(...limits) : null;

  const avatarTimes = [...(Array.isArray(avatar?.candidates) ? avatar.candidates : []), avatar?.best_timestamp];
  const avatarSeconds = pickSeconds(avatarTimes, AVATAR_FRAMES, limit, 0);

  const textTimes: unknown[] = Array.isArray(parsed?.text_heavy_timestamps) ? parsed.text_heavy_timestamps : [];
  const textSeconds = pickSeconds(textTimes, TEXT_FRAMES, limit, avatarSeconds[0]);

  return {
    avatar_second_1: avatarSeconds[0],
    avatar_second_2: avatarSeconds[1],
    avatar_second_3: avatarSeconds[2],
    avatar_second_4: avatarSeconds[3],
    text_second_1: textSeconds[0],
    text_second_2: textSeconds[1],
    text_second_3: textSeconds[2],
    avatar_second: avatarSeconds[0],
    avatar_present: avatar?.present === true,
    end_card_start,
    duration_seconds,
    parsed_ok: parsed !== null && Object.keys(parsed).length > 0,
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

  const visual = isRecord(body) ? body.visual : undefined;
  return Response.json(extractTimes(visual));
}
