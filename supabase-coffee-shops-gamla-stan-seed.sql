-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod.
--
-- 5 more real, hand-curated Gamla Stan (Old Town) coffee shops — names
-- and addresses cross-referenced across current guides (Visit Stockholm,
-- Tripadvisor, thatsup.co.uk, and others), coordinates geocoded from
-- those addresses via OpenStreetMap Nominatim, ratings sourced from
-- current Google Maps aggregate figures at time of curation (same
-- sourcing standard as supabase-coffee-shops-rating.sql — snapshot, not
-- live, and never invented). dex_number continues from the existing 20
-- Stockholm shops (supabase-coffee-shops-seed.sql) — don't reorder
-- those, add new ones with the next number instead, per SPEC.md's "Dex
-- order is permanent" principle.
--
-- No photo_url yet, same as the original seed.

insert into public.coffee_shops
  (dex_number, name, neighborhood, address, lat, lng, description, tags, rating)
values
  (21, 'Kaffekoppen', 'Gamla Stan', 'Stortorget 20', 59.3248991, 18.0703806,
   'A candlelit Gamla Stan institution right on Stortorget, all low medieval ceilings and cozy corners — order at the counter, sit as long as you like.',
   array['cozy', 'institution'], 4.2),

  (22, 'Chokladkoppen', 'Gamla Stan', 'Stortorget 18', 59.3249577, 18.0703420,
   'Kaffekoppen''s chocolate-focused sister café next door on the square — go for the hot chocolate piled with whipped cream and cinnamon.',
   array['cozy', 'institution'], 4.3),

  (23, 'Sundbergs Konditori', 'Gamla Stan', 'Järntorget 83', 59.3227388, 18.0730698,
   'Stockholm''s oldest café, brewing since 1785 — chandeliers, old-world charm, and cakes to match the history.',
   array['bakery', 'historic', 'institution'], 4.3),

  (24, 'Grillska Huset', 'Gamla Stan', 'Stortorget 3', 59.3250056, 18.0713248,
   'Run by Stockholms Stadsmission in a building dating to the Middle Ages — excellent kanelbullar for a good cause.',
   array['bakery', 'historic'], 4.4),

  (25, 'Under Kastanjen', 'Gamla Stan', 'Kindstugatan 1', 59.3247663, 18.0726801,
   'A courtyard café tucked under a real chestnut tree on Brända Tomten — one of Old Town''s most charming outdoor seats.',
   array['cozy', 'historic'], 4.2);
