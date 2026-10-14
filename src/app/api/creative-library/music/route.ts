import { errorResponse, HttpError } from "@/features/creative-library/server/http";
import { startMusicVideo } from "@/features/creative-library/server/music-video";

/** multipart/form-data: video (file) or videoUrl. Starts the Music Generator workflow. */
export async function POST(request: Request) {
  try {
    const form = await request.formData().catch(() => {
      throw new HttpError(400, "Send the video as multipart form data.");
    });
    return Response.json(await startMusicVideo(form), { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
