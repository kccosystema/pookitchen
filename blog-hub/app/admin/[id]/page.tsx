import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { Site, Post } from "@/lib/types";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: sites }, { data: post }] = await Promise.all([
    supabaseAdmin.from("sites").select("*").order("name").returns<Site[]>(),
    supabaseAdmin.from("posts").select("*").eq("id", id).single<Post>(),
  ]);

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Link href="/admin" className="mb-6 inline-block text-sm underline">
        ← Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Edit post</h1>
      <PostEditor sites={sites ?? []} post={post} />
    </main>
  );
}
