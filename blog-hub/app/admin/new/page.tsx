import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Site } from "@/lib/types";
import PostEditor from "@/components/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPost() {
  const { data: sites } = await supabaseAdmin
    .from("sites")
    .select("*")
    .order("name")
    .returns<Site[]>();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Link href="/admin" className="mb-6 inline-block text-sm underline">
        ← Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold">New post</h1>
      <PostEditor sites={sites ?? []} />
    </main>
  );
}
