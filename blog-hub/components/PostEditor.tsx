"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Post, Site, PostStatus, GeneratedDraft } from "@/lib/types";

interface Props {
  sites: Site[];
  /** Present in edit mode; undefined in create mode. */
  post?: Post;
}

export default function PostEditor({ sites, post }: Props) {
  const router = useRouter();
  const isEdit = Boolean(post);

  const [siteId, setSiteId] = useState(post?.site_id ?? sites[0]?.id ?? "");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seo_description ?? "");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");

  const [topic, setTopic] = useState("");
  const [guidance, setGuidance] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");

  const siteName = sites.find((s) => s.id === siteId)?.name ?? siteId;

  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteName, topic, guidance }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Generation failed");
      const { draft } = (await res.json()) as { draft: GeneratedDraft };
      setTitle(draft.title);
      setSlug(draft.slug);
      setExcerpt(draft.excerpt);
      setContent(draft.content);
      setTags(draft.tags.join(", "));
      setSeoTitle(draft.seo_title);
      setSeoDescription(draft.seo_description);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function save(nextStatus?: PostStatus) {
    setSaving(true);
    setError("");
    const payload = {
      site_id: siteId,
      title,
      slug,
      excerpt,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      seo_title: seoTitle,
      seo_description: seoDescription,
      status: nextStatus ?? status,
    };
    try {
      const res = await fetch(
        isEdit ? `/api/admin/posts/${post!.id}` : "/api/admin/posts",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      if (nextStatus) setStatus(nextStatus);
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!post || !confirm("Delete this post permanently?")) return;
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    router.push("/admin");
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className={inputCls + " max-w-xs"}
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              status === "published"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
            }`}
          >
            {status}
          </span>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className={inputCls + " text-lg font-semibold"}
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="url-slug (auto from title if blank)"
          className={inputCls + " font-mono text-sm"}
        />
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt / summary"
          rows={2}
          className={inputCls}
        />

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-500">
            Content (Markdown)
          </label>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-sm underline"
          >
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        {preview ? (
          <article className="prose min-h-[24rem] max-w-none rounded-lg border border-neutral-200 bg-white p-4 dark:prose-invert dark:border-neutral-800 dark:bg-neutral-900">
            <ReactMarkdown>{content || "_Nothing to preview_"}</ReactMarkdown>
          </article>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write in Markdown, or generate a draft →"
            rows={20}
            className={inputCls + " font-mono text-sm"}
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => save()}
            disabled={saving}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            {status === "published" ? "Update & re-publish" : "Publish"}
          </button>
          {isEdit && status === "published" && (
            <button
              onClick={() => save("draft")}
              disabled={saving}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Unpublish
            </button>
          )}
          {isEdit && (
            <button
              onClick={remove}
              className="ml-auto rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Sidebar: AI generation + SEO */}
      <aside className="flex flex-col gap-6">
        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="mb-2 font-semibold">✨ Generate with AI</h2>
          <p className="mb-3 text-xs text-neutral-500">
            Drafts a full post for <strong>{siteName}</strong>. Review and edit
            before publishing.
          </p>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic, e.g. 'best knives for home cooks'"
            className={inputCls + " mb-2 text-sm"}
          />
          <textarea
            value={guidance}
            onChange={(e) => setGuidance(e.target.value)}
            placeholder="Optional: audience, tone, keywords, length"
            rows={3}
            className={inputCls + " mb-3 text-sm"}
          />
          <button
            onClick={generate}
            disabled={generating || !topic.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {generating ? "Generating…" : "Generate draft"}
          </button>
        </section>

        <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="mb-3 font-semibold">SEO & meta</h2>
          <label className="mb-1 block text-xs text-neutral-500">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className={inputCls + " mb-3 text-sm"}
          />
          <label className="mb-1 block text-xs text-neutral-500">SEO title</label>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className={inputCls + " mb-3 text-sm"}
          />
          <label className="mb-1 block text-xs text-neutral-500">SEO description</label>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={3}
            className={inputCls + " text-sm"}
          />
        </section>
      </aside>
    </div>
  );
}
