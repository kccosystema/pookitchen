import { useState } from 'react';

interface Props {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', className = '' }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={
        'rounded-md border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium ' +
        'text-ink-600 transition hover:border-moss-400 hover:text-moss-600 ' +
        'dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300 dark:hover:text-moss-300 ' +
        className
      }
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
