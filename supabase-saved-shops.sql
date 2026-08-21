-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod. Then run
-- `npm run gen:types` to pick up the new table.
--
-- saved_shops: a personal "want to visit" planner list, independent of
-- visited_shops — saving and visiting are two separate facts about a
-- shop (you can save one you've already visited, e.g. to go back), so
-- this isn't derived from or coupled to that table in any way. Private
-- by default, same reasoning as visited_shops: no public-read policy.

create table public.saved_shops (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.coffee_shops(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  saved_at timestamptz not null default now(),
  -- One row per (shop, user) — saving again is a no-op, not a second
  -- entry. Also the index "my saved shops" lookups need, since shop_id
  -- is the leading column.
  unique (shop_id, user_id)
);

alter table public.saved_shops enable row level security;

create policy "Users can view their own saved shops"
  on public.saved_shops for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can save a shop"
  on public.saved_shops for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can unsave a shop"
  on public.saved_shops for delete
  to authenticated
  using ((select auth.uid()) = user_id);
