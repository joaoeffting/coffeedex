// coffee_shops.city is stored as a plain capitalized name ("Stockholm",
// "Gdansk") — URLs use a lowercase slug of that same value. Going the
// other way (slug -> exact city name) isn't needed: queries just match
// the slug against `city` case-insensitively via .ilike() instead of
// reconstructing the display name, which would break on multi-word
// city names down the line.
export function citySlug(city: string): string {
  return city.toLowerCase();
}

// Best-effort display name from a slug alone (landing page hero copy,
// where there's no DB row to read the real casing from — just a
// localStorage slug). Same multi-word-city caveat as above: fine for
// "gdansk" -> "Gdansk", would mangle a future "new-york" -> "New-york".
export function cityDisplayName(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
