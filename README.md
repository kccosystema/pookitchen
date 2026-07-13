# 📷 Pooki CDN

Your own little personal photo CDN. Upload images once through a simple web
dashboard, then reuse them across every app you build via stable, cacheable,
CORS-enabled URLs.

- **Drag-and-drop dashboard** — upload, search, rename, and delete images.
- **Stable public URLs** — every image is served at `/cdn/<filename>` with
  `Cache-Control: immutable` and `Access-Control-Allow-Origin: *`, so any of
  your apps can hotlink or `fetch` them.
- **One-click copy** — grab the direct URL, Markdown, or `<img>` HTML per image.
- **Token-protected writes** — uploading, renaming, and deleting require your
  API token. Serving images is always public.
- **No external services** — images live on disk, metadata in SQLite.

## Run locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set your API token (used to sign in and to authorize uploads via the API):
   ```bash
   export CDN_TOKEN="pick-a-long-random-secret"
   ```
   If you skip this, a default dev token `dev-token-change-me` is used and a
   warning is printed. **Set a real token before exposing this publicly.**
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 and enter your token.

## Using it from your other apps

Every uploaded image gets a permanent URL. Just drop it in wherever you need it:

```html
<img src="https://your-host/cdn/a1b2c3d4e5f6a7b8.png" alt="logo" />
```

Because filenames are content-unique and served with a one-year immutable
cache, browsers and CDNs in front of this can cache them aggressively.

### Uploading programmatically

```bash
curl -X POST https://your-host/api/upload \
  -H "Authorization: Bearer $CDN_TOKEN" \
  -F "files=@./photo.jpg" \
  -F "files=@./logo.png"
```

The response is a JSON array of `{ id, filename, url, size, mimetype, ... }`.

## API

Writes require `Authorization: Bearer <CDN_TOKEN>` (or `x-api-key: <token>`).

| Method   | Path                | Auth | Description                         |
| -------- | ------------------- | ---- | ----------------------------------- |
| `GET`    | `/cdn/:filename`    | —    | Serve an image (public, cacheable). |
| `GET`    | `/api/health`       | —    | Health check + image count.         |
| `GET`    | `/api/auth`         | ✓    | Validate a token.                   |
| `GET`    | `/api/images?q=`    | ✓    | List images (newest first).         |
| `POST`   | `/api/upload`       | ✓    | Upload one or more images (`files`).|
| `PATCH`  | `/api/images/:id`   | ✓    | Rename (`{ original_name }`).        |
| `DELETE` | `/api/images/:id`   | ✓    | Delete an image + its file.         |

## Configuration

| Env var           | Default              | Description                                              |
| ----------------- | -------------------- | -------------------------------------------------------- |
| `CDN_TOKEN`       | `dev-token-change-me`| Secret guarding all write operations and dashboard login.|
| `PORT`            | `3000`               | Port to listen on.                                       |
| `UPLOAD_DIR`      | `./uploads`          | Where image files are stored on disk.                   |
| `PUBLIC_BASE_URL` | (request host)       | Force the base of generated URLs, e.g. `https://cdn.you.com`. |
| `MAX_FILE_SIZE`   | `26214400` (25MB)    | Max upload size per file, in bytes.                     |

## Deploying

Build the frontend and run in production mode:

```bash
npm run build
npm start   # NODE_ENV=production tsx server.ts
```

Because images are stored on the local filesystem, deploy to a host with
**persistent disk** (a small VM, Fly.io volume, Railway, Render disk, etc.) and
point `UPLOAD_DIR` at that persistent volume. Ephemeral/serverless platforms
will lose uploads on redeploy unless you mount durable storage.
