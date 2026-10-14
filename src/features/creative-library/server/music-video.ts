import { requireAiModel } from "./ai-models";
import {
  type Execution,
  executionFailureMessage,
  extractContent,
  getExecution,
  outputsPending,
  TERMINAL_STATUSES,
  triggerWorkflow,
} from "./eachlabs";
import { HttpError } from "./http";
import { uploadToStorage } from "./storage";

// The Music Generator: a video goes to the "musicVideo" workflow, which picks
// a fitting style, writes a music prompt and returns the same video with
// music under it, in a few variants. Its input is `video` (a public URL).

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export type MusicVideoStart = { executionId: string; videoUrl: string };

export type MusicVideoRun = {
  status: "running" | "completed" | "failed";
  /** The videos with music, one per variant. */
  videos: string[];
  /** The music prompt the workflow wrote for this video. */
  prompt: string | null;
  error: string | null;
};

/** multipart/form-data: `video` (a file, uploaded to eachlabs storage) or `videoUrl` (already public). */
export async function startMusicVideo(form: FormData): Promise<MusicVideoStart> {
  const model = await requireAiModel("musicVideo", "Music Generator");
  const file = form.get("video");
  const given = form.get("videoUrl");

  let videoUrl: string;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("video/")) throw new HttpError(400, "That file is not a video.");
    if (file.size > MAX_VIDEO_BYTES) throw new HttpError(400, "The video is larger than 100 MB, the eachlabs storage limit.");
    videoUrl = (await uploadToStorage(file, "video")).url;
  } else if (typeof given === "string" && /^https:\/\//i.test(given)) {
    videoUrl = given;
  } else {
    throw new HttpError(400, "Choose a video to add music to.");
  }

  const { executionId } = await triggerWorkflow({
    workflowId: model.apiUsageModels,
    versionId: model.versionId,
    inputs: { ...(model.requestConfig.input ?? {}), video: videoUrl },
  });
  return { executionId, videoUrl };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Every video URL in the output (`{ videos: [{ url }] }`, or any nesting of it), in order. */
function videoUrls(execution: Execution): string[] {
  const urls: string[] = [];
  const collect = (value: unknown): void => {
    if (typeof value === "string") {
      if (/^https?:\/\/\S+\.(mp4|mov|webm)(\?|$)/i.test(value)) urls.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(collect);
    } else if (isRecord(value)) {
      Object.values(value).forEach(collect);
    }
  };
  collect(execution.output);
  if (!urls.length) collect(execution.workflowOutput);
  return [...new Set(urls)];
}

export async function checkMusicVideo(executionId: string): Promise<MusicVideoRun> {
  const execution = await getExecution(executionId);
  if (!TERMINAL_STATUSES.has(execution.status) || outputsPending(execution)) {
    return { status: "running", videos: [], prompt: null, error: null };
  }
  if (execution.status !== "completed") {
    return { status: "failed", videos: [], prompt: null, error: executionFailureMessage(execution) };
  }
  const videos = videoUrls(execution);
  const prompt = extractContent(execution)?.trim() || null;
  if (!videos.length) {
    return { status: "failed", videos: [], prompt, error: "The workflow finished but returned no video." };
  }
  return { status: "completed", videos, prompt, error: null };
}
