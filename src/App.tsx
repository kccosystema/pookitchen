import { useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { BriefForm } from './components/BriefForm';
import { CopyButton } from './components/CopyButton';
import { MetaPanel } from './components/MetaPanel';
import { SavedList } from './components/SavedList';
import { countWords, parseStream, toMarkdownFile } from './lib/parse';
import { deletePost, loadPosts, newId, savePost } from './lib/storage';
import { emptyBrief, type Brief, type SavedPost } from './lib/types';

export default function App() {
  const [brief, setBrief] = useState<Brief>(emptyBrief);
  const [raw, setRaw] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosts(loadPosts());
  }, []);

  const parsed = useMemo(() => parseStream(raw), [raw]);
  const wordCount = useMemo(() => countWords(parsed.body), [parsed.body]);
  const hasOutput = parsed.body.length > 0 || parsed.meta !== null || isGenerating;

  // Keep the newest text in view while streaming, unless the user scrolled up.
  useEffect(() => {
    const el = outputRef.current;
    if (!el || !isGenerating) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 240) {
      el.scrollTop = el.scrollHeight;
    }
  }, [raw, isGenerating]);

  const generate = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    const currentBrief = { ...brief };

    setRaw('');
    setFatalError(null);
    setIsGenerating(true);
    setActiveId(null);

    let accumulated = '';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(currentBrief),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const detail = await res
          .json()
          .then((j: { error?: string }) => j.error)
          .catch(() => null);
        throw new Error(detail || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setRaw(accumulated);
      }
      accumulated += decoder.decode();
      setRaw(accumulated);
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setFatalError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;

      const result = parseStream(accumulated);
      if (result.body.trim().length > 0) {
        const post: SavedPost = {
          id: newId(),
          createdAt: Date.now(),
          brief: currentBrief,
          meta: result.meta,
          body: result.body,
        };
        setPosts((prev) => savePost(prev, post));
        setActiveId(post.id);
      }
    }
  };

  const stop = () => abortRef.current?.abort();

  const openPost = (post: SavedPost) => {
    stop();
    setBrief(post.brief);
    setFatalError(null);
    setActiveId(post.id);
    setRaw(
      post.meta
        ? `<<<META\n${JSON.stringify(post.meta)}\nMETA>>>\n\n${post.body}`
        : post.body,
    );
  };

  const removePost = (id: string) => {
    setPosts((prev) => deletePost(prev, id));
    if (id === activeId) {
      setActiveId(null);
      setRaw('');
    }
  };

  const downloadMarkdown = () => {
    const file = toMarkdownFile(parsed.meta, parsed.body);
    const name = parsed.meta?.slug || 'blog-post';
    const url = URL.createObjectURL(new Blob([file], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const targetDelta = wordCount - brief.wordCount;
  const onTarget = Math.abs(targetDelta) <= brief.wordCount * 0.15;

  return (
    <div className="flex min-h-full flex-col lg:h-full lg:flex-row">
      {/* Sidebar */}
      <aside className="flex shrink-0 flex-col border-b border-ink-200 bg-white lg:h-full lg:w-[360px] lg:border-r lg:border-b-0 dark:border-ink-700 dark:bg-ink-900">
        <header className="flex items-center gap-2.5 border-b border-ink-200 px-5 py-4 dark:border-ink-700">
          <div className="flex size-8 items-center justify-center rounded-lg bg-moss-600 text-sm font-bold text-white">
            P
          </div>
          <div className="leading-tight">
            <h1 className="font-serif text-base font-semibold text-ink-900 dark:text-ink-50">
              Pookitchen
            </h1>
            <p className="text-xs text-ink-400 dark:text-ink-500">SEO blog generator</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <BriefForm
            brief={brief}
            onChange={setBrief}
            onSubmit={generate}
            onStop={stop}
            isGenerating={isGenerating}
          />

          <div className="mt-7 border-t border-ink-200 pt-5 dark:border-ink-700">
            <h2 className="mb-3 text-[0.7rem] font-semibold tracking-[0.08em] text-ink-500 uppercase dark:text-ink-400">
              Saved posts
            </h2>
            <SavedList
              posts={posts}
              activeId={activeId}
              onOpen={openPost}
              onDelete={removePost}
            />
          </div>
        </div>
      </aside>

      {/* Output */}
      <main ref={outputRef} className="flex-1 overflow-y-auto">
        {fatalError && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {fatalError}
          </div>
        )}
        {parsed.error && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            {parsed.error}
          </div>
        )}

        {!hasOutput ? (
          <EmptyState />
        ) : (
          <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
            {parsed.awaitingMeta && !parsed.meta && (
              <p className="flex items-center gap-2 text-sm text-ink-400 dark:text-ink-500">
                <span className="size-1.5 animate-pulse rounded-full bg-moss-500" />
                Researching angle, keywords, and structure…
              </p>
            )}

            {parsed.meta && <MetaPanel meta={parsed.meta} />}

            {parsed.body && (
              <>
                <div className="mt-8 mb-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-5 dark:border-ink-700">
                  <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-ink-500 uppercase dark:text-ink-400">
                    Draft
                    <span
                      className={
                        'ml-2 normal-case tabular-nums ' +
                        (onTarget
                          ? 'text-moss-600 dark:text-moss-300'
                          : 'text-ink-400 dark:text-ink-500')
                      }
                    >
                      {wordCount.toLocaleString()} words
                    </span>
                  </span>
                  <span className="flex gap-2">
                    <CopyButton
                      text={toMarkdownFile(parsed.meta, parsed.body)}
                      label="Copy markdown"
                    />
                    <button
                      type="button"
                      onClick={downloadMarkdown}
                      className="rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-600 transition hover:border-moss-400 hover:text-moss-600 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:text-moss-300"
                    >
                      Download .md
                    </button>
                  </span>
                </div>

                <article className="prose-post">
                  <Markdown remarkPlugins={[remarkGfm]}>{parsed.body}</Markdown>
                  {isGenerating && <span className="streaming-caret" />}
                </article>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center px-8 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-xl bg-moss-600/10 dark:bg-moss-500/15">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-moss-600 dark:text-moss-300"
          >
            <path d="M4 4h10l6 6v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
            <path d="M14 4v6h6M8 13h8M8 17h5" />
          </svg>
        </div>
        <h2 className="font-serif text-xl font-semibold text-ink-900 dark:text-ink-50">
          Describe the post you want
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
          You'll get title options, a meta description, a slug, a structured draft with an
          FAQ block, and internal link suggestions — ready to paste into your CMS.
        </p>
      </div>
    </div>
  );
}
