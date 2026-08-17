-- Run this in the Supabase SQL editor for coffeedex-dev AFTER
-- supabase-coffee-shops.sql. Run again against coffeedex-prod once
-- verified on dev.
--
-- 20 real, hand-curated Stockholm coffee shops — names and addresses
-- cross-referenced across multiple current guides (Filter Notes,
-- localspecialtycoffee.com, A Day In Stockholm, The Coffee Vine, and
-- others), coordinates geocoded from those addresses via OpenStreetMap
-- Nominatim (same tile provider the app's map already uses). dex_number
-- assigned in this insertion order, per SPEC.md's "Dex order is
-- permanent" principle — don't reorder these rows later, add new ones
-- with the next number instead.
--
-- No photo_url yet (none sourced/licensed for real use) — the Dex/detail
-- UI needs a real empty state for this, not an assumption every shop has
-- one (see PLAN.md Phase 9's polish pass).

insert into public.coffee_shops
  (dex_number, name, neighborhood, address, lat, lng, description, tags)
values
  (1, 'Drop Coffee', 'Södermalm', 'Wollmar Yxkullsgatan 10', 59.3168777, 18.0627109,
   'Stockholm''s benchmark specialty roaster — light roasts, transparent sourcing, and some of the best pour-overs in the city.',
   array['roastery', 'specialty']),

  (2, 'Johan & Nyström', 'Södermalm', 'Swedenborgsgatan 7', 59.3164328, 18.0638898,
   'A pioneering name in Swedish third-wave coffee, roasting on-site with a strong focus on direct trade.',
   array['roastery', 'specialty', 'cozy']),

  (3, 'Café Pascal', 'Vasastan', 'Norrtullsgatan 4', 59.3421666, 18.0518939,
   'Competition-winning roaster and bakery with rare beans and in-house pastries.',
   array['roastery', 'bakery', 'specialty']),

  (4, 'Café Pascal', 'Östermalm', 'Sturegatan 8', 59.3368571, 18.0736466,
   'The Östermalm outpost of Café Pascal — same house-roasted coffee and bakery case.',
   array['bakery', 'specialty', 'cozy']),

  (5, 'Komet Café', 'Kungsholmen', 'Kungsholmsgatan 10', 59.3311009, 18.0482651,
   'A relaxed neighborhood café rotating through different Swedish roasters — a good primer on the local scene.',
   array['cozy', 'specialty']),

  (6, 'Volca Coffee Roasters', 'Kungsholmen', 'Hantverkargatan 8', 59.3286304, 18.0465157,
   'Latin America-focused roastery known for bright roasts and an espresso tonic worth trying.',
   array['roastery', 'specialty']),

  (7, 'Mellqvist Kaffebar', 'Vasastan', 'Rörstrandsgatan 4', 59.3397898, 18.0356203,
   'A local institution with a loyal regular crowd and strong, no-nonsense espresso.',
   array['cozy', 'institution']),

  (8, 'Beck Kaffebar', 'Södermalm', 'Tjärhovsgatan 3', 59.3151845, 18.0759585,
   'Small bar, serious baristas, dedicated following.',
   array['specialty', 'cozy']),

  (9, 'Muttley & Jack''s Coffee Roasters', 'Södermalm', 'Barnängsgatan 13', 59.3123730, 18.0967304,
   'Producer-first roastery in an up-and-coming corner of Södermalm, precise pour-overs.',
   array['roastery', 'specialty']),

  (10, 'Svedjan Bageri', 'Södermalm', 'Brännkyrkagatan 93', 59.3178218, 18.0494630,
   'Bakery-first corner spot moving into roasting its own coffee — go for the buns either way.',
   array['bakery', 'roastery']),

  (11, 'AB Café', 'Hägersten', 'Valborgsmässovägen 34', 59.2995615, 17.9985487,
   'Casual, living-room-like café a little further out from the center — worth the trip.',
   array['cozy']),

  (12, 'Gast', 'Vasastan', 'Rådmansgatan 57', 59.3397312, 18.0565691,
   'Bright, high-ceilinged spot for polished brunch plates and fika alike.',
   array['specialty', 'brunch']),

  (13, 'Höga Kusten Kaffe Rosteri', 'Kungsholmen', 'Fleminggatan 53', 59.3336916, 18.0376380,
   'In-house roastery focused on balance and clarity in the cup.',
   array['roastery', 'specialty']),

  (14, 'Il Caffè', 'Södermalm', 'Södermannagatan 23', 59.3126426, 18.0810291,
   'Casual neighborhood spot for good coffee, sourdough sandwiches, and pastries.',
   array['cozy', 'bakery']),

  (15, 'Il Caffè', 'Kungsholmen', 'Bergsgatan 17', 59.3298607, 18.0432507,
   'The Kungsholmen sibling of Il Caffè — same easy, casual formula.',
   array['cozy', 'bakery']),

  (16, 'Vete-Katten', 'Norrmalm', 'Kungsgatan 55', 59.3341120, 18.0583460,
   'A Stockholm institution since 1928 — old-school konditori charm right in the city center.',
   array['institution', 'bakery', 'historic']),

  (17, 'Nordic Brew Lab', 'Vasastan', 'Torsgatan 46', 59.3412098, 18.0380452,
   'Tiny brew bar featuring a rotating cast of different roasters on filter.',
   array['specialty', 'roastery']),

  (18, 'Kersh', 'Södermalm', 'Götgatan 29', 59.3168751, 18.0720648,
   'Tiny Södermalm roastery bar built for a quick, well-made espresso.',
   array['roastery', 'specialty']),

  (19, 'Sempre Espresso Bar', 'Norrmalm', 'Jakobsbergsgatan 7', 59.3348868, 18.0723821,
   'Stand-up Italian-style espresso bar — order, drink, go, the Italian way.',
   array['espresso-bar', 'italian']),

  (20, 'Caffellini', 'Gamla Stan', 'Västerlånggatan 60', 59.3235475, 18.0714710,
   'A tiny espresso bar tucked into the Old Town''s main tourist street — worth the detour for a real Italian shot.',
   array['espresso-bar', 'italian', 'historic']);
