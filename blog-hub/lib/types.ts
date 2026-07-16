export type PostStatus = "draft" | "published";

export interface Site {
  id: string;
  name: string;
  revalidate_url: string | null;
  revalidate_secret: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  status: PostStatus;
  author: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Shape returned by the AI generation endpoint (a draft, before you edit). */
export interface GeneratedDraft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
}
