import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

// Authorizes browser-direct uploads to Vercel Blob. The browser calls this
// endpoint to obtain a short-lived client token; the actual bytes go straight
// from the browser to Blob storage (so we are not bound by the function's
// request-body size limit).
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Storage is not configured (missing Blob store)." }),
      { status: 503, headers: { "content-type": "application/json" } }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // The dashboard passes the API token as the clientPayload.
        if (!process.env.CDN_TOKEN || clientPayload !== process.env.CDN_TOKEN) {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: ["image/*"],
          addRandomSuffix: true,
          maximumSizeInBytes: 25 * 1024 * 1024,
        };
      },
      // Fired by Blob via webhook once the upload finishes. Nothing to persist
      // because the Blob store itself is our source of truth.
      onUploadCompleted: async () => {},
    });
    return Response.json(json);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "content-type": "application/json" },
    });
  }
}
