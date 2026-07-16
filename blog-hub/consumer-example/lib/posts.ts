// Drop this into ANY consumer site (e.g. rawr-site). It reads that site's
// published posts from the central Blog Hub. Set these env vars on the site:
//
//   BLOG_HUB_URL=https://your-blog-hub.vercel.app
//   BLOG_HUB_SITE=rawr-site        // this site's id in the hub
//
// No auth needed — the hub's /api/posts is public and CORS-open.

const HUB = process.env.BLOG_HUB_URL!;
const SITE = process.env.BLOG_HUB_SITE!;

export interface HubPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string; // markdown
  cover_image_url: string | null;
  tags: string[];
  author: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
}

export async function getPosts(): Promise<HubPost[]> {
  const res = await fetch(`${HUB}/api/posts?site=${SITE}`, {
    // Incremental Static Regeneration: cache for an hour, but the hub's
    // revalidation webhook (below) refreshes instantly on publish.
    next: { revalidate: 3600, tags: [`posts:${SITE}`] },
  });
  if (!res.ok) return [];
  const { posts } = await res.json();
  return posts;
}

export async function getPost(slug: string): Promise<HubPost | null> {
  const res = await fetch(`${HUB}/api/posts?site=${SITE}&slug=${slug}`, {
    next: { revalidate: 3600, tags: [`posts:${SITE}`, `post:${SITE}:${slug}`] },
  });
  if (!res.ok) return null;
  const { post } = await res.json();
  return post;
}
