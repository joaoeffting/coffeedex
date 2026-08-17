<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Supabase is central to this project

Auth, the database, RLS — everything backend here runs on Supabase. Before writing or changing anything that touches it (schema/migrations, RLS policies, security-definer functions, indexes, auth flows, Storage, Realtime, debugging a Postgres/RLS/auth error), load the `supabase` skill, and for anything that lives in the database specifically (tables, policies, functions, migrations, queries) also load `supabase-postgres-best-practices` before writing the SQL.

## Two Supabase projects, dev and prod, from day one

- `coffeedex-dev` (ref `mwwrjnutwncbksndbbfz`) — `.env.local`, everyday work.
- `coffeedex-prod` (ref `axhvdukrjvamoogqhkuf`) — `.env.production.local`, loaded only for `next build`/`next start` in production and by Vercel's Production environment.
- Both live under a separate Supabase account (`joaopauloeffting@gmail.com`) from Talehollow's, specifically to dodge the free-tier 2-active-project-per-org cap rather than pay for Pro on a hobby project.

## No DB write credentials, no service-role key

There's no `SUPABASE_SERVICE_ROLE_KEY` in this project, on purpose — don't add one.

- **Applying schema changes**: write the change as a standalone `supabase-<feature-name>.sql` file at the repo root, ask the user to run it in the Supabase SQL editor (dev first, then prod once verified), then run `npm run gen:types` to pick up the new schema before continuing. Code that depends on a not-yet-applied column/function is expected to show a type error in the meantime — that's normal, not a bug to work around with `any`.
- **Anything needing elevated privileges** — write a `security definer` Postgres function that captures `auth.uid()` into a local variable once and scopes every operation to that one id, granted via `grant execute on function ... to authenticated`.

## Verifying changes: never touch the user's running dev server

If the user already has `npm run dev` running, don't kill it, restart it, or reuse its port to test something. Use an isolated `git worktree` on a separate port instead: `git worktree add /tmp/coffeedex-test-wt -b test-<feature>`, copy over the changed files plus `.env.local` and a copy of `node_modules` (rsync, not a symlink — Turbopack panics on a symlink pointing outside the worktree root), then `PORT=<other> npx next dev -p <other>` from that worktree directory.

## Never commit or push without being explicitly asked

Finishing and verifying a change is not the same as being told to commit it. Leave the working tree as-is and say the change is ready — let the user decide when it becomes a commit, and never push without being asked either.

## Git identity

Already checked and correct for this repo: `git config user.email` → `joao.effting@gmail.com` (not the work email that leaks in via global config). If a fresh clone or a new machine ever shows the work email instead, fix it with a **local** override (`git config user.email "..."`, no `--global`) before the first commit from that clone.
