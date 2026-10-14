export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ParseTimesResult = {
  avatar_second: number;
  text_second_1: number;
  text_second_2: number;
  avatar_present: boolean;
  parsed_ok: boolean;
};

function parseVisual(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  const candidates = [cleaned];
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) candidates.push(cleaned.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      const value: unknown = JSON.parse(candidate);
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
      }
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

function extractTimes(visual: unknown): ParseTimesResult {
  const parsed = typeof visual === "string" ? parseVisual(visual) : null;
  const avatar =
    parsed?.avatar && typeof parsed.avatar === "object" ? (parsed.avatar as Record<string, unknown>) : null;
  const textTimes: unknown[] = Array.isArray(parsed?.text_heavy_timestamps) ? parsed.text_heavy_timestamps : [];

  const avatar_second = toSecond(avatar?.best_timestamp) ?? 0;
  const text_second_1 = toSecond(textTimes[0]) ?? avatar_second;
  const text_second_2 = toSecond(textTimes[1]) ?? text_second_1;

  return {
    avatar_second,
    text_second_1,
    text_second_2,
    avatar_present: avatar?.present === true,
    parsed_ok: parsed !== null,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const visual = body && typeof body === "object" ? (body as { visual?: unknown }).visual : undefined;
  return Response.json(extractTimes(visual));
}
