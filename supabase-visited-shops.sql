-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod. Then run
-- `npm run gen:types` to pick up the new table.
--
-- visited_shops: which shops a user has personally marked visited — the
-- actual "collection progress" the Pokédex framing is built around.
-- Private by default (only the owning user can see their own progress,
-- same as a Pokédex's caught list isn't visible to other trainers) —
-- unlike shop_reviews, there's no public-read policy here.

create table public.visited_shops (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.coffee_shops(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  visited_at timestamptz not null default now(),
  -- One row per (shop, user) — marking visited again is a no-op, not a
  -- second entry. Also the index "my visited shops" lookups need, since
  -- shop_id is the leading column.
  unique (shop_id, user_id)
);

alter table public.visited_shops enable row level security;

create policy "Users can view their own visited shops"
  on public.visited_shops for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can mark a shop visited"
  on public.visited_shops for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can unmark a visited shop"
  on public.visited_shops for delete
  to authenticated
  using ((select auth.uid()) = user_id);
