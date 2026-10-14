import { avatarFrames, OWN_INPUT_TYPES } from "../constants";
import type { AiModel, Creative, CreativeExtraction, IterationType } from "../types";
import { HttpError } from "./http";

// The input contract of the eachlabs workflows. Each workflow is built in
// eachlabs with these input names; rename them here if a workflow differs.
//
// Every iteration workflow gets: video_url, language, prompt, context (the
// whole analysis as JSON) + the type-specific fields below + the static
// `requestConfig.input` of its aiModels.json entry. The OWN_INPUT_TYPES
// workflows are the exception: they get only their own inputs (`text` for the
// wall texts and the voiceover script, `image` / `image_urls` for the avatar
// frame, `voice-test` for the soundtrack to make a new track from). The
// similar avatar workflow also takes the page's direction as `notes`.

function mergePrompt(model: AiModel, userPrompt: string | null): string | undefined {
  const parts = [model.requestConfig.prompt, userPrompt].map((p) => p?.trim()).filter(Boolean);
  return parts.length ? parts.join("\n\n") : undefined;
}

// The analysis workflow (v2) takes only `video`.
export function buildAnalysisInputs(creative: Creative, model: AiModel): Record<string, unknown> {
  if (!creative.videoUrl) {
    throw new HttpError(
      400,
      `Add a public video URL for ${creative.id} first: eachlabs cannot read videos from this computer.`,
    );
  }
  const prompt = mergePrompt(model, null);
  return {
    ...(model.requestConfig.input ?? {}),
    video: creative.videoUrl,
    ...(prompt && { prompt }),
  };
}

/** The frame the person picked, or the best one. Only this video's own frames are accepted. */
function avatarImage(extracted: CreativeExtraction, requested: string | null): string {
  if (!extracted.avatar) throw new HttpError(400, "The analysis found no avatar in this video.");
  const frames = avatarFrames(extracted.avatar);
  if (!frames.length) {
    throw new HttpError(400, "The analysis did not return an avatar image (avatar.imageUrl), which this workflow needs.");
  }
  if (requested && !frames.includes(requested)) {
    throw new HttpError(400, "That image is not one of this video's avatar frames. Reload the page and pick again.");
  }
  return requested ?? frames[0];
}

function typeInputs(
  type: IterationType,
  extracted: CreativeExtraction,
  avatarUrl: string | null,
  prompt: string | undefined,
): Record<string, unknown> {
  switch (type) {
    case "wallText": {
      // Every on-screen line, in order, once: the workflow rewrites them together.
      const lines = [...new Set(extracted.wallTexts.map((w) => w.text.trim()).filter(Boolean))];
      if (!lines.length) throw new HttpError(400, "The analysis found no wall texts in this video.");
      return { text: lines.join("\n") };
    }
    case "voiceover":
      if (!extracted.voiceover?.script) throw new HttpError(400, "The analysis found no voiceover in this video.");
      return { text: extracted.voiceover.script };
    case "similarAvatar":
    case "avatarVariation": {
      const image = avatarImage(extracted, avatarUrl);
      return type === "avatarVariation" ? { image } : { image_urls: [image], notes: prompt ?? "none" };
    }
    case "music": {
      // The music workflow describes this track and generates a new one like it.
      const audioUrl = extracted.music?.instrumentalUrl ?? extracted.music?.audioUrl;
      if (!audioUrl) throw new HttpError(400, "The analysis found no music in this video.");
      return { "voice-test": audioUrl };
    }
    case "template":
      if (!extracted.template) throw new HttpError(400, "The analysis found no template in this video.");
      return { template: JSON.stringify(extracted.template) };
  }
}

export function buildIterationInputs(
  creative: Creative,
  type: IterationType,
  model: AiModel,
  userPrompt: string | null,
  avatarUrl: string | null = null,
): Record<string, unknown> {
  const extracted = creative.extracted;
  if (creative.analysis.status !== "completed" || !extracted) {
    throw new HttpError(400, "Analyze the video first.");
  }
  const prompt = mergePrompt(model, userPrompt);
  if (OWN_INPUT_TYPES.has(type)) {
    return { ...(model.requestConfig.input ?? {}), ...typeInputs(type, extracted, avatarUrl, prompt) };
  }
  return {
    ...(model.requestConfig.input ?? {}),
    video_url: creative.videoUrl,
    language: extracted.language || "en",
    context: JSON.stringify(extracted),
    ...typeInputs(type, extracted, avatarUrl, prompt),
    ...(prompt && { prompt }),
  };
}
