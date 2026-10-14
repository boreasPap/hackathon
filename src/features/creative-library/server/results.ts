import type { AiModel, Avatar, AvatarCandidate, CreativeExtraction, IterationItem, MediaType, TemplateFrame } from "../types";
import {
  type Execution,
  extractContent,
  extractOutputUrls,
  findEmbeddedError,
  parseJsonContent,
} from "./eachlabs";

// Turns a finished eachlabs execution into what we store. Parsing is lenient:
// a missing field becomes empty instead of failing the whole result.

type Loose = Record<string, unknown>;

function isRecord(value: unknown): value is Loose {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function str(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function num(value: unknown): number | undefined {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function pick(obj: Loose, ...keys: string[]): unknown {
  for (const key of keys) if (obj[key] != null) return obj[key];
  return undefined;
}

function strip<T extends Loose>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

function readContentJson(execution: Execution): unknown {
  const content = extractContent(execution);
  if (content) {
    try {
      return parseJsonContent(content);
    } catch {
      return content;
    }
  }
  // Some workflows return structured output directly instead of LLM text.
  return execution.output;
}

const EXTRACTION_KEYS = ["wallTexts", "wall_texts", "voiceover", "avatar", "music", "template"];

function unwrapExtraction(value: unknown): Loose | null {
  if (!isRecord(value)) return null;
  if (EXTRACTION_KEYS.some((k) => k in value)) return value;
  for (const nested of Object.values(value)) {
    if (isRecord(nested) && EXTRACTION_KEYS.some((k) => k in nested)) return nested;
  }
  return null;
}

function isUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

function url(value: unknown): string | undefined {
  return isUrl(value) ? value.trim() : undefined;
}

/** An LLM step's text, parsed as JSON when it is JSON (with or without ``` fences). */
function json(value: unknown): Loose | null {
  if (isRecord(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = parseJsonContent(value);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function records(value: unknown): Loose[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

const WORKFLOW_OUTPUT_KEYS = ["visual_analysis", "voiceover_script", "wall_text", "transcript_raw", "avatar_frame", "best_avatar", "stems"];

const AVATAR_CANDIDATES = 4;

/**
 * v2 grabs four candidate frames and lets an LLM step (`best_avatar`) rank
 * them; v1 grabs one (`avatar_frame`). The ranking's URLs are matched against
 * the frames themselves, so a URL the model misspelled is never used.
 */
function parseAvatar(out: Loose, times: Loose, visual: Loose): Avatar | null {
  const visualAvatar = isRecord(visual.avatar) ? visual.avatar : {};
  if ((times.avatar_present ?? visualAvatar.present) === false) return null;

  const v1Frame = url(out.avatar_frame);
  if (v1Frame) {
    return strip({
      description: "",
      imageUrl: v1Frame,
      frameSec: num(pick(times, "avatar_second") ?? visualAvatar.best_timestamp),
    });
  }

  const frames = Array.from({ length: AVATAR_CANDIDATES }, (_, i) => ({
    url: url(out[`avatar_candidate_${i + 1}`]),
    atSec: num(times[`avatar_second_${i + 1}`]),
  }));
  const ranked = json(out.best_avatar) ?? {};
  const ranking = records(ranked.ranking);
  const known = (u: unknown) => frames.find((f) => f.url && f.url === url(u));
  const byIndex = (i: unknown) => frames[(num(i) ?? 0) - 1];

  // Same frame twice (parse-times pads short lists) is shown once.
  const candidates: AvatarCandidate[] = [];
  const add = (frame: { url?: string; atSec?: number } | undefined, extra: Partial<AvatarCandidate> = {}) => {
    if (!frame?.url || candidates.some((c) => c.url === frame.url)) return;
    candidates.push(strip({ url: frame.url, atSec: frame.atSec, ...extra }));
  };
  for (const r of ranking) add(known(r.url) ?? byIndex(r.index), { score: num(r.score), notes: str(r.notes) });
  for (const f of frames) add(f);

  const best = known(ranked.best_url) ?? byIndex(ranked.best_index) ?? candidates[0];
  if (!best?.url) return null;
  return strip({
    description: "",
    imageUrl: best.url,
    frameSec: best.atSec ?? num(ranked.best_second),
    reason: str(ranked.reason),
    candidates: candidates.length > 1 ? candidates : undefined,
  });
}

/**
 * The analyzer workflow (`anayzer-hackathon`) names its results in
 * `workflow_output`: LLM steps as JSON text, media steps as URLs.
 */
function parseWorkflowOutput(out: Loose): CreativeExtraction {
  const visual = json(out.visual_analysis) ?? {};
  const wallTextJson = json(out.wall_text) ?? {};
  const vo = json(out.voiceover_script);
  const times = isRecord(out.times) ? out.times : {};
  const transcript = str(out.transcript_raw);

  // The timeline step reads full-resolution frames; the visual step's list is only a fallback.
  const timeline = records(wallTextJson.wall_text);
  const wallTexts = (timeline.length ? timeline : records(visual.wall_text))
    .filter((w) => !!str(w.text))
    .map((w) =>
      strip({
        text: str(w.text)!,
        startSec: num(pick(w, "start", "startSec")),
        endSec: num(pick(w, "end", "endSec")),
        position: str(w.position),
        style: str(w.style),
        persistent: typeof w.persistent === "boolean" ? w.persistent : undefined,
      }),
    );

  const lines = records(vo?.lines);
  const speakers = [...new Set(lines.map((l) => str(l.speaker)).filter(Boolean))];
  const script = str(vo?.full_script) ?? (vo ? undefined : str(out.voiceover_script)) ?? transcript;
  const voiceover = script
    ? strip({
        script,
        speaker: speakers.length === 1 ? speakers[0] : undefined,
        segments: lines.length
          ? lines.map((l) =>
              strip({ text: str(l.text) ?? "", startSec: num(l.start), endSec: num(l.end), speaker: str(l.speaker) }),
            )
          : undefined,
        transcript,
      })
    : null;

  const avatar = parseAvatar(out, times, visual);

  const audioUrl = url(out.audio);
  const stemsUrl = url(out.stems);
  const music = audioUrl || stemsUrl ? strip({ description: "", audioUrl, stemsUrl }) : null;

  const layoutSegments = records(visual.layout_segments).map((seg) =>
    strip({
      startSec: num(seg.start),
      endSec: num(seg.end),
      layoutType: str(seg.layout_type) ?? "unknown",
      regions: records(seg.regions).map((r) => ({
        role: str(r.role) ?? "other",
        x: num(r.x) ?? 0,
        y: num(r.y) ?? 0,
        w: num(r.w) ?? 0,
        h: num(r.h) ?? 0,
      })),
    }),
  );
  const endCard = isRecord(visual.end_card) && visual.end_card.present === true ? num(visual.end_card.start) : undefined;
  const sceneChangesSec = Array.isArray(visual.scene_changes)
    ? visual.scene_changes.map(num).filter((n): n is number => n !== undefined)
    : [];
  const frames = [
    { url: url(out.first_frame), atSec: 0, label: "First frame" },
    { url: url(out.text_frame_1), atSec: num(times.text_second_1), label: "Text frame 1" },
    { url: url(out.text_frame_2), atSec: num(times.text_second_2), label: "Text frame 2" },
    { url: url(out.text_frame_3), atSec: num(times.text_second_3), label: "Text frame 3" },
  ].flatMap((f): TemplateFrame[] => (f.url ? [strip({ ...f, url: f.url })] : []));
  const spriteSheetUrl = url(out.sprite_sheet);
  const lastEnd = Math.max(0, ...layoutSegments.map((s) => s.endSec ?? 0), ...wallTexts.map((w) => w.endSec ?? 0));

  const template =
    str(visual.aspect_ratio) || layoutSegments.length || frames.length || spriteSheetUrl
      ? strip({
          layout: [...new Set(layoutSegments.map((s) => s.layoutType))].join(", "),
          aspectRatio: str(visual.aspect_ratio),
          durationSec: endCard ?? (lastEnd || undefined),
          layoutSegments: layoutSegments.length ? layoutSegments : undefined,
          sceneChangesSec: sceneChangesSec.length ? sceneChangesSec : undefined,
          endCardSec: endCard,
          spriteSheetUrl,
          frames: frames.length ? frames : undefined,
        })
      : null;

  return { wallTexts, voiceover, avatar, music, template };
}

export function parseExtraction(execution: Execution): CreativeExtraction {
  const embedded = findEmbeddedError(execution);
  if (embedded) throw new Error(embedded);

  const out = execution.workflowOutput;
  if (out && WORKFLOW_OUTPUT_KEYS.some((k) => out[k] != null)) return parseWorkflowOutput(out);

  const data = unwrapExtraction(readContentJson(execution));
  if (!data) throw new Error("The analysis workflow finished but did not return the expected JSON.");

  const wallTexts = (pick(data, "wallTexts", "wall_texts") as unknown[] | undefined) ?? [];
  const voiceover = pick(data, "voiceover", "voiceOver");
  const avatar = data.avatar;
  const music = data.music;
  const template = data.template;

  return strip({
    summary: str(data.summary),
    language: str(data.language),
    wallTexts: Array.isArray(wallTexts)
      ? wallTexts
          .map((w) => (typeof w === "string" ? { text: w } : isRecord(w) ? w : null))
          .filter((w): w is Loose => !!w && !!str(w.text))
          .map((w) =>
            strip({
              text: str(w.text)!,
              startSec: num(pick(w, "startSec", "start")),
              endSec: num(pick(w, "endSec", "end")),
              role: (["hook", "body", "cta"] as const).find((r) => r === w.role),
            }),
          )
      : [],
    voiceover:
      typeof voiceover === "string"
        ? { script: voiceover }
        : isRecord(voiceover) && str(voiceover.script)
          ? strip({
              script: str(voiceover.script)!,
              speaker: str(voiceover.speaker),
              segments: Array.isArray(voiceover.segments)
                ? voiceover.segments.filter(isRecord).map((s) =>
                    strip({ text: str(s.text) ?? "", startSec: num(s.startSec), endSec: num(s.endSec) }),
                  )
                : undefined,
            })
          : null,
    avatar: isRecord(avatar)
      ? strip({
          description: str(avatar.description) ?? "",
          gender: str(avatar.gender),
          ageRange: str(avatar.ageRange),
          appearance: str(avatar.appearance),
          setting: str(avatar.setting),
          wardrobe: str(avatar.wardrobe),
          framing: str(avatar.framing),
          imageUrl: str(pick(avatar, "imageUrl", "image_url", "frameUrl")),
        })
      : null,
    music: isRecord(music)
      ? strip({
          description: str(music.description) ?? "",
          genre: str(music.genre),
          mood: str(music.mood),
          energy: (["low", "medium", "high"] as const).find((e) => e === music.energy),
          tempoBpm: num(pick(music, "tempoBpm", "bpm")),
        })
      : null,
    template: isRecord(template)
      ? strip({
          layout: str(template.layout) ?? "",
          aspectRatio: str(template.aspectRatio),
          durationSec: num(template.durationSec),
          visualStyle: str(template.visualStyle),
          scenes: Array.isArray(template.scenes)
            ? template.scenes.filter(isRecord).map((s, i) =>
                strip({
                  index: num(s.index) ?? i + 1,
                  startSec: num(s.startSec),
                  endSec: num(s.endSec),
                  description: str(s.description) ?? "",
                  onScreenText: str(s.onScreenText),
                }),
              )
            : undefined,
        })
      : null,
  });
}

const LIST_KEYS = ["iterations", "items", "variations", "results", "options"];

function toTextItem(value: unknown): IterationItem | null {
  if (typeof value === "string") return value.trim() ? { text: value.trim() } : null;
  if (!isRecord(value)) return null;
  const text = str(pick(value, "text", "script", "content", "wallText", "copy"));
  if (!text) return null;
  return strip({
    text,
    title: str(pick(value, "title", "angle", "name", "label")),
    notes: str(pick(value, "notes", "reason", "rationale", "explanation")),
  });
}

/**
 * A markdown answer with one "### VARIATION n" section per result, each made
 * of `**Label:** value` fields (the voiceover workflow). The field named like
 * "…Script" is the text, "…Angle" the title, the rest become notes.
 */
function markdownVariations(content: string): IterationItem[] {
  const sections = content.split(/^#{1,6}\s*variation\b.*$/im).slice(1);
  return sections.flatMap((section) => {
    const fields: { label: string; lines: string[] }[] = [];
    for (const line of section.split("\n")) {
      if (/^\s*-{3,}\s*$/.test(line)) break;
      const field = line.match(/^\s*\*\*([^*]+?):?\*\*:?\s*(.*)$/);
      if (field) fields.push({ label: field[1].trim(), lines: [field[2]] });
      else fields.at(-1)?.lines.push(line);
    }
    const value = (f: { lines: string[] }) => f.lines.join("\n").trim();
    const script = fields.find((f) => /script/i.test(f.label));
    const text = script && value(script);
    if (!text) return [];
    const angle = fields.find((f) => /angle/i.test(f.label));
    const notes = fields
      .filter((f) => f !== script && f !== angle && value(f))
      .map((f) => `${f.label}: ${value(f)}`)
      .join("\n");
    return [strip({ text, title: angle && (value(angle) || undefined), notes: notes || undefined })];
  });
}

function textItems(execution: Execution): IterationItem[] {
  const data = readContentJson(execution);
  if (typeof data === "string") {
    const variations = markdownVariations(data);
    if (variations.length) return variations;
    return data.trim() ? [{ text: data.trim() }] : [];
  }

  let list: unknown = data;
  if (isRecord(data)) {
    const key = LIST_KEYS.find((k) => Array.isArray(data[k]));
    const reason = str(data.error);
    if (reason && (!key || !(data[key] as unknown[]).length)) throw new Error(reason);
    list = key ? data[key] : [data];
  }
  return Array.isArray(list) ? list.map(toTextItem).filter((i): i is IterationItem => !!i) : [];
}

function mediaTypeFor(url: string, model: AiModel): MediaType {
  if (/\.(mp4|mov|webm)(\?|$)/i.test(url)) return "video";
  if (/\.(mp3|wav|m4a|aac|ogg)(\?|$)/i.test(url)) return "audio";
  if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url)) return "image";
  const declared = model.requestConfig.outputTypes.find((t): t is MediaType => ["image", "video", "audio"].includes(t));
  return declared ?? "image";
}

export function parseIterationItems(execution: Execution, model: AiModel): IterationItem[] {
  const embedded = findEmbeddedError(execution);
  if (embedded) throw new Error(embedded);

  const outputs = model.requestConfig.outputTypes;
  const items: IterationItem[] = [];
  if (outputs.includes("text")) items.push(...textItems(execution));
  if (outputs.some((t) => t !== "text")) {
    items.push(...extractOutputUrls(execution).map((url) => ({ url, mediaType: mediaTypeFor(url, model) })));
  }
  if (!items.length) throw new Error("The workflow finished but returned no results.");
  return items;
}
