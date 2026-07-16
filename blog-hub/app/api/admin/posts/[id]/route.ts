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

/** GET /api/admin/posts/:id — full post for the editor. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ post: data });
}

/** PATCH /api/admin/posts/:id — update a post (and revalidate its site). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;

  // Read current status so we know whether we're transitioning to published.
  const { data: current, error: readErr } = await supabaseAdmin
    .from("posts")
    .select("status, site_id, published_at")
    .eq("id", id)
    .single();
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 404 });

  const patch: Record<string, unknown> = {};
  const fields = [
    "title",
    "excerpt",
    "content",
    "cover_image_url",
    "tags",
    "author",
    "seo_title",
    "seo_description",
    "status",
  ];
  for (const f of fields) if (f in body) patch[f] = body[f];
  if (typeof body.slug === "string") patch.slug = slugify(body.slug);

  // Stamp published_at the first time a post becomes published.
  const newStatus = (patch.status as PostStatus) ?? current.status;
  if (newStatus === "published" && !current.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("posts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Ping the site if the post is (or just became) published.
  if (newStatus === "published") {
    await notifySite(data.site_id, data.slug);
  }

  return NextResponse.json({ post: data });
}

/** DELETE /api/admin/posts/:id — delete a post (and revalidate its site). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("posts")
    .delete()
    .eq("id", id)
    .select("site_id, slug, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (data?.status === "published") {
    await notifySite(data.site_id, data.slug);
  }

  return NextResponse.json({ ok: true });
}
