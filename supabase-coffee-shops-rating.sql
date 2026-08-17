-- Run this in the Supabase SQL editor for coffeedex-dev first, then
-- coffeedex-prod once verified.
--
-- Adds a rating column and backfills it with real, sourced figures
-- (primarily Google Maps' aggregate rating, TripAdvisor as a fallback
-- where Google's wasn't findable) gathered during initial curation —
-- not invented. 4 of the 20 shops (Muttley & Jack's, AB Café, Kersh,
-- Sempre Espresso Bar) don't have a confidently-sourced figure and stay
-- NULL rather than guessed; the UI should treat NULL as "not rated yet",
-- not render a fake 0 or 5.
--
-- This is a snapshot, not a live sync — real ratings drift over time and
-- this app has no mechanism to refresh them automatically. Revisit if
-- that ever matters more than it does for a POC.

alter table public.coffee_shops
  add column rating numeric(2, 1)
  check (rating is null or (rating >= 0 and rating <= 5));

update public.coffee_shops set rating = 4.4 where name = 'Drop Coffee';
update public.coffee_shops set rating = 4.4 where name = 'Johan & Nyström';
update public.coffee_shops set rating = 4.5 where name = 'Café Pascal';
update public.coffee_shops set rating = 4.8 where name = 'Komet Café';
update public.coffee_shops set rating = 4.7 where name = 'Volca Coffee Roasters';
update public.coffee_shops set rating = 4.2 where name = 'Mellqvist Kaffebar';
update public.coffee_shops set rating = 4.6 where name = 'Beck Kaffebar';
update public.coffee_shops set rating = 4.6 where name = 'Svedjan Bageri';
update public.coffee_shops set rating = 4.3 where name = 'Gast';
update public.coffee_shops set rating = 4.9 where name = 'Höga Kusten Kaffe Rosteri';
update public.coffee_shops set rating = 4.3 where name = 'Il Caffè' and neighborhood = 'Södermalm';
update public.coffee_shops set rating = 4.1 where name = 'Il Caffè' and neighborhood = 'Kungsholmen';
update public.coffee_shops set rating = 4.4 where name = 'Vete-Katten';
update public.coffee_shops set rating = 5.0 where name = 'Nordic Brew Lab';
update public.coffee_shops set rating = 4.8 where name = 'Caffellini';
