import type { AiModel, CreativeExtraction, IterationItem, MediaType } from "../types";
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

export function parseExtraction(execution: Execution): CreativeExtraction {
  const embedded = findEmbeddedError(execution);
  if (embedded) throw new Error(embedded);

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

function textItems(execution: Execution): IterationItem[] {
  const data = readContentJson(execution);
  if (typeof data === "string") return data.trim() ? [{ text: data.trim() }] : [];

  let list: unknown = data;
  if (isRecord(data)) {
    const key = LIST_KEYS.find((k) => Array.isArray(data[k]));
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
