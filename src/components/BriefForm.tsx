import { TONES, type Brief } from '../lib/types';

interface Props {
  brief: Brief;
  onChange: (brief: Brief) => void;
  onSubmit: () => void;
  onStop: () => void;
  isGenerating: boolean;
}

const labelClass =
  'block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink-500 dark:text-ink-400 mb-1.5';

const fieldClass =
  'w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 ' +
  'placeholder:text-ink-300 outline-none transition focus:border-moss-500 ' +
  'focus:ring-2 focus:ring-moss-500/20 dark:border-ink-700 dark:bg-ink-800 ' +
  'dark:text-ink-100 dark:placeholder:text-ink-500';

export function BriefForm({ brief, onChange, onSubmit, onStop, isGenerating }: Props) {
  const set = <K extends keyof Brief>(key: K, value: Brief[K]) =>
    onChange({ ...brief, [key]: value });

  const canSubmit = brief.topic.trim().length > 2;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit && !isGenerating) onSubmit();
      }}
    >
      <div>
        <label className={labelClass} htmlFor="topic">
          What should the post be about?
        </label>
        <textarea
          id="topic"
          rows={3}
          className={`${fieldClass} resize-y`}
          placeholder="How small credit unions can compete with big banks on digital experience"
          value={brief.topic}
          onChange={(e) => set('topic', e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="keyword">
          Primary keyword <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="keyword"
          className={fieldClass}
          placeholder="credit union digital banking"
          value={brief.primaryKeyword}
          onChange={(e) => set('primaryKeyword', e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="audience">
          Audience
        </label>
        <input
          id="audience"
          className={fieldClass}
          placeholder="Marketing leads at regional credit unions"
          value={brief.audience}
          onChange={(e) => set('audience', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="tone">
            Tone
          </label>
          <select
            id="tone"
            className={fieldClass}
            value={brief.tone}
            onChange={(e) => set('tone', e.target.value)}
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="words">
            Words
          </label>
          <input
            id="words"
            type="number"
            min={300}
            max={3000}
            step={100}
            className={fieldClass}
            value={brief.wordCount}
            onChange={(e) => set('wordCount', Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          Must-include notes <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          className={`${fieldClass} resize-y`}
          placeholder="Mention our onboarding checklist. Avoid comparisons to specific competitors."
          value={brief.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      {isGenerating ? (
        <button
          type="button"
          onClick={onStop}
          className="w-full rounded-lg border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-100 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700"
        >
          Stop generating
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-moss-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss-700 disabled:cursor-not-allowed disabled:bg-ink-300 dark:disabled:bg-ink-700 dark:disabled:text-ink-500"
        >
          Generate post
        </button>
      )}
    </form>
  );
}
