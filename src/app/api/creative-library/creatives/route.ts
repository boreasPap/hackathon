import type { NextRequest } from "next/server";
import { createCreative } from "@/features/creative-library/server/creatives";
import { readDb } from "@/features/creative-library/server/db";
import { errorResponse, HttpError } from "@/features/creative-library/server/http";

export async function GET(request: NextRequest) {
  try {
    const app = request.nextUrl.searchParams.get("app")?.toLowerCase();
    const { creatives } = await readDb();
    return Response.json({ creatives: app ? creatives.filter((c) => c.app.toLowerCase() === app) : creatives });
  } catch (error) {
    return errorResponse(error);
  }
}

/** multipart/form-data: id, app, tags (comma separated), hook, video (file), poster (image, optional). */
export async function POST(request: Request) {
  try {
    const form = await request.formData().catch(() => {
      throw new HttpError(400, "Send the creative as multipart form data.");
    });
    return Response.json({ creative: await createCreative(form) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
