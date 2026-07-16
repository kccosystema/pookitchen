// Example single-post page for a consumer site, with SEO metadata pulled from
// the hub. Render markdown with your site's preferred renderer.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPost } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      {post.cover_image_url && <img src={post.cover_image_url} alt="" />}
      <ReactMarkdown>{post.content}</ReactMarkdown>
    </article>
  );
}
