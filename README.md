# Coffeedex

A Pokédex, but for coffee shops. Visit a real café, mark it visited, and watch your personal collection fill in — one city at a time.

**Live:** [coffeedex-one.vercel.app](https://coffeedex-one.vercel.app/) · Stockholm and Gdańsk are live today, both seeded with real, hand-curated shops (names, addresses, and coordinates cross-referenced from current local guides — not scraped, not placeholder data).

## What it does

- **Collect** — every shop in a city, dex-numbered, permanent order. Mark one visited with a deliberate hold-to-confirm gesture (not an accidental tap — this is a claim about the real world).
- **Discover** — the same shops on a map, with live geolocation ("locate me," auto-resumed on return visits if permission's already granted, never a surprise prompt).
- **Save** — a lightweight "want to visit" planner, independent of the visited list (you can save a shop you've already been to, e.g. to go back).
- **Review** — star ratings and comments, live-averaged; a shop with no reviews yet shows no rating at all rather than a stand-in from an external source.
- **Share** — send a shop straight into a chat via the native share sheet, not a copy-pasted link.
- Installable as a real PWA (Add to Home Screen), with dark mode following system preference.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 + shadcn/ui (Base UI) · Supabase (Postgres, Auth, Row Level Security) · Leaflet + OpenStreetMap · PostHog (consent-gated) · Playwright (E2E) · Vercel

## A few decisions worth reading, not just the feature list

**No service-role key exists in this codebase, on purpose.** Every privileged operation — deleting your own account, exporting your own data, the admin stats page — runs as a `security definer` Postgres function that captures the caller's identity once and scopes every query to it, instead of an app-wide admin credential that would be one leak away from a very bad day. The tradeoff is more upfront SQL design; the payoff is that there's no key to leak in the first place.

**The admin gate didn't start this way.** First pass hard-coded my own email inside those functions — worked, but I didn't like carrying my email around in the codebase or the fact that a role check lived in application logic at all. Redid it as an `app_metadata` role claim on the account instead, checked from the verified JWT inside the database function itself (the actual gate — the app-level check is UX only, confirmed by testing that a caller without the claim gets rejected even calling the function directly). Small thing, but it's the kind of pass a real security review should catch, and I made myself go back and fix it rather than ship the shortcut.

**Long-press interactions are harder than they look.** "Hold to confirm" needed real iteration: iOS Safari's native long-press text-selection UI and Android's fallback-to-nearest-selectable-text behavior both fought the custom gesture in different ways, on different surfaces (a map popup, a dense grid of cards), requiring more than one round of fixes before it was actually solid across devices — a good reminder that "looks done in five minutes" and "is done" are different claims on mobile web.

**Dark mode was validated before it was built.** The color tokens existed in the CSS but had never been wired up or looked at. Before writing the toggle, I mocked up the scaffolded values against an adjusted one — turned out the scaffolded border color would've flattened the whole chunky-outline visual signature the light theme is built around. Caught and fixed in a five-minute comparison, not after shipping it.

**Content Security Policy uses per-request nonces**, not `unsafe-inline` — a stricter bar than most side projects bother clearing, because the shop detail pages render structured data and user-submitted review text isn't something to trust by default.

## Built with Claude Code

This was built collaboratively with Claude Code, and I'd rather say that plainly than have it discovered in a commit trailer. I directed the architecture and every feature decision, reviewed every change before it shipped, and caught real mistakes along the way — the hard-coded admin email above is one; there were others. Knowing what to ask for, what to push back on, and what "looks right but isn't" reads like is the actual skill on display here, not the absence of AI involvement.

## Running locally

```bash
npm install
npm run dev
```

Needs a Supabase project — see the `supabase-*.sql` files at the repo root for the full schema, applied in the order they were added (each is a real, already-applied migration, kept as a historical record rather than edited after the fact).

## License

All rights reserved — see [LICENSE](./LICENSE). Public for portfolio/review purposes; not licensed for reuse.
