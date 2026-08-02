import type { SavedPost } from '../lib/types';

interface Props {
  posts: SavedPost[];
  activeId: string | null;
  onOpen: (post: SavedPost) => void;
  onDelete: (id: string) => void;
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SavedList({ posts, activeId, onOpen, onDelete }: Props) {
  if (posts.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-ink-400 dark:text-ink-500">
        Posts you generate are saved in this browser so you can come back to them.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {posts.map((post) => {
        const title = post.meta?.titleOptions[0] || post.brief.topic || 'Untitled post';
        const isActive = post.id === activeId;
        return (
          <li key={post.id}>
            <div
              className={
                'group flex items-start gap-2 rounded-lg px-2.5 py-2 transition ' +
                (isActive
                  ? 'bg-moss-600/10 dark:bg-moss-500/15'
                  : 'hover:bg-ink-100 dark:hover:bg-ink-800')
              }
            >
              <button
                type="button"
                onClick={() => onOpen(post)}
                className="min-w-0 flex-1 text-left"
              >
                <span
                  className={
                    'block truncate text-sm ' +
                    (isActive
                      ? 'font-medium text-moss-700 dark:text-moss-300'
                      : 'text-ink-700 dark:text-ink-200')
                  }
                >
                  {title}
                </span>
                <span className="mt-0.5 block text-xs text-ink-400 dark:text-ink-500">
                  {timeAgo(post.createdAt)}
                </span>
              </button>
              <button
                type="button"
                aria-label="Delete post"
                onClick={() => onDelete(post.id)}
                className="mt-0.5 shrink-0 rounded p-1 text-ink-300 opacity-0 transition hover:text-red-500 focus:opacity-100 group-hover:opacity-100 dark:text-ink-500"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9.5h6.6L12 4" />
                </svg>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
