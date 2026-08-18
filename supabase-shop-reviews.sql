-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod. Then run
-- `npm run gen:types` to pick up the new table.
--
-- shop_reviews: one star rating + optional comment per (shop, user) —
-- a user can rate a shop once and edit that rating later, not stack up
-- multiple reviews for the same shop. Publicly readable (reviews are
-- meant to be seen on the shop's page), writable only by the
-- authenticated user who owns the row.

create table public.shop_reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.coffee_shops(id) on delete cascade,
  -- Defaults to the calling user rather than trusting a client-supplied
  -- value — the insert policy's WITH CHECK still enforces this too, but
  -- defaulting means the app never has to pass it explicitly.
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One review per user per shop — resubmitting is an edit, not a new row.
  -- Also serves as the index for "reviews for shop X" lookups (shop_id is
  -- the leading column), so no separate index on shop_id is needed.
  unique (shop_id, user_id)
);

alter table public.shop_reviews enable row level security;

create policy "Reviews are publicly viewable"
  on public.shop_reviews for select
  to anon, authenticated
  using (true);

create policy "Users can add their own review"
  on public.shop_reviews for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can edit their own review"
  on public.shop_reviews for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own review"
  on public.shop_reviews for delete
  to authenticated
  using ((select auth.uid()) = user_id);
