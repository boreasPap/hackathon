import { errorResponse } from "@/features/creative-library/server/http";
import { checkMusicVideo } from "@/features/creative-library/server/music-video";

/** The state of a Music Generator run, and its videos once it is done. */
export async function GET(_request: Request, { params }: { params: Promise<{ executionId: string }> }) {
  try {
    const { executionId } = await params;
    return Response.json(await checkMusicVideo(executionId));
  } catch (error) {
    return errorResponse(error);
  }
}
