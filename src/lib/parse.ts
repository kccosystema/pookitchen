import type { PostMeta } from './types';

const META_OPEN = '<<<META';
const META_CLOSE = 'META>>>';
const ERROR_OPEN = '<<<ERROR';
const ERROR_CLOSE = 'ERROR>>>';

export interface ParsedStream {
  /** Parsed metadata, once the META block has fully arrived and parsed. */
  meta: PostMeta | null;
  /** Markdown body received so far. */
  body: string;
  /** Server-reported error surfaced mid-stream, if any. */
  error: string | null;
  /** True while the META block is still arriving. */
  awaitingMeta: boolean;
}

/**
 * Length of the longest suffix of `text` that is a proper prefix of `marker`.
 * Used to hide a delimiter that is still arriving, so half of `<<<ERROR` never
 * flashes into the rendered body.
 */
function trailingPartial(text: string, marker: string): number {
  const max = Math.min(text.length, marker.length - 1);
  for (let n = max; n > 0; n--) {
    if (text.endsWith(marker.slice(0, n))) return n;
  }
  return 0;
}

function coerceMeta(raw: unknown): PostMeta {
  const o = (raw ?? {}) as Record<string, unknown>;
  const strArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

  return {
    titleOptions: strArray(o.titleOptions),
    metaDescription: typeof o.metaDescription === 'string' ? o.metaDescription : '',
    slug: typeof o.slug === 'string' ? o.slug : '',
    primaryKeyword: typeof o.primaryKeyword === 'string' ? o.primaryKeyword : '',
    secondaryKeywords: strArray(o.secondaryKeywords),
    searchIntent: typeof o.searchIntent === 'string' ? o.searchIntent : '',
    internalLinkIdeas: strArray(o.internalLinkIdeas),
  };
}

/**
 * Parses the raw model output into metadata + body. Safe to call on every
 * chunk: it is a pure function of the accumulated text.
 */
export function parseStream(raw: string): ParsedStream {
  let text = raw;
  let error: string | null = null;

  const errStart = text.indexOf(ERROR_OPEN);
  if (errStart !== -1) {
    const errEnd = text.indexOf(ERROR_CLOSE, errStart);
    error = text
      .slice(errStart + ERROR_OPEN.length, errEnd === -1 ? undefined : errEnd)
      .trim();
    text = text.slice(0, errStart);
  }

  const open = text.indexOf(META_OPEN);
  if (open === -1) {
    // The opening marker may still be arriving one character at a time. While
    // the whole response so far is a prefix of it, there is no body yet.
    if (META_OPEN.startsWith(text.trimStart()) && text.trim().length > 0) {
      return { meta: null, body: '', error, awaitingMeta: true };
    }
    // No META block at all — treat everything as body (defensive: the model
    // should always emit one, but a stray response shouldn't render as blank).
    const bodyOnly = text.trimStart();
    return {
      meta: null,
      body: bodyOnly.slice(0, bodyOnly.length - trailingPartial(bodyOnly, ERROR_OPEN)),
      error,
      awaitingMeta: text.trim().length === 0,
    };
  }

  const close = text.indexOf(META_CLOSE, open);
  if (close === -1) {
    return { meta: null, body: '', error, awaitingMeta: true };
  }

  const jsonText = text.slice(open + META_OPEN.length, close).trim();
  let meta: PostMeta | null = null;
  try {
    meta = coerceMeta(JSON.parse(jsonText));
  } catch {
    meta = null;
  }

  const rest = text.slice(close + META_CLOSE.length).replace(/^\s+/, '');
  const body = rest.slice(0, rest.length - trailingPartial(rest, ERROR_OPEN));
  return { meta, body, error, awaitingMeta: false };
}

/** Word count of the rendered body, ignoring markdown syntax noise. */
export function countWords(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`|\-]/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const words = plain.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/** Rebuilds a full markdown document including a YAML front-matter header. */
export function toMarkdownFile(meta: PostMeta | null, body: string): string {
  if (!meta) return body;
  const yamlList = (items: string[]) =>
    items.map((i) => `  - ${JSON.stringify(i)}`).join('\n');

  return [
    '---',
    `title: ${JSON.stringify(meta.titleOptions[0] ?? '')}`,
    `slug: ${JSON.stringify(meta.slug)}`,
    `description: ${JSON.stringify(meta.metaDescription)}`,
    `primary_keyword: ${JSON.stringify(meta.primaryKeyword)}`,
    'secondary_keywords:',
    yamlList(meta.secondaryKeywords),
    '---',
    '',
    body,
  ].join('\n');
}
