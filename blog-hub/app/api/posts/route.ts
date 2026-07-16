import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
// Cache at the edge; consumer sites can also cache. Revalidation webhooks make
// updates near-instant, so a short public cache is fine.
export const revalidate = 60;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * PUBLIC read API — consumer sites call this.
 *
 *   GET /api/posts?site=rawr-site              → list published posts for a site
 *   GET /api/posts?site=rawr-site&slug=my-post → single published post
 *   GET /api/posts?site=rawr-site&limit=5      → cap the list
 *
 * Only published posts are ever returned. No auth required (CORS open) so any
 * site can fetch its own content.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  const slug = searchParams.get("slug");
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 100);

  if (!site) {
    return NextResponse.json(
      { error: "Missing required ?site= parameter" },
      { status: 400, headers: CORS },
    );
  }

  let query = supabaseAdmin
    .from("posts")
    .select(
      "id, site_id, slug, title, excerpt, content, cover_image_url, tags, author, seo_title, seo_description, published_at",
    )
    .eq("site_id", site)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (slug) query = query.eq("slug", slug);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  if (slug) {
    const post = data?.[0];
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });
    }
    return NextResponse.json({ post }, { headers: CORS });
  }

  return NextResponse.json({ posts: data ?? [] }, { headers: CORS });
}
