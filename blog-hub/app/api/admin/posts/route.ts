import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { notifySite } from "@/lib/revalidate";
import type { PostStatus } from "@/lib/types";

export const runtime = "nodejs";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** GET /api/admin/posts?site=rawr-site — list posts (all statuses) for admin. */
export async function GET(req: NextRequest) {
  const site = new URL(req.url).searchParams.get("site");

  let query = supabaseAdmin
    .from("posts")
    .select("id, site_id, slug, title, status, updated_at, published_at")
    .order("updated_at", { ascending: false });

  if (site) query = query.eq("site_id", site);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

/** POST /api/admin/posts — create a post. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    site_id,
    title,
    slug,
    excerpt,
    content,
    cover_image_url,
    tags,
    author,
    seo_title,
    seo_description,
    status = "draft",
  } = body as Record<string, unknown>;

  if (!site_id || !title) {
    return NextResponse.json(
      { error: "site_id and title are required" },
      { status: 400 },
    );
  }

  const finalStatus = (status as PostStatus) === "published" ? "published" : "draft";

  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert({
      site_id,
      title,
      slug: (slug as string) ? slugify(slug as string) : slugify(title as string),
      excerpt: excerpt ?? null,
      content: content ?? "",
      cover_image_url: cover_image_url ?? null,
      tags: Array.isArray(tags) ? tags : [],
      author: author ?? null,
      seo_title: seo_title ?? null,
      seo_description: seo_description ?? null,
      status: finalStatus,
      published_at: finalStatus === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (finalStatus === "published") {
    await notifySite(data.site_id, data.slug);
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
