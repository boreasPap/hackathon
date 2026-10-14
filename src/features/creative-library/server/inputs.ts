import { OWN_INPUT_TYPES } from "../constants";
import type { AiModel, Creative, CreativeExtraction, IterationType } from "../types";
import { HttpError } from "./http";

// The input contract of the eachlabs workflows. Each workflow is built in
// eachlabs with these input names; rename them here if a workflow differs.
//
// Every iteration workflow gets: video_url, language, prompt, context (the
// whole analysis as JSON) + the type-specific fields below + the static
// `requestConfig.input` of its aiModels.json entry. The OWN_INPUT_TYPES
// workflows are the exception: they get only their own input (`text` for the
// wall texts, `image` for the avatar frame, `voice-test` for the soundtrack to
// make a new track from).

function mergePrompt(model: AiModel, userPrompt: string | null): string | undefined {
  const parts = [model.requestConfig.prompt, userPrompt].map((p) => p?.trim()).filter(Boolean);
  return parts.length ? parts.join("\n\n") : undefined;
}

// The analysis workflow takes `video` (+ `language`, from requestConfig.input).
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

function typeInputs(type: IterationType, extracted: CreativeExtraction): Record<string, unknown> {
  switch (type) {
    case "wallText": {
      // Every on-screen line, in order, once: the workflow rewrites them together.
      const lines = [...new Set(extracted.wallTexts.map((w) => w.text.trim()).filter(Boolean))];
      if (!lines.length) throw new HttpError(400, "The analysis found no wall texts in this video.");
      return { text: lines.join("\n") };
    }
    case "voiceover":
      if (!extracted.voiceover?.script) throw new HttpError(400, "The analysis found no voiceover in this video.");
      return { voiceover_script: extracted.voiceover.script };
    case "similarAvatar":
    case "avatarVariation":
      if (!extracted.avatar) throw new HttpError(400, "The analysis found no avatar in this video.");
      if (!extracted.avatar.imageUrl) {
        throw new HttpError(400, "The analysis did not return an avatar image (avatar.imageUrl), which this workflow needs.");
      }
      return type === "avatarVariation"
        ? { image: extracted.avatar.imageUrl }
        : { image_urls: [extracted.avatar.imageUrl], avatar_description: extracted.avatar.description };
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
): Record<string, unknown> {
  const extracted = creative.extracted;
  if (creative.analysis.status !== "completed" || !extracted) {
    throw new HttpError(400, "Analyze the video first.");
  }
  if (OWN_INPUT_TYPES.has(type)) {
    return { ...(model.requestConfig.input ?? {}), ...typeInputs(type, extracted) };
  }
  const prompt = mergePrompt(model, userPrompt);
  return {
    ...(model.requestConfig.input ?? {}),
    video_url: creative.videoUrl,
    language: extracted.language || "en",
    context: JSON.stringify(extracted),
    ...typeInputs(type, extracted),
    ...(prompt && { prompt }),
  };
}
