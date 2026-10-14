import { errorResponse } from "@/features/creative-library/server/http";
import { syncCreative } from "@/features/creative-library/server/jobs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return Response.json({ creative: await syncCreative(id) });
  } catch (error) {
    return errorResponse(error);
  }
}
