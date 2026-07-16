// Example revalidation receiver for a consumer site. The Blog Hub POSTs here
// when one of this site's posts is published, updated, or deleted, so the site
// refreshes instantly instead of waiting for the next ISR window.
//
// Set on the consumer site:   REVALIDATE_SECRET=<same value stored on the
// site's row in the hub's `sites.revalidate_secret`>
// Set the site's row in the hub: revalidate_url = https://<this-site>/api/revalidate
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { site } = (await req.json()) as { site: string; slug?: string };

  // Refresh every page tagged with this site's posts (index + all post pages).
  revalidateTag(`posts:${site}`);

  return NextResponse.json({ revalidated: true });
}
