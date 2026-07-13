import React from 'react';
import {
  Upload,
  Trash2,
  Search,
  Image as ImageIcon,
  Check,
  LogOut,
  Loader2,
  Link2,
  X,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { AnimatePresence, motion } from 'motion/react';
import { cn, formatBytes, timeAgo } from './utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CdnImage {
  id: string; // blob pathname (unique)
  pathname: string;
  original_name: string;
  url: string;
  size: number;
  created_at: string;
}

type AuthState = { ok: boolean; storageReady: boolean };

// ---------------------------------------------------------------------------
// API client (Vercel Blob backed)
// ---------------------------------------------------------------------------
const api = (token: string) => {
  const headers = { Authorization: `Bearer ${token}` };
  return {
    // Probing /api/images doubles as the auth + storage-readiness check.
    async check(): Promise<AuthState> {
      const r = await fetch('/api/images', { headers });
      if (r.status === 401) return { ok: false, storageReady: false };
      if (r.status === 503) return { ok: true, storageReady: false };
      return { ok: r.ok, storageReady: r.ok };
    },
    async list(): Promise<CdnImage[]> {
      const r = await fetch('/api/images', { headers });
      if (!r.ok) throw new Error('Failed to load images');
      return r.json();
    },
    async upload(files: File[]): Promise<CdnImage[]> {
      const results = await Promise.all(
        files.map(async (f) => {
          const blob = await upload(f.name, f, {
            access: 'public',
            handleUploadUrl: '/api/blob-upload',
            clientPayload: token,
          });
          return {
            id: blob.pathname,
            pathname: blob.pathname,
            original_name: blob.pathname,
            url: blob.url,
            size: f.size,
            created_at: new Date().toISOString(),
          } satisfies CdnImage;
        })
      );
      return results;
    },
    async remove(url: string) {
      const r = await fetch('/api/images', {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!r.ok) throw new Error('Delete failed');
    },
  };
};

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
type Toast = { id: number; message: string; kind: 'ok' | 'err' };
const ToastContext = React.createContext<(m: string, k?: 'ok' | 'err') => void>(() => {});

function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((message: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur',
                t.kind === 'ok'
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-500/90 text-white'
              )}
            >
              {t.kind === 'ok' ? <Check size={16} /> : <X size={16} />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
const useToast = () => React.useContext(ToastContext);

// ---------------------------------------------------------------------------
// Token gate
// ---------------------------------------------------------------------------
function TokenGate({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [token, setToken] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { ok } = await api(token).check();
      if (!ok) throw new Error();
      localStorage.setItem('cdn_token', token);
      onAuthed(token);
    } catch {
      setError('That token was rejected. Check CDN_TOKEN on the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
            <KeyRound size={24} />
          </div>
          <h1 className="text-xl font-bold text-white">Pooki CDN</h1>
          <p className="mt-1 text-sm text-zinc-400">Enter your API token to continue.</p>
        </div>
        <input
          type="password"
          autoFocus
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="API token"
          className="w-full rounded-lg border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
        />
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !token}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Unlock'}
        </button>
      </motion.form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storage-not-configured banner
// ---------------------------------------------------------------------------
function StorageSetupNotice() {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
      <div className="mb-2 flex items-center gap-2 font-semibold text-amber-300">
        <AlertTriangle size={16} />
        Storage isn&apos;t connected yet
      </div>
      <p className="text-amber-100/80">
        Your token works, but this project has no Blob store attached. In the Vercel
        dashboard:
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-100/80">
        <li>
          Open <span className="font-medium text-amber-100">Storage → Create Database → Blob</span>{' '}
          and connect it to this project (this adds <code>BLOB_READ_WRITE_TOKEN</code>).
        </li>
        <li>
          Confirm the <code>CDN_TOKEN</code> environment variable is set.
        </li>
        <li>Redeploy. Uploads will work immediately after.</li>
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload zone
// ---------------------------------------------------------------------------
function UploadZone({
  onUploaded,
  token,
  disabled,
}: {
  onUploaded: (imgs: CdnImage[]) => void;
  token: string;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFiles = async (fileList: FileList | null) => {
    if (disabled) return;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return toast('Only image files are supported.', 'err');
    setBusy(true);
    try {
      const created = await api(token).upload(files);
      onUploaded(created);
      toast(`Uploaded ${created.length} image${created.length > 1 ? 's' : ''}.`);
    } catch (e: any) {
      toast(e?.message || 'Upload failed.', 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition',
        disabled
          ? 'cursor-not-allowed border-white/10 bg-zinc-900/30 opacity-60'
          : 'cursor-pointer',
        !disabled && dragging
          ? 'border-indigo-400 bg-indigo-500/10'
          : !disabled && 'border-white/15 bg-zinc-900/50 hover:border-white/30 hover:bg-zinc-900'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400">
        {busy ? <Loader2 size={26} className="animate-spin" /> : <Upload size={26} />}
      </div>
      <div>
        <p className="font-semibold text-white">
          {busy ? 'Uploading…' : 'Drop images here or click to upload'}
        </p>
        <p className="mt-0.5 text-sm text-zinc-500">
          PNG, JPG, GIF, WebP, AVIF, SVG · up to 25MB each
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Copy helper
// ---------------------------------------------------------------------------
function useCopy() {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const toast = useToast();
  const copy = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast(`${label} copied.`);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1400);
    } catch {
      toast('Could not copy to clipboard.', 'err');
    }
  };
  return { copiedKey, copy };
}

// ---------------------------------------------------------------------------
// Image card
// ---------------------------------------------------------------------------
function ImageCard({
  img,
  token,
  onDeleted,
}: {
  img: CdnImage;
  token: string;
  onDeleted: (id: string) => void;
}) {
  const { copiedKey, copy } = useCopy();
  const toast = useToast();

  const del = async () => {
    if (!confirm(`Delete "${img.original_name}"? This cannot be undone.`)) return;
    try {
      await api(token).remove(img.url);
      onDeleted(img.id);
      toast('Image deleted.');
    } catch {
      toast('Delete failed.', 'err');
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
    >
      <a
        href={img.url}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-square overflow-hidden bg-[repeating-conic-gradient(#27272a_0_25%,#18181b_0_50%)] bg-[length:20px_20px]"
      >
        <img
          src={img.url}
          alt={img.original_name}
          loading="lazy"
          className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
        />
      </a>

      <div className="space-y-2 p-3">
        <span
          className="block truncate text-sm font-medium text-white"
          title={img.original_name}
        >
          {img.original_name}
        </span>

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{img.size ? formatBytes(img.size) : ''}</span>
          <span>{timeAgo(img.created_at)}</span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <CopyBtn
            active={copiedKey === 'url'}
            onClick={() => copy(img.url, 'url', 'URL')}
            icon={<Link2 size={13} />}
            label="URL"
          />
          <CopyBtn
            active={copiedKey === 'md'}
            onClick={() => copy(`![${img.original_name}](${img.url})`, 'md', 'Markdown')}
            icon={<span className="text-[11px] font-bold">MD</span>}
            label="MD"
          />
          <CopyBtn
            active={copiedKey === 'html'}
            onClick={() =>
              copy(`<img src="${img.url}" alt="${img.original_name}" />`, 'html', 'HTML')
            }
            icon={<span className="text-[11px] font-bold">&lt;/&gt;</span>}
            label="HTML"
          />
          <button
            onClick={del}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-rose-500/15 hover:text-rose-400"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CopyBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={`Copy ${label}`}
      className={cn(
        'flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium transition',
        active
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
      )}
    >
      {active ? <Check size={13} /> : icon}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function Dashboard({
  token,
  storageReady,
  onLogout,
}: {
  token: string;
  storageReady: boolean;
  onLogout: () => void;
}) {
  const [images, setImages] = React.useState<CdnImage[]>([]);
  const [loading, setLoading] = React.useState(storageReady);
  const [query, setQuery] = React.useState('');
  const toast = useToast();

  const load = React.useCallback(async () => {
    if (!storageReady) {
      setLoading(false);
      return;
    }
    try {
      setImages(await api(token).list());
    } catch {
      toast('Could not load your library.', 'err');
    } finally {
      setLoading(false);
    }
  }, [token, storageReady, toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return images;
    return images.filter((i) => i.original_name.toLowerCase().includes(q));
  }, [images, query]);

  const totalSize = images.reduce((sum, i) => sum + (i.size || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
              <ImageIcon size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">Pooki CDN</h1>
              <p className="text-[11px] text-zinc-500">
                {images.length} image{images.length !== 1 ? 's' : ''} · {formatBytes(totalSize)}
              </p>
            </div>
          </div>

          <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search images…"
              className="w-full rounded-lg border border-white/10 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            title="Sign out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {!storageReady && <StorageSetupNotice />}

        <UploadZone
          token={token}
          disabled={!storageReady}
          onUploaded={(imgs) => setImages((prev) => [...imgs, ...prev])}
        />

        {storageReady && (
          <>
            <div className="mt-4 sm:hidden">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search images…"
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 text-zinc-500">
                <Loader2 className="animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-zinc-500">
                <ImageIcon size={40} className="mb-3 opacity-40" />
                <p className="font-medium text-zinc-400">
                  {images.length === 0 ? 'No images yet' : 'No matches'}
                </p>
                <p className="text-sm">
                  {images.length === 0
                    ? 'Upload your first image to get started.'
                    : 'Try a different search.'}
                </p>
              </div>
            ) : (
              <motion.div
                layout
                className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((img) => (
                    <ImageCard
                      key={img.id}
                      img={img}
                      token={token}
                      onDeleted={(id) =>
                        setImages((prev) => prev.filter((x) => x.id !== id))
                      }
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
export default function App() {
  const [token, setToken] = React.useState<string | null>(null);
  const [storageReady, setStorageReady] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const authenticate = React.useCallback(async (t: string) => {
    const { ok, storageReady } = await api(t).check();
    if (ok) {
      setToken(t);
      setStorageReady(storageReady);
    }
    return ok;
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem('cdn_token');
    if (!saved) {
      setReady(true);
      return;
    }
    authenticate(saved)
      .then((ok) => {
        if (!ok) localStorage.removeItem('cdn_token');
      })
      .finally(() => setReady(true));
  }, [authenticate]);

  const logout = () => {
    localStorage.removeItem('cdn_token');
    setToken(null);
  };

  if (!ready)
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-600">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <ToastHost>
      {token ? (
        <Dashboard token={token} storageReady={storageReady} onLogout={logout} />
      ) : (
        <TokenGate
          onAuthed={(t) => {
            // Re-run the check so we also learn storage readiness.
            authenticate(t);
          }}
        />
      )}
    </ToastHost>
  );
}
