import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-bold">Blog Hub</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        One place to write and generate blog posts for all your sites. Each site
        pulls its own published posts from the shared API at{" "}
        <code className="rounded bg-neutral-200 px-1 dark:bg-neutral-800">
          /api/posts?site=&lt;site-id&gt;
        </code>
        .
      </p>
      <div>
        <Link
          href="/admin"
          className="inline-block rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Open admin →
        </Link>
      </div>
    </main>
  );
}
