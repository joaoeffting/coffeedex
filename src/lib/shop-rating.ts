// Live coffeedex average only — no curated-snapshot fallback. Mixing a
// sourced-externally rating (Google/TripAdvisor at curation time) into
// the same star display as real in-app reviews reads as one number, but
// isn't; a shop with no coffeedex reviews yet now shows no rating at
// all rather than an external one standing in for it. Used by both the
// shop detail page and the map so they never disagree.
export function resolveShopRating(reviewRatings: number[]): {
  rating: number | null;
  reviewCount: number;
} {
  if (reviewRatings.length === 0) {
    return { rating: null, reviewCount: 0 };
  }
  const rating =
    reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length;
  return { rating, reviewCount: reviewRatings.length };
}
