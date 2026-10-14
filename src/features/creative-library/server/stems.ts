import { unzipSync } from "fflate";
import { uploadToStorage } from "./storage";

// The stem splitter returns one zip (vocals, bass, drums, instrumental …) on
// a CDN that does not keep files for long. We keep only instrumental.wav and
// move it to eachlabs storage, next to the creative's other files.

const MAX_ZIP_BYTES = 200 * 1024 * 1024;
const INSTRUMENTAL = "instrumental.wav";

const globalJobs = globalThis as unknown as { __creativeLibraryInstrumentals?: Map<string, Promise<string | null>> };
const jobs = (globalJobs.__creativeLibraryInstrumentals ??= new Map());

async function extract(stemsUrl: string): Promise<string | null> {
  const response = await fetch(stemsUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`Downloading the stems failed (${response.status})`);
  const size = Number(response.headers.get("content-length"));
  if (size > MAX_ZIP_BYTES) throw new Error(`The stems zip is too large (${size} bytes)`);

  const zip = new Uint8Array(await response.arrayBuffer());
  const files = unzipSync(zip, { filter: (f) => f.name.split("/").pop()?.toLowerCase() === INSTRUMENTAL });
  const wav = Object.values(files)[0];
  if (!wav) throw new Error(`The stems zip has no ${INSTRUMENTAL}`);

  const uploaded = await uploadToStorage(new Blob([wav], { type: "audio/wav" }), "audio");
  return uploaded.url;
}

/**
 * The instrumental of a stems zip as an eachlabs storage URL, or null when it
 * cannot be had. Never throws: a missing instrumental must not fail the analysis.
 * Calls for the same zip share one download (the page syncs every few seconds).
 */
export function instrumentalFromStems(stemsUrl: string): Promise<string | null> {
  let job = jobs.get(stemsUrl);
  if (!job) {
    job = extract(stemsUrl).catch((error) => {
      console.error("[creative-library] instrumental", stemsUrl, error);
      return null;
    });
    jobs.set(stemsUrl, job);
    void job.finally(() => setTimeout(() => jobs.delete(stemsUrl), 60_000));
  }
  return job;
}
