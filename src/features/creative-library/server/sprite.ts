import { spawn } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// Builds a sprite sheet (a grid of frames) from a video: one frame every
// `intervalSeconds`, laid out left to right, top to bottom in a
// `columns` x `rows` grid, so cell i shows second i * intervalSeconds. Each cell
// gets its second as a label in the top left corner. Needs ffmpeg-static (the
// binary) and dejavu-fonts-ttf (the label font).

export type SpriteOptions = {
  columns: number;
  rows: number;
  intervalSeconds: number;
  cellWidth: number;
  labels: boolean;
  maxDurationSeconds: number;
  maxBytes: number;
};

export const DEFAULT_OPTIONS: SpriteOptions = {
  columns: 7,
  rows: 7,
  intervalSeconds: 1,
  cellWidth: 320,
  labels: true,
  maxDurationSeconds: 300,
  maxBytes: 200 * 1024 * 1024,
};

export type SheetFile = { index: number; buffer: Buffer; firstSecond: number; frameCount: number };

export type SpriteResult = {
  sheets: SheetFile[];
  /** Sheet URLs are `{{SHEET_<index>}}` placeholders, replaced after upload. */
  vtt: string;
  durationSeconds: number;
  videoWidth: number;
  videoHeight: number;
  cellWidth: number;
  cellHeight: number;
  frameCount: number;
};

export class SpriteError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/** Bundling can break ffmpeg-static's own path, so fallbacks are tried too. */
export function resolveFfmpegPath(): string {
  const candidates: string[] = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const p = require("ffmpeg-static") as string | null;
    if (p) candidates.push(p);
  } catch {}
  candidates.push(path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg"));
  for (const c of candidates) if (c && existsSync(c)) return c;
  throw new SpriteError(`ffmpeg binary bulunamadı. Denenen yollar: ${candidates.join(", ")}`, 500);
}

/** Null when the font is missing; the sheet is then made without labels. */
export function resolveFontPath(): string | null {
  const candidates = [
    process.env.SPRITE_FONT_PATH,
    path.join(process.cwd(), "node_modules", "dejavu-fonts-ttf", "ttf", "DejaVuSans-Bold.ttf"),
  ].filter(Boolean) as string[];
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

function run(bin: string, args: string[], timeoutMs: number): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > 200_000) stderr = stderr.slice(-100_000);
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new SpriteError("ffmpeg zaman aşımına uğradı", 504));
    }, timeoutMs);
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(new SpriteError(`ffmpeg başlatılamadı: ${e.message}`, 500));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code: code ?? -1, stderr });
    });
  });
}

/** Streams the video to disk and stops once it passes `maxBytes`. */
export async function downloadVideo(url: string, dest: string, maxBytes: number): Promise<number> {
  let res: Response;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (e) {
    throw new SpriteError(`Video indirilemedi: ${(e as Error).message}`, 422);
  }
  if (!res.ok || !res.body) throw new SpriteError(`Video indirilemedi: HTTP ${res.status}`, 422);
  const declared = Number(res.headers.get("content-length") ?? 0);
  if (declared && declared > maxBytes) throw new SpriteError(`Video çok büyük (${declared} bayt)`, 413);

  let received = 0;
  const limiter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      received += chunk.byteLength;
      if (received > maxBytes) controller.error(new SpriteError("Video boyut sınırını aştı", 413));
      else controller.enqueue(chunk);
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await pipeline(Readable.fromWeb(res.body.pipeThrough(limiter) as any), createWriteStream(dest));
  return received;
}

/** Reads duration and frame size from `ffmpeg -i`. */
export async function probe(ffmpeg: string, file: string) {
  const { stderr } = await run(ffmpeg, ["-hide_banner", "-i", file], 30_000);
  const d = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!d) throw new SpriteError("Dosya okunamadı ya da geçerli bir video değil", 422);
  const duration = Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]);
  const v = stderr.match(/Stream #[^\n]*Video:[^\n]*?\b(\d{2,5})x(\d{2,5})\b/);
  if (!v) throw new SpriteError("Videoda görüntü akışı bulunamadı", 422);
  let width = Number(v[1]);
  let height = Number(v[2]);
  // Phone videos rotated 90/270° store width and height swapped.
  if (/rotate\s*:\s*-?(90|270)|rotation of -?(90|270)/.test(stderr)) [width, height] = [height, width];
  return { duration, width, height };
}

function vttTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${sec.toFixed(3).padStart(6, "0")}`;
}

export async function createSprite(videoUrl: string, opts: SpriteOptions): Promise<SpriteResult> {
  const ffmpeg = resolveFfmpegPath();
  const dir = await mkdtemp(path.join(tmpdir(), "sprite-"));
  try {
    const input = path.join(dir, "input");
    await downloadVideo(videoUrl, input, opts.maxBytes);
    const { duration, width, height } = await probe(ffmpeg, input);
    if (duration <= 0) throw new SpriteError("Video süresi 0", 422);
    if (duration > opts.maxDurationSeconds) {
      throw new SpriteError(`Video çok uzun (${duration.toFixed(1)} sn, sınır ${opts.maxDurationSeconds} sn)`, 413);
    }

    // Cell height keeps the video's aspect ratio; ffmpeg needs even sizes.
    const cellWidth = opts.cellWidth - (opts.cellWidth % 2);
    const cellHeight = Math.max(2, Math.round((cellWidth * height) / width / 2) * 2);
    const perSheet = opts.columns * opts.rows;

    // The first frame (t=0), then the first frame at least `intervalSeconds`
    // after the previous pick. Do not swap in `fps=1`: it shifts every cell by
    // about a second (the 0s cell shows second 1).
    const filters = [
      `select='isnan(prev_selected_t)+gte(t-prev_selected_t\\,${opts.intervalSeconds})'`,
      `scale=${cellWidth}:${cellHeight}`,
    ];
    const font = opts.labels ? resolveFontPath() : null;
    if (font) {
      const size = Math.max(14, Math.round(cellWidth / 9));
      const escaped = font.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
      filters.push(
        `drawtext=fontfile='${escaped}':text='%{eif\\:n*${opts.intervalSeconds}\\:d}s':` +
          `x=6:y=6:fontsize=${size}:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=6`,
      );
    }
    filters.push(`tile=${opts.columns}x${opts.rows}:margin=0:padding=4:color=black`);

    const out = path.join(dir, "sheet-%03d.jpg");
    const { code, stderr } = await run(
      ffmpeg,
      ["-hide_banner", "-loglevel", "error", "-i", input, "-vf", filters.join(","), "-q:v", "3", "-vsync", "vfr", out],
      120_000,
    );
    if (code !== 0) throw new SpriteError(`ffmpeg hata verdi: ${stderr.slice(-500)}`, 500);

    const files = (await readdir(dir)).filter((f) => /^sheet-\d+\.jpg$/.test(f)).sort();
    if (files.length === 0) throw new SpriteError("Sprite üretilemedi (kare yok)", 500);

    const frameCount = Math.max(1, Math.ceil(duration / opts.intervalSeconds - 1e-6));
    const sheets: SheetFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const buffer = await readFile(path.join(dir, files[i]));
      const first = i * perSheet;
      sheets.push({
        index: i,
        buffer,
        firstSecond: first * opts.intervalSeconds,
        frameCount: Math.max(0, Math.min(perSheet, frameCount - first)),
      });
    }

    // WebVTT: each frame's time range -> its cell in the sheet (4 px padding).
    const pad = 4;
    const lines = ["WEBVTT", ""];
    for (let f = 0; f < frameCount; f++) {
      const sheet = Math.floor(f / perSheet);
      const cell = f % perSheet;
      const x = pad + (cell % opts.columns) * (cellWidth + pad);
      const y = pad + Math.floor(cell / opts.columns) * (cellHeight + pad);
      const start = f * opts.intervalSeconds;
      const end = Math.min(duration, (f + 1) * opts.intervalSeconds);
      lines.push(`${vttTime(start)} --> ${vttTime(end)}`, `{{SHEET_${sheet}}}#xywh=${x},${y},${cellWidth},${cellHeight}`, "");
    }

    return {
      sheets,
      vtt: lines.join("\n"),
      durationSeconds: Math.round(duration * 1000) / 1000,
      videoWidth: width,
      videoHeight: height,
      cellWidth,
      cellHeight,
      frameCount,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
