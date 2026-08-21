import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CityMapLoader } from "@/components/city-map-loader";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";
import { RememberCity } from "@/components/remember-city";
import { VisitedToggle } from "@/components/visited-toggle";
import { SaveToggle } from "@/components/save-toggle";
import { ShareShopButton } from "@/components/share-shop-button";
import { citySlug } from "@/lib/city";
import { safeJsonLd } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; dexNumber: string }>;
}): Promise<Metadata> {
  const { city, dexNumber } = await params;
  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("coffee_shops")
    .select("name, neighborhood, description")
    .ilike("city", city)
    .eq("dex_number", Number(dexNumber))
    .maybeSingle();

  if (!shop) return {};

  return {
    title: `#${dexNumber} ${shop.name}`,
    description: shop.description,
  };
}

export default async function ShopDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; dexNumber: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { city, dexNumber } = await params;
  const { review_error: reviewError } = await searchParams;
  const dexNum = Number(dexNumber);
  if (!Number.isInteger(dexNum)) notFound();

  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("coffee_shops")
    .select("*")
    .ilike("city", city)
    .eq("dex_number", dexNum)
    .maybeSingle();

  if (!shop) notFound();

  const [{ data: reviews }, { data: claims }] = await Promise.all([
    supabase
      .from("shop_reviews")
      .select("id, user_id, rating, comment, created_at")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false }),
    supabase.auth.getClaims(),
  ]);

  const allReviews = reviews ?? [];
  const currentUserId = (claims?.claims.sub as string | undefined) ?? null;
  const myReview = allReviews.find((r) => r.user_id === currentUserId) ?? null;
  const otherReviews = allReviews.filter((r) => r.id !== myReview?.id);

  let alreadyVisited = false;
  let alreadySaved = false;
  if (currentUserId) {
    const [{ data: visitedRow }, { data: savedRow }] = await Promise.all([
      supabase
        .from("visited_shops")
        .select("shop_id")
        .eq("shop_id", shop.id)
        .maybeSingle(),
      supabase
        .from("saved_shops")
        .select("shop_id")
        .eq("shop_id", shop.id)
        .maybeSingle(),
    ]);
    alreadyVisited = visitedRow != null;
    alreadySaved = savedRow != null;
  }
  const liveRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : null;

  // Name + address (not lat/lng) — per Google's Maps URL docs, this is what
  // resolves to the actual business listing page (photos, reviews, hours)
  // instead of just centering the map on a coordinate.
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name}, ${shop.address}`)}`;
  const appleMapsUrl = `https://maps.apple.com/?ll=${shop.lat},${shop.lng}&q=${encodeURIComponent(shop.name)}`;
  const nonce = (await headers()).get("x-nonce");

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <script
        type="application/ld+json"
        nonce={nonce ?? undefined}
        // Structured data so search engines can understand this page is
        // specifically a cafe listing (name, address, geo, rating), not
        // just a blob of text — can surface richer results than a plain
        // title/description.
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "CafeOrCoffeeShop",
            name: shop.name,
            description: shop.description,
            address: {
              "@type": "PostalAddress",
              streetAddress: shop.address,
              addressLocality: shop.city,
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: shop.lat,
              longitude: shop.lng,
            },
            ...(liveRating != null
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: liveRating,
                    reviewCount: allReviews.length,
                  },
                }
              : {}),
          }),
        }}
      />
      <RememberCity citySlug={citySlug(shop.city)} />
      <Link
        href={`/discover/${citySlug(shop.city)}`}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground active:text-foreground"
      >
        ← Back to Discover
      </Link>

      {/* select-none here (not just on the hold button below) — a
          long-press landing on a select-none target falls back to
          selecting the nearest selectable text on mobile, and the name/
          address sitting right above the hold-to-confirm button is
          exactly that nearest text. Same fix as the dex grid. */}
      <div style={{ WebkitTouchCallout: "none" }} className="select-none">
        <p className="font-heading text-sm font-medium text-muted-foreground uppercase tracking-wide">
          #{shop.dex_number}
        </p>
        <h1 className="font-heading text-3xl font-semibold">{shop.name}</h1>
        <p className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {shop.neighborhood} · {shop.address}
        </p>
      </div>

      <div
        style={{ WebkitTouchCallout: "none" }}
        className="flex flex-wrap items-center gap-3 select-none"
      >
        <VisitedToggle
          shopId={shop.id}
          initiallyVisited={alreadyVisited}
          signedIn={currentUserId != null}
        />
        <SaveToggle
          shopId={shop.id}
          initiallySaved={alreadySaved}
          signedIn={currentUserId != null}
        />
        <ShareShopButton
          url={`${siteUrl}/shops/${citySlug(shop.city)}/${shop.dex_number}`}
          title={`${shop.name} · Coffeedex`}
          text={`What do you think about going to ${shop.name}?`}
        />
      </div>

      {liveRating != null && (
        <div className="flex items-center gap-1.5">
          <Star
            className="h-5 w-5 fill-primary text-primary"
            aria-hidden="true"
          />
          <span className="font-medium">{liveRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            from {allReviews.length} coffeedex review
            {allReviews.length === 1 ? "" : "s"}
          </span>
        </div>
      )}

      {shop.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {shop.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <p>{shop.description}</p>

      <div className="h-64">
        <CityMapLoader
          shops={[{ ...shop, rating: liveRating, reviewCount: allReviews.length }]}
          citySlug={citySlug(shop.city)}
          center={[shop.lat, shop.lng]}
          zoom={15}
          linkToDetail={false}
          initiallyVisited={alreadyVisited ? [shop.id] : []}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dex-outline dex-press flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Open in Google Maps
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted active:bg-muted"
        >
          Open in Apple Maps
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="font-heading text-xl font-semibold">Reviews</h2>
        <ReviewForm
          shopId={shop.id}
          citySlug={citySlug(shop.city)}
          dexNumber={shop.dex_number}
          signedIn={currentUserId != null}
          existing={myReview}
          error={
            typeof reviewError === "string" ? reviewError : undefined
          }
        />
        <ReviewList
          reviews={myReview ? [myReview, ...otherReviews] : otherReviews}
          currentUserId={currentUserId}
          citySlug={citySlug(shop.city)}
          dexNumber={shop.dex_number}
        />
      </div>
    </main>
  );
}
