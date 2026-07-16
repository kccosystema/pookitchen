# Blog Hub

One central app to **write and AI-generate blog posts for many sites**. Every
post is tagged with a `site`, and each of your sites pulls only its own
published posts from a single shared API. No per-site admin area ever again.

```
┌─────────────────────────────┐
│   Blog Hub (this app)       │
│  • Admin UI (write/edit)    │
│  • AI draft generation      │  ← Claude (claude-opus-4-8)
│  • Supabase Postgres        │
│  • Public read API          │
└──────────────┬──────────────┘
      GET /api/posts?site=…  (JSON, CORS-open)
     ┌─────────┼─────────┬───────────┐
     ▼         ▼         ▼           ▼
  rawr-site  hugeaf   mattress…   (any Vercel project)
```

## Stack

- **Next.js 15** (App Router) — deploy on Vercel
- **Supabase Postgres** — one database, all posts, multi-tenant by `site_id`
- **Claude** (`@anthropic-ai/sdk`) — generates drafts you review before publishing

## What's here

| Path | Purpose |
|------|---------|
| `supabase/schema.sql` | Database schema — run once in the Supabase SQL editor |
| `lib/` | Supabase client, Claude generation, auth, revalidation |
| `app/admin/**` | The admin UI (list, create, edit) — password-gated |
| `app/api/posts` | **Public** read API your sites call |
| `app/api/admin/**` | Protected CRUD used by the admin UI |
| `app/api/generate` | AI draft endpoint |
| `middleware.ts` | Gates `/admin` and admin APIs behind a login |
| `consumer-example/` | Copy-paste code showing how a site pulls + revalidates |

## Setup

1. **Create a Supabase project** → open the SQL editor → paste and run
   `supabase/schema.sql`. Edit the seed `insert into sites (...)` to match your
   real Vercel projects (use each project's slug as the site `id`).

2. **Configure env** — copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings → API)
   - `ANTHROPIC_API_KEY`
   - `ADMIN_PASSWORD` (what you type to log in)
   - `ADMIN_SESSION_TOKEN` (`openssl rand -hex 32`)

3. **Run it**
   ```bash
   npm install
   npm run dev        # http://localhost:3000/admin
   ```

4. **Deploy** — push to a new repo, import into Vercel as its own project, and
   add the same env vars. This becomes e.g. `blog-hub.vercel.app`.

## Connecting a site

In each consumer site (e.g. `rawr-site`), copy `consumer-example/lib/posts.ts`
and the `app/blog/**` pages, then set:

```
BLOG_HUB_URL=https://blog-hub.vercel.app
BLOG_HUB_SITE=rawr-site
```

That's it — the site now renders its own posts in its own design.

### Instant updates (optional but recommended)

So a site refreshes the moment you publish (instead of waiting for ISR):

1. Add `consumer-example/app/api/revalidate/route.ts` to the site and set
   `REVALIDATE_SECRET` on it.
2. In the hub's database, set that site's row:
   `revalidate_url = https://<site>/api/revalidate` and
   `revalidate_secret = <same secret>`.

On publish/update/delete, the hub pings the site and it revalidates instantly.

## The read API

```
GET /api/posts?site=<id>              → { posts: [...] }   published only
GET /api/posts?site=<id>&slug=<slug>  → { post: {...} }
GET /api/posts?site=<id>&limit=5      → newest 5
```

Only `published` posts are ever returned. Drafts stay private to the hub.

## Notes & next steps

- **Auth** is a single shared admin password (fine for one editor). For multiple
  editors, SSO, or per-author attribution, swap `lib/auth.ts` + `middleware.ts`
  for [Supabase Auth](https://supabase.com/docs/guides/auth).
- **AI model** defaults to `claude-opus-4-8` with structured outputs in
  `lib/ai.ts` — change the model or prompt there.
- **Images**: `cover_image_url` is a plain URL field. Add Supabase Storage
  uploads to the editor when you want hosted images.
- This app was scaffolded inside the `pookitchen` repo under `blog-hub/`. It is
  fully self-contained — move it to its own repo/Vercel project whenever you like.
```
