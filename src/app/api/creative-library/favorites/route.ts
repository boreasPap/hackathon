import { errorResponse } from "@/features/creative-library/server/http";
import { addFavorite, listFavorites, parseFavoriteInput } from "@/features/creative-library/server/favorites";

export async function GET() {
  try {
    return Response.json({ favorites: await listFavorites() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = parseFavoriteInput(await request.json().catch(() => null));
    return Response.json({ favorite: await addFavorite(input) });
  } catch (error) {
    return errorResponse(error);
  }
}
