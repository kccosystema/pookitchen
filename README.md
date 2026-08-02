# Pookitchen — SEO Blog Generator

Describe a post, get a publish-ready draft: three title options, a meta description,
a URL slug, search intent, keywords, a structured body with an FAQ block, and internal
link suggestions. Output streams in as it's written and can be copied or downloaded as
Markdown with YAML front matter.

Built with React + Vite on the front end and a single Vercel serverless function that
calls the Anthropic API (`claude-opus-5`).

## Setup

This app needs one environment variable:

| Variable | Where to get it |
| --- | --- |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |

**On Vercel:** Project → Settings → Environment Variables → add `ANTHROPIC_API_KEY`,
then redeploy so the function picks it up.

**Locally:** put it in `.env.local` (already gitignored):

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Running locally

The front end and the API function need to run together, so use the Vercel CLI rather
than `vite` alone — plain `npm run dev` serves the UI but `/api/generate` will 404.

```bash
npm install
npm i -g vercel   # once
vercel dev
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server, UI only (no API route) |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | TypeScript check, no emit |
| `vercel dev` | Full local stack, UI + `/api/generate` |

## How it works

`api/generate.ts` streams a response in two parts: a JSON metadata block wrapped in
`<<<META … META>>>`, followed by the post body as Markdown. `src/lib/parse.ts` parses
this incrementally on every chunk, so the metadata cards render as soon as they're
complete while the draft continues streaming underneath.

Generated posts are saved to `localStorage` (most recent 60) — there's no database and
nothing leaves the browser except the brief you submit.

## Project layout

```
api/generate.ts        Serverless function — prompt, Claude call, streaming response
src/App.tsx            Layout, streaming fetch loop, save/load wiring
src/lib/parse.ts       Incremental stream parser, word count, Markdown export
src/lib/storage.ts     localStorage persistence
src/components/        Brief form, metadata cards, saved-post list
```

## Tuning the output

The system prompt in `api/generate.ts` defines the whole output contract — section
structure, title and meta-description lengths, FAQ format, and the rule against
inventing statistics. Edit it there to change house style. If you change the shape of
the `<<<META>>>` JSON, update `PostMeta` in `src/lib/types.ts` and `coerceMeta` in
`src/lib/parse.ts` to match.
