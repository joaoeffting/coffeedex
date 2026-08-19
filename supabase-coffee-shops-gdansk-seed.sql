-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod.
--
-- First non-Stockholm city — 8 real, hand-curated Gdańsk coffee shops,
-- cross-referenced from Into the Bloom's local café guide and Yelp's
-- 2026 Gdańsk rankings, coordinates geocoded from those addresses via
-- OpenStreetMap Nominatim (same as the original Stockholm seed).
--
-- dex_number restarts at 1 for this city — coffee_shops.unique(city,
-- dex_number) means each city keeps its own independent numbering, like
-- a Pokémon game's regional Dex rather than one shared global list.

insert into public.coffee_shops
  (dex_number, name, neighborhood, address, lat, lng, description, tags, city)
values
  (1, 'Przelewki by Fat Duck', 'Oliwa', 'Cystersów 12', 54.4091912, 18.5572224,
   'Serious specialty espresso and nitro cold brew, with regular cupping workshops led by award-winning baristas.',
   array['specialty'], 'Gdansk'),

  (2, 'Las', 'Oliwa', 'Tetmajera 5', 54.4023863, 18.5653436,
   'A specialty roaster tucked into a charming historic house with garden seating — an Oliwa hideaway.',
   array['roastery', 'specialty', 'cozy'], 'Gdansk'),

  (3, 'Plenum', 'Młode Miasto', 'Elektryków 1', 54.3644456, 18.6482802,
   'An industrial ex-shipyard space doubling as an art venue, pouring specialty coffee alongside an all-day breakfast menu.',
   array['specialty', 'cozy'], 'Gdansk'),

  (4, 'Drukarnia', 'Główne Miasto', 'Mariacka 36', 54.3496280, 18.6559459,
   'A former printing house in the Main City turned specialty café, known for house-made syrups and thoughtful design.',
   array['specialty', 'cozy'], 'Gdansk'),

  (5, 'Publiczna', 'Dolne Miasto', 'Łąkowa 35/38', 54.3411847, 18.6603064,
   'Specialty coffee and house-made sourdough inside a converted 19th-century rifle factory.',
   array['specialty', 'bakery'], 'Gdansk'),

  (6, 'Leń', 'Główne Miasto', 'Piwna 52/53', 54.3501256, 18.6513956,
   'One of Gdańsk''s most popular specialty spots, with a summer terrace and standout nitro cold brew.',
   array['specialty'], 'Gdansk'),

  (7, 'Kompozyt Cafe', 'Stare Miasto', 'Jaracza 14', 54.3632160, 18.6478733,
   'A bright café next to the New Art Museum that runs regular public cupping sessions.',
   array['specialty'], 'Gdansk'),

  (8, 'Ciekawa Cafe', 'Główne Miasto', 'Świętojańska 68/69', 54.3520863, 18.6531329,
   'A socially conscious café employing people with intellectual disabilities, serving specialty coffee and pastries from a local bakery.',
   array['specialty', 'bakery'], 'Gdansk');
