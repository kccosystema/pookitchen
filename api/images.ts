import { list, del } from "@vercel/blob";

// Lists (GET) and deletes (DELETE) images in the Blob store. Both operations
// require the API token; the images themselves are served publicly by Blob's
// own CDN, so this endpoint only guards the management surface.
export default async function handler(request: Request): Promise<Response> {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!process.env.CDN_TOKEN || token !== process.env.CDN_TOKEN) {
    return json({ error: "Invalid or missing API token." }, 401);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Authenticated, but no storage attached yet — let the UI explain the fix.
    return json({ error: "storage_not_configured" }, 503);
  }

  if (request.method === "GET") {
    const { blobs } = await list();
    const images = blobs
      .map((b) => ({
        id: b.pathname,
        pathname: b.pathname,
        original_name: b.pathname,
        url: b.url,
        size: b.size,
        created_at: b.uploadedAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at as unknown as string).getTime() -
          new Date(a.created_at as unknown as string).getTime()
      );
    return json(images);
  }

  if (request.method === "DELETE") {
    const { url } = (await request.json().catch(() => ({}))) as { url?: string };
    if (!url) return json({ error: "url is required." }, 400);
    await del(url);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
