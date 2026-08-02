export interface Brief {
  topic: string;
  primaryKeyword: string;
  audience: string;
  tone: string;
  wordCount: number;
  notes: string;
}

export interface PostMeta {
  titleOptions: string[];
  metaDescription: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  internalLinkIdeas: string[];
}

export interface SavedPost {
  id: string;
  createdAt: number;
  brief: Brief;
  meta: PostMeta | null;
  body: string;
}

export const TONES = [
  'Clear and practical',
  'Friendly and conversational',
  'Authoritative and expert',
  'Punchy and opinionated',
  'Warm and story-driven',
] as const;

export const emptyBrief = (): Brief => ({
  topic: '',
  primaryKeyword: '',
  audience: '',
  tone: TONES[0],
  wordCount: 1200,
  notes: '',
});
