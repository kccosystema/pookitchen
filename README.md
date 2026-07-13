# 📷 Pooki CDN

Your own little personal photo CDN, deployed on **Vercel** and backed by
**Vercel Blob**. Upload images once through a simple dashboard, then reuse them
across every app you build via stable, public, CDN-served URLs.

- **Drag-and-drop dashboard** — upload, search, and delete images.
- **Stable public URLs** — every image gets a permanent `*.public.blob.vercel-storage.com`
  URL served by Vercel's edge CDN. Hotlink or `fetch` it from any app.
- **One-click copy** — grab the direct URL, Markdown, or `<img>` HTML per image.
- **Token-protected** — uploading and deleting require your API token; images
  themselves are public.
- **Browser-direct uploads** — files go straight from the browser to Blob
  storage, so uploads aren't capped by the serverless function body limit.

## Architecture

| Piece            | Implementation                                             |
| ---------------- | ---------------------------------------------------------- |
| Frontend         | Vite + React + Tailwind (static, in `src/`)               |
| Upload authorize | `api/blob-upload.ts` — `@vercel/blob` `handleUpload`       |
| List / delete    | `api/images.ts` — `@vercel/blob` `list` / `del`           |
| Storage          | Vercel Blob (the store *is* the source of truth — no DB)   |

## Deploy

1. Deploy this project to Vercel (via `vercel`, the dashboard, or git import).
2. **Attach a Blob store:** in the Vercel dashboard, go to
   **Storage → Create Database → Blob** and connect it to this project. This
   automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable.
3. **Set your API token:** add an environment variable `CDN_TOKEN` with a long
   random secret. This is what you type to sign in and what authorizes uploads.
4. Redeploy. Open the deployment URL, enter your `CDN_TOKEN`, and start uploading.

Until a Blob store is attached, the dashboard signs in but shows a setup notice
instead of the uploader.

## Using it from your other apps

Every uploaded image gets a permanent, CDN-served URL. Drop it in anywhere:

```html
<img src="https://xxxx.public.blob.vercel-storage.com/logo-a1b2c3.png" alt="logo" />
```

## Local development

The dashboard is a static Vite app; the upload/list/delete endpoints are Vercel
Functions. To run everything locally you need the Vercel CLI (so the functions
and Blob store are wired up):

```bash
npm install
npm i -g vercel
vercel link                     # link to your Vercel project
vercel env pull .env.local      # pulls BLOB_READ_WRITE_TOKEN + CDN_TOKEN
vercel dev                      # runs frontend + /api functions together
```

`npm run dev` alone runs only the frontend (no upload backend), which is handy
for UI work but can't talk to Blob.

## Configuration

| Env var                 | Description                                                        |
| ----------------------- | ----------------------------------------------------------------- |
| `CDN_TOKEN`             | Secret guarding uploads/deletes and dashboard login. **Set this.** |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when you attach a Vercel Blob store.           |
