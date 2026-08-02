import type { SavedPost } from './types';

const KEY = 'pookitchen.posts.v1';
const MAX_POSTS = 60;

export function loadPosts(): SavedPost[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedPost[];
  } catch {
    return [];
  }
}

function persist(posts: SavedPost[]): SavedPost[] {
  const trimmed = posts.slice(0, MAX_POSTS);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // Quota exceeded — drop the oldest half and retry once.
    const halved = trimmed.slice(0, Math.ceil(trimmed.length / 2));
    try {
      localStorage.setItem(KEY, JSON.stringify(halved));
      return halved;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

export function savePost(posts: SavedPost[], post: SavedPost): SavedPost[] {
  const without = posts.filter((p) => p.id !== post.id);
  return persist([post, ...without]);
}

export function deletePost(posts: SavedPost[], id: string): SavedPost[] {
  return persist(posts.filter((p) => p.id !== id));
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}
