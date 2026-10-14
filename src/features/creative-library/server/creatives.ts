import type { Creative } from "../types";
import { readDb, updateDb } from "./db";
import { HttpError } from "./http";
import { deleteFromStorage, type StoredUpload, uploadToStorage } from "./storage";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const MAX_POSTER_BYTES = 10 * 1024 * 1024;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function file(form: FormData, key: string): File | null {
  const value = form.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

/** A new creative from the Add creative form: its video (and poster) go to eachlabs storage. */
export async function createCreative(form: FormData): Promise<Creative> {
  const id = text(form, "id");
  const app = text(form, "app");
  const hook = text(form, "hook");
  const tags = [...new Set(text(form, "tags").split(",").map((t) => t.trim()).filter(Boolean))];
  const video = file(form, "video");
  const poster = file(form, "poster");

  if (!ID_PATTERN.test(id)) {
    throw new HttpError(400, "The creative ID can use letters, digits, - and _ (up to 64 characters).");
  }
  if (!video) throw new HttpError(400, "Choose a video file.");
  if (!video.type.startsWith("video/")) throw new HttpError(400, "The file is not a video.");
  if (video.size > MAX_VIDEO_BYTES) throw new HttpError(400, "The video is larger than 100 MB, the eachlabs storage limit.");
  if (poster && (!poster.type.startsWith("image/") || poster.size > MAX_POSTER_BYTES)) {
    throw new HttpError(400, "The poster must be an image under 10 MB.");
  }

  const db = await readDb();
  if (!db.apps.some((a) => a.id === app)) throw new HttpError(400, "Pick an app.");
  if (db.creatives.some((c) => c.id.toLowerCase() === id.toLowerCase())) {
    throw new HttpError(409, `A creative with the ID ${id} already exists.`);
  }

  const uploadedVideo = await uploadToStorage(video, "video");
  let uploadedPoster: StoredUpload | null = null;
  if (poster) {
    try {
      uploadedPoster = await uploadToStorage(poster, "image");
    } catch (error) {
      // A missing poster only costs the thumbnail; keep the creative.
      console.error("[creative-library] poster upload failed", error);
    }
  }

  const now = new Date().toISOString();
  const creative: Creative = {
    id,
    app,
    tags,
    fileName: video.name,
    hook,
    videoPath: uploadedVideo.url,
    posterPath: uploadedPoster?.url ?? null,
    videoUrl: uploadedVideo.url,
    storage: {
      videoFileId: uploadedVideo.id || null,
      posterFileId: uploadedPoster?.id || null,
      expiresAt: uploadedVideo.expiresAt,
    },
    createdAt: now,
    updatedAt: now,
    analysis: { status: "idle", executionId: null, aiModelId: null, error: null, startedAt: null, completedAt: null, raw: null },
    extracted: null,
    iterations: [],
  };

  try {
    return await updateDb((current) => {
      if (current.creatives.some((c) => c.id.toLowerCase() === id.toLowerCase())) {
        throw new HttpError(409, `A creative with the ID ${id} already exists.`);
      }
      current.creatives.unshift(creative);
      return creative;
    });
  } catch (error) {
    await Promise.all([deleteFromStorage(uploadedVideo.id), deleteFromStorage(uploadedPoster?.id)]);
    throw error;
  }
}
