// Shared resolution rule: live coffeedex average once reviews exist,
// falling back to the curated snapshot rating until then. Used by both
// the shop detail page and the map popups so they never disagree.
export function resolveShopRating(
  curatedRating: number | null,
  reviewRatings: number[],
): { rating: number | null; reviewCount: number } {
  if (reviewRatings.length === 0) {
    return { rating: curatedRating, reviewCount: 0 };
  }
  const rating =
    reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length;
  return { rating, reviewCount: reviewRatings.length };
}
