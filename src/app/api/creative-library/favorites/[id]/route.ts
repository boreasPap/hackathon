import { errorResponse } from "@/features/creative-library/server/http";
import { removeFavorite } from "@/features/creative-library/server/favorites";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await removeFavorite(id);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
