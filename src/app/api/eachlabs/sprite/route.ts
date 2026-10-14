import { randomUUID } from "node:crypto";
import {
  createSprite,
  DEFAULT_OPTIONS,
  SpriteError,
  type SpriteOptions,
} from "@/features/creative-library/server/sprite";
import { uploadPublic } from "@/features/creative-library/server/sprite-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called by the `sprites` http step of the v2 analyzer workflow, in place of
// eachlabs' `hover-preview-sprites` model: builds a labelled grid of frames
// from the video, uploads it and answers with the same field names ("sheet",
// "vtt"). Set EACHLABS_PARSE_SECRET to require `Authorization: Bearer <secret>`.

function intIn(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

/** SSRF guard: http(s) only, no local or private hosts; SPRITE_ALLOWED_HOSTS narrows it further. */
function checkUrl(raw: unknown): URL {
  if (typeof raw !== "string" || !raw) throw new SpriteError("`video` alanı zorunlu (video URL'si)", 400);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new SpriteError("`video` geçerli bir URL değil", 400);
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new SpriteError("Sadece http/https URL'leri kabul edilir", 400);
  const host = url.hostname.toLowerCase();
  const isPrivate =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "::1" ||
    host.startsWith("[");
  if (isPrivate && process.env.SPRITE_ALLOW_PRIVATE_HOSTS !== "1") {
    throw new SpriteError("Yerel/özel ağ adreslerine izin verilmiyor", 400);
  }
  const allowed = (process.env.SPRITE_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length && !allowed.some((h) => host === h || host.endsWith(`.${h}`))) {
    throw new SpriteError(`Bu host izinli değil: ${host}`, 403);
  }
  return url;
}

export async function POST(request: Request) {
  const secret = process.env.EACHLABS_PARSE_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "invalid json body" }, { status: 400 });
  }

  try {
    const url = checkUrl(body.video);
    const opts: SpriteOptions = {
      ...DEFAULT_OPTIONS,
      columns: intIn(body.columns, 1, 12, DEFAULT_OPTIONS.columns),
      rows: intIn(body.rows, 1, 12, DEFAULT_OPTIONS.rows),
      intervalSeconds: intIn(body.interval_seconds, 1, 60, DEFAULT_OPTIONS.intervalSeconds),
      cellWidth: intIn(body.cell_width, 120, 640, DEFAULT_OPTIONS.cellWidth),
      labels: body.labels === undefined ? DEFAULT_OPTIONS.labels : body.labels === true,
    };

    const result = await createSprite(url.toString(), opts);

    const id = randomUUID();
    const sheetUrls: string[] = [];
    for (const s of result.sheets) {
      sheetUrls.push(await uploadPublic(`sprites/${id}/sheet-${s.index}.jpg`, s.buffer, "image/jpeg"));
    }
    const vtt = result.vtt.replace(/\{\{SHEET_(\d+)\}\}/g, (_, i) => sheetUrls[Number(i)]);
    const vttUrl = await uploadPublic(`sprites/${id}/thumbs.vtt`, vtt, "text/vtt");

    return Response.json({
      sheet: sheetUrls[0],
      vtt: vttUrl,
      sheets: result.sheets.map((s, i) => ({
        url: sheetUrls[i],
        first_second: s.firstSecond,
        frame_count: s.frameCount,
      })),
      columns: opts.columns,
      rows: opts.rows,
      interval_seconds: opts.intervalSeconds,
      cell_width: result.cellWidth,
      cell_height: result.cellHeight,
      frame_count: result.frameCount,
      duration_seconds: result.durationSeconds,
      video_width: result.videoWidth,
      video_height: result.videoHeight,
      truncated: result.sheets.length > 1,
    });
  } catch (e) {
    const status = e instanceof SpriteError ? e.status : 500;
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sprite]", status, message);
    return Response.json({ error: message }, { status });
  }
}
