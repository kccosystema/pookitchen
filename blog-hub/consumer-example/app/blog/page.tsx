// Example blog index for a consumer site. Style it however that site looks —
// the hub only supplies data.
import Link from "next/link";
import { getPosts } from "@/lib/posts";

export default async function BlogIndex() {
  const posts = await getPosts();

  return (
    <main>
      <h1>Blog</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            {p.excerpt && <p>{p.excerpt}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
