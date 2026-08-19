# Playwright integration tests

Real-browser tests against the actual UI and `coffeedex-dev` — no direct DB
seeding or reads (no `SUPABASE_SERVICE_ROLE_KEY` exists in this project, on
purpose; see `AGENTS.md`).

## Running

```bash
npm run test:e2e
```

`tests/global-setup.ts` signs up a fresh throwaway account through the real
signup form (coffeedex-dev has email confirmation off, so this needs no
manual pre-created account, unlike Storyloom's setup) and reuses that signed-in
session (`tests/.auth/user.json`, gitignored) across every spec.

If `npm run dev` is already running on port 3100, Playwright reuses it rather
than starting a second instance. Otherwise it starts one itself.

## What's covered

- `reviews.spec.ts` — leave a review on a real shop, verify it renders, edit
  it, delete it (cleans up after itself)
- `visited.spec.ts` — hold-to-confirm mark/unmark a shop visited on the Dex,
  verify the progress counter and filter tabs, cleans up after itself
- `multi-city.spec.ts` — switch city via `/change-city`, verify the Dex shows
  that city's shops, verify the choice persists (bare `/dex` redirects to the
  last-picked city, not always Stockholm)
- `geolocation.spec.ts` — "locate me" button toggles on/off (Playwright can
  mock geolocation via `test.use({ geolocation, permissions })`, so this is
  actually testable unlike the Leaflet marker DOM below)

## What's not covered (yet)

Map rendering (Leaflet's actual pin/popup DOM is finicky to assert on
reliably and low-value to lock down at the E2E level), the PWA install
banner (genuinely OS-level iOS Safari behavior, not something a desktop
Chromium run can exercise), and the account stats page. Add specs for these
if they start actually breaking in practice.

## Why tests write real (labeled) content instead of a sandboxed fixture

Storyloom seeds its own throwaway book/chapter per run because chapters are
user-generated content. Coffeedex's shops are curated, shared fixtures (real
Stockholm/Gdańsk cafés) — there's nothing per-run to seed. Tests instead
target a known stable shop (Stockholm dex #1) and clean up what they create
(delete the review, unmark visited) so repeated runs don't accumulate
leftover state on that shop's real page.
