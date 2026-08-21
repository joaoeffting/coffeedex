-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod. Then run
-- `npm run gen:types` to pick up the new function.
--
-- admin_get_stats(): the numbers PostHog structurally can't give —
-- exact registered-user counts, engagement, per-city breakdown — read
-- straight from the source of truth instead of a consent-gated,
-- client-side-only analytics tool. Security definer (needed to read
-- auth.users, which RLS never exposes to the authenticated role) but
-- hard-gated to one specific email inside the function body, same
-- pattern as delete_own_account()/export_own_data() — no service-role
-- key anywhere, and every other authenticated caller gets an exception,
-- not data.

create or replace function public.admin_get_stats()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if (select auth.email()) is distinct from 'joaoeffting@gmail.com' then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from auth.users),
    'new_users_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'new_users_30d', (select count(*) from auth.users where created_at > now() - interval '30 days'),
    'total_reviews', (select count(*) from public.shop_reviews),
    'total_visited', (select count(*) from public.visited_shops),
    'total_saved', (select count(*) from public.saved_shops),
    'users_with_a_visit', (select count(distinct user_id) from public.visited_shops),
    'by_city', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'city', c.city,
        'shop_count', c.shop_count,
        'visited_count', coalesce(v.cnt, 0),
        'saved_count', coalesce(s.cnt, 0),
        'review_count', coalesce(r.cnt, 0)
      ) order by c.city), '[]'::jsonb)
      from (
        select city, count(*) as shop_count
        from public.coffee_shops
        group by city
      ) c
      left join (
        select cs.city, count(*) as cnt
        from public.visited_shops vs
        join public.coffee_shops cs on cs.id = vs.shop_id
        group by cs.city
      ) v on v.city = c.city
      left join (
        select cs.city, count(*) as cnt
        from public.saved_shops ss
        join public.coffee_shops cs on cs.id = ss.shop_id
        group by cs.city
      ) s on s.city = c.city
      left join (
        select cs.city, count(*) as cnt
        from public.shop_reviews sr
        join public.coffee_shops cs on cs.id = sr.shop_id
        group by cs.city
      ) r on r.city = c.city
    )
  ) into result;

  return result;
end;
$$;

grant execute on function public.admin_get_stats() to authenticated;
