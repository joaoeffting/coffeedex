-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod.
--
-- Switches the admin gate from a hardcoded email (duplicated across SQL
-- and app code) to an app_metadata.role claim on the account itself.
-- app_metadata is the right place for this per Supabase's own security
-- guidance — unlike user_metadata it's not user-editable (only settable
-- here, via direct SQL, since this project has no service-role key for
-- the admin API), and reading it off the JWT means every admin check is
-- free — no extra query, no email string anywhere in the app.
--
-- A future per-shop "owns this shop" role would be a different shape of
-- data entirely (a user <-> specific shop relationship, not a single
-- global flag) and belongs in its own table when it's actually built —
-- this doesn't block or complicate that.
--
-- NOTE: this doesn't affect an already-logged-in session — the JWT is
-- issued at login and this UPDATE doesn't invalidate it. Sign out and
-- back in (or wait for the token's natural refresh) before expecting
-- /admin to work again after running this.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where email = 'joaoeffting@gmail.com';

create or replace function public.admin_get_stats()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
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

create or replace function public.admin_list_users()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'not authorized';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at
  ) order by u.created_at desc), '[]'::jsonb)
  into result
  from auth.users u;

  return result;
end;
$$;
