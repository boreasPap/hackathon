import { uploadToStorage } from "./storage";

// Uploads sprite sheets and the VTT to a public URL, via each::storage (the
// same store the workflow's videos live in). To use another store, change only
// this function; it must return a public URL, since Gemini downloads from it.
// `key` is unused here: each::storage names the file itself.

export async function uploadPublic(key: string, body: Buffer | string, contentType: string): Promise<string> {
  const data = typeof body === "string" ? body : new Uint8Array(body);
  const file = new Blob([data], { type: contentType });
  const stored = await uploadToStorage(file, contentType.startsWith("image/") ? "image" : "other");
  return stored.url;
}
