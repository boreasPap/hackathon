import { ITERATION_TYPES, type IterationType } from "@/features/creative-library/types";
import { errorResponse, HttpError } from "@/features/creative-library/server/http";
import { startIteration } from "@/features/creative-library/server/jobs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { type?: string; prompt?: unknown; imageUrl?: unknown };
    if (!ITERATION_TYPES.includes(body.type as IterationType)) {
      throw new HttpError(400, `type must be one of: ${ITERATION_TYPES.join(", ")}.`);
    }
    const prompt = typeof body.prompt === "string" && body.prompt.trim() ? body.prompt.trim() : null;
    const imageUrl = typeof body.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;
    return Response.json({ creative: await startIteration(id, body.type as IterationType, prompt, imageUrl) });
  } catch (error) {
    return errorResponse(error);
  }
}
