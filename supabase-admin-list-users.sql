-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod. Then run
-- `npm run gen:types` to pick up the new function.
--
-- admin_list_users(): a separate function from admin_get_stats() on
-- purpose — actual emails are more sensitive than aggregate counts, so
-- this is fetched only on demand (a button click in the admin UI), not
-- loaded on every admin page visit. Same security-definer-plus-hard-
-- coded-email-gate pattern as admin_get_stats().

create or replace function public.admin_list_users()
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

grant execute on function public.admin_list_users() to authenticated;
