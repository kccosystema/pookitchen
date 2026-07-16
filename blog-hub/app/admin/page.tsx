import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import type { Site } from "@/lib/types";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  status: string;
  updated_at: string;
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;

  const { data: sites } = await supabaseAdmin
    .from("sites")
    .select("*")
    .order("name")
    .returns<Site[]>();

  let postsQuery = supabaseAdmin
    .from("posts")
    .select("id, site_id, slug, title, status, updated_at")
    .order("updated_at", { ascending: false });
  if (site) postsQuery = postsQuery.eq("site_id", site);
  const { data: posts } = await postsQuery.returns<PostRow[]>();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Hub</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            + New post
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Site filter */}
      <nav className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin"
          className={`rounded-full px-3 py-1 ${
            !site
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-200 dark:bg-neutral-800"
          }`}
        >
          All sites
        </Link>
        {sites?.map((s) => (
          <Link
            key={s.id}
            href={`/admin?site=${s.id}`}
            className={`rounded-full px-3 py-1 ${
              site === s.id
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-200 dark:bg-neutral-800"
            }`}
          >
            {s.name}
          </Link>
        ))}
      </nav>

      {/* Posts */}
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {posts?.length ? (
          posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/${p.id}`}
                className="flex items-center justify-between gap-4 py-3 hover:opacity-70"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="text-xs text-neutral-500">
                    {p.site_id} · /{p.slug}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    p.status === "published"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  }`}
                >
                  {p.status}
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li className="py-8 text-center text-neutral-500">
            No posts yet. Create one to get started.
          </li>
        )}
      </ul>
    </main>
  );
}
