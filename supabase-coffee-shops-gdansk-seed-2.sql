-- Run this in the Supabase SQL editor for coffeedex-dev first, verify,
-- then run the same file against coffeedex-prod.
--
-- 10 more real, hand-curated Gdańsk coffee shops — names and addresses
-- cross-referenced across current guides (European Coffee Trip, Into
-- the Bloom, InYourPocket, and others), coordinates geocoded from those
-- addresses via OpenStreetMap Nominatim, ratings sourced from current
-- Google Maps aggregate figures where confidently found (same standard
-- as supabase-coffee-shops-rating.sql) — 4 of the 10 don't have a
-- confidently-sourced figure and stay NULL rather than guessed.
--
-- dex_number continues from the existing 8 Gdańsk shops
-- (supabase-coffee-shops-gdansk-seed.sql) — don't reorder those, add new
-- ones with the next number instead, per SPEC.md's "Dex order is
-- permanent" principle. No photo_url yet, same as the original seed.

insert into public.coffee_shops
  (dex_number, name, neighborhood, address, lat, lng, description, tags, city, rating)
values
  (9, 'Kawana', 'Wrzeszcz', 'Konrada Wallenroda 7', 54.3824973, 18.6111976,
   'A serious Wrzeszcz roastery run by a small team who''ve mastered their espresso — some of the best coffee in the city.',
   array['roastery', 'specialty'], 'Gdansk', null),

  (10, 'Cz•kawka', 'Wrzeszcz', 'Jana Kilińskiego 9', 54.3833210, 18.6069831,
   'A relaxed, book-and-puzzle-filled café in the old Gdańsk Brewery grounds, known for its cheesecakes in unexpected flavors.',
   array['cozy', 'bakery'], 'Gdansk', 4.7),

  (11, 'Lang.fuhr', 'Wrzeszcz', 'Aldony 6', 54.3820194, 18.6125480,
   'A cozy corner café named for Wrzeszcz''s old German name, with a lemon tart regulars keep coming back for.',
   array['cozy', 'bakery'], 'Gdansk', 4.6),

  (12, 'Retro', 'Główne Miasto', 'Piwna 5', 54.3502371, 18.6500684,
   'Gdańsk''s original specialty spot, pouring beans from top international roasters inside a nostalgic vintage-styled room.',
   array['cozy', 'bakery'], 'Gdansk', 4.7),

  (13, 'Józef K', 'Główne Miasto', 'Piwna 1', 54.3502938, 18.6498380,
   'A bohemian Old Town institution — mismatched antiques, old books, and a loyal following since it opened.',
   array['cozy', 'institution'], 'Gdansk', 4.6),

  (14, 'Mitte - Chleb i Kawa', 'Stare Przedmieście', 'Rzeźnicka 47B', 54.3430322, 18.6464715,
   'Bread-and-coffee café doing exactly that well — good sandwiches, honest prices, weekday mornings only.',
   array['bakery'], 'Gdansk', 4.5),

  (15, 'Cafe Faktotum', 'Główne Miasto', 'Świętego Ducha 8/10', 54.3509574, 18.6503405,
   'A Bukowski-inspired café of typewriters and black-and-white tiles, built for lingering over a good espresso.',
   array['cozy'], 'Gdansk', null),

  (16, 'Pożegnanie z Afryką', 'Główne Miasto', 'Grobla III 1/6D', 54.3520137, 18.6539567,
   'Part of Poland''s well-known coffee-and-tea specialist chain — serious beans to drink in or take home.',
   array['specialty'], 'Gdansk', null),

  (17, 'Café Libertas', 'Główne Miasto', 'Chlebnicka 37/38', 54.3489732, 18.6544689,
   'An art deco, pre-war-styled café near Mariacka — dark wood, old music, and a well-loved breakfast menu.',
   array['cozy', 'historic'], 'Gdansk', 4.6),

  (18, 'Gdańska Palarnia Kawy', 'Stare Miasto', 'Rajska 10', 54.3563756, 18.6494350,
   'A small-batch roastery started by a former Lechia Gdańsk footballer turned full-time coffee obsessive.',
   array['roastery', 'specialty'], 'Gdansk', null);
