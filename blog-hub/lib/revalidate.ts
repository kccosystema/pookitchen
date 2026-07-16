import { supabaseAdmin } from "./supabase";
import type { Site } from "./types";

/**
 * Notify a consumer site that its content changed, so it can revalidate just
 * its own pages instead of waiting for the next scheduled rebuild.
 *
 * The consumer site exposes an endpoint (see consumer-example/) that calls
 * Next.js `revalidatePath` / `revalidateTag`. We POST to it with the shared
 * secret. Best-effort: failures are logged, not thrown, so publishing still
 * succeeds even if a site is down.
 */
export async function notifySite(siteId: string, changedSlug?: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("sites")
    .select("id, revalidate_url, revalidate_secret")
    .eq("id", siteId)
    .single<Pick<Site, "id" | "revalidate_url" | "revalidate_secret">>();

  if (!data?.revalidate_url) return;

  try {
    await fetch(data.revalidate_url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(data.revalidate_secret
          ? { "x-revalidate-secret": data.revalidate_secret }
          : {}),
      },
      body: JSON.stringify({ site: siteId, slug: changedSlug ?? null }),
    });
  } catch (err) {
    console.error(`Revalidation ping to ${siteId} failed:`, err);
  }
}
