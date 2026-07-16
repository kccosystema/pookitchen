-- ===========================================================================
-- Blog Hub schema. Run this in the Supabase SQL Editor (Dashboard → SQL).
-- Multi-tenant: every post belongs to a `site`. Consumer sites read only their
-- own published posts through the public API.
-- ===========================================================================

-- --- Sites (tenants) --------------------------------------------------------
create table if not exists sites (
  id          text primary key,        -- slug, e.g. 'rawr-site' (matches your Vercel project)
  name        text not null,           -- display name, e.g. 'Rawr'
  -- Optional: when a post is published/updated, the hub POSTs to this URL so the
  -- consuming site can revalidate just its own content. See the revalidate route.
  revalidate_url    text,
  revalidate_secret text,
  created_at  timestamptz not null default now()
);

-- --- Posts ------------------------------------------------------------------
create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  site_id      text not null references sites(id) on delete cascade,
  slug         text not null,
  title        text not null,
  excerpt      text,
  content      text not null default '',   -- markdown
  cover_image_url text,
  tags         text[] not null default '{}',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  author       text,
  seo_title       text,
  seo_description text,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (site_id, slug)
);

create index if not exists posts_site_status_idx
  on posts (site_id, status, published_at desc);

-- Keep updated_at fresh on every write.
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_set_updated_at on posts;
create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

-- --- Row Level Security -----------------------------------------------------
-- The hub's admin API uses the SERVICE ROLE key, which bypasses RLS entirely.
-- These policies only matter if you ever expose the ANON key to consumer sites
-- (an alternative to the /api/posts read API). They allow reading published
-- posts and nothing else.
alter table sites enable row level security;
alter table posts enable row level security;

drop policy if exists "public reads published posts" on posts;
create policy "public reads published posts"
  on posts for select
  using (status = 'published');

drop policy if exists "public reads sites" on sites;
create policy "public reads sites"
  on sites for select
  using (true);

-- --- Seed a couple of sites (edit to match your Vercel projects) ------------
insert into sites (id, name) values
  ('rawr-site', 'Rawr'),
  ('hugeaf', 'HugeAF'),
  ('mattress-renew-site', 'Mattress Renew')
on conflict (id) do nothing;
