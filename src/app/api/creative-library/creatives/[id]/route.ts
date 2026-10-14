import { getCreative } from "@/features/creative-library/server/db";
import { errorResponse } from "@/features/creative-library/server/http";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return Response.json({ creative: await getCreative(id) });
  } catch (error) {
    return errorResponse(error);
  }
}
