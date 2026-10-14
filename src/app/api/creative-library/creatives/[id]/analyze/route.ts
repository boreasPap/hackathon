import { errorResponse } from "@/features/creative-library/server/http";
import { startAnalysis } from "@/features/creative-library/server/jobs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return Response.json({ creative: await startAnalysis(id) });
  } catch (error) {
    return errorResponse(error);
  }
}
