import { EachlabsProviderError, eachlabsRequest } from "./eachlabs";

// each::storage (docs.eachlabs.ai/storage): presign, then PUT the bytes to the
// presigned URL. The returned public_url is what workflows read.

export type StorageFileType = "image" | "video" | "audio" | "other";

export type StoredUpload = {
  id: string;
  url: string;
  expiresAt: string | null;
};

export async function uploadToStorage(file: Blob, fileType: StorageFileType): Promise<StoredUpload> {
  const contentType = file.type || "application/octet-stream";
  const presign = await eachlabsRequest(
    "/v1/upload/presign",
    { method: "POST", body: JSON.stringify({ content_type: contentType, file_type: fileType }) },
    "uploadPresign",
  );

  const { id, presigned_url: presignedUrl, public_url: publicUrl } = presign;
  if (typeof presignedUrl !== "string" || typeof publicUrl !== "string") {
    throw new EachlabsProviderError("eachlabs presign response is missing the upload URL", {
      operation: "uploadPresign",
      response: presign,
    });
  }

  const requiredHeaders =
    presign.required_headers && typeof presign.required_headers === "object"
      ? (presign.required_headers as Record<string, string>)
      : {};

  const put = await fetch(presignedUrl, {
    method: "PUT",
    headers: { ...requiredHeaders, "Content-Type": contentType },
    body: file,
  });
  if (!put.ok) {
    throw new EachlabsProviderError(`Uploading to eachlabs storage failed (${put.status})`, {
      operation: "uploadPut",
      httpStatus: put.status,
      response: await put.text().catch(() => null),
    });
  }

  return {
    id: typeof id === "string" ? id : "",
    url: publicUrl,
    expiresAt: typeof presign.expires_at === "string" ? presign.expires_at : null,
  };
}

/** Best effort: used to clean up after a failed save, never throws. */
export async function deleteFromStorage(id: string | null | undefined): Promise<void> {
  if (!id) return;
  try {
    await eachlabsRequest(`/v1/files/${encodeURIComponent(id)}`, { method: "DELETE" }, "deleteFile");
  } catch (error) {
    console.error("[creative-library] could not delete eachlabs file", id, error);
  }
}
