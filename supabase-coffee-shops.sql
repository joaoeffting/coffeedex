-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod.
--
-- coffee_shops: one hand-curated row per real Stockholm coffee shop.
-- Publicly readable, no auth required to browse (per SPEC.md) — no
-- write policy needed either, since seeding happens via this SQL file /
-- the Supabase dashboard table editor directly, not the app.

create table public.coffee_shops (
  id uuid primary key default gen_random_uuid(),
  -- Permanent collection-album position, assigned in curation order —
  -- never reassigned once a shop exists (see SPEC.md's "Dex order is
  -- permanent" principle). Unique per city so a future second city
  -- starts its own #1 rather than continuing Stockholm's numbering.
  dex_number integer not null,
  name text not null,
  neighborhood text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  description text not null,
  photo_url text,
  tags text[] not null default '{}',
  -- Defaulted now, cheap insurance against a painful migration the
  -- moment a second city gets added later (see SPEC.md).
  city text not null default 'Stockholm',
  created_at timestamptz not null default now(),
  unique (city, dex_number)
);

alter table public.coffee_shops enable row level security;

create policy "Coffee shops are publicly viewable"
  on public.coffee_shops for select
  to anon, authenticated
  using (true);
