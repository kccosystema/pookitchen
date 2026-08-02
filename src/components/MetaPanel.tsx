import type { PostMeta } from '../lib/types';
import { CopyButton } from './CopyButton';

interface Props {
  meta: PostMeta;
}

const cardClass =
  'rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-700 dark:bg-ink-800/60';

const headingClass =
  'text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink-500 dark:text-ink-400';

function lengthTone(len: number, min: number, max: number): string {
  if (len === 0) return 'text-ink-400';
  if (len < min || len > max) return 'text-amber-600 dark:text-amber-400';
  return 'text-moss-600 dark:text-moss-300';
}

export function MetaPanel({ meta }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className={`${cardClass} sm:col-span-2`}>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h3 className={headingClass}>Title options</h3>
          <span className="text-[0.7rem] text-ink-400">50–60 chars ideal</span>
        </div>
        <ul className="space-y-2">
          {meta.titleOptions.map((title, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <span className="font-serif text-[0.95rem] leading-snug text-ink-800 dark:text-ink-100">
                {title}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-xs tabular-nums ${lengthTone(title.length, 50, 60)}`}
                >
                  {title.length}
                </span>
                <CopyButton text={title} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cardClass} sm:col-span-2`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className={headingClass}>Meta description</h3>
          <span className="flex items-center gap-2">
            <span
              className={`text-xs tabular-nums ${lengthTone(meta.metaDescription.length, 145, 158)}`}
            >
              {meta.metaDescription.length} chars
            </span>
            <CopyButton text={meta.metaDescription} />
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          {meta.metaDescription}
        </p>
      </div>

      <div className={cardClass}>
        <h3 className={`${headingClass} mb-2`}>URL slug</h3>
        <div className="flex items-center justify-between gap-2">
          <code className="truncate font-mono text-xs text-moss-600 dark:text-moss-300">
            /{meta.slug}
          </code>
          <CopyButton text={meta.slug} />
        </div>
      </div>

      <div className={cardClass}>
        <h3 className={`${headingClass} mb-2`}>Search intent</h3>
        <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          {meta.searchIntent}
        </p>
      </div>

      <div className={`${cardClass} sm:col-span-2`}>
        <h3 className={`${headingClass} mb-2.5`}>Keywords</h3>
        <div className="flex flex-wrap gap-1.5">
          {meta.primaryKeyword && (
            <span className="rounded-full bg-moss-600 px-2.5 py-1 text-xs font-medium text-white">
              {meta.primaryKeyword}
            </span>
          )}
          {meta.secondaryKeywords.map((k) => (
            <span
              key={k}
              className="rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-600 dark:bg-ink-700 dark:text-ink-200"
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      {meta.internalLinkIdeas.length > 0 && (
        <div className={`${cardClass} sm:col-span-2`}>
          <h3 className={`${headingClass} mb-2.5`}>Internal link ideas</h3>
          <ul className="space-y-1.5">
            {meta.internalLinkIdeas.map((idea, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200"
              >
                <span className="mt-[0.45em] size-1 shrink-0 rounded-full bg-moss-400" />
                {idea}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
