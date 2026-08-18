import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Star, MapPin, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { StockholmMapLoader } from "@/components/stockholm-map-loader";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/review-form";
import { ReviewList } from "@/components/review-list";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dexNumber: string }>;
}): Promise<Metadata> {
  const { dexNumber } = await params;
  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("coffee_shops")
    .select("name, neighborhood, description")
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
  params: Promise<{ dexNumber: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { dexNumber } = await params;
  const { review_error: reviewError } = await searchParams;
  const dexNum = Number(dexNumber);
  if (!Number.isInteger(dexNum)) notFound();

  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("coffee_shops")
    .select("*")
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
  const liveRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : null;

  // Name + address (not lat/lng) — per Google's Maps URL docs, this is what
  // resolves to the actual business listing page (photos, reviews, hours)
  // instead of just centering the map on a coordinate.
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name}, ${shop.address}`)}`;
  const appleMapsUrl = `https://maps.apple.com/?ll=${shop.lat},${shop.lng}&q=${encodeURIComponent(shop.name)}`;

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Link
        href="/discover"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to Discover
      </Link>

      <div>
        <p className="font-heading text-sm font-medium text-muted-foreground uppercase tracking-wide">
          #{shop.dex_number}
        </p>
        <h1 className="font-heading text-3xl font-semibold">{shop.name}</h1>
        <p className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {shop.neighborhood} · {shop.address}
        </p>
      </div>

      {liveRating != null ? (
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
      ) : (
        shop.rating != null && (
          <div className="flex items-center gap-1.5">
            <Star
              className="h-5 w-5 fill-primary text-primary"
              aria-hidden="true"
            />
            <span className="font-medium">{shop.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              — aggregate rating at time of curation, not live. Be the first
              to leave a coffeedex review below.
            </span>
          </div>
        )
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
        <StockholmMapLoader
          shops={[shop]}
          center={[shop.lat, shop.lng]}
          zoom={15}
          linkToDetail={false}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dex-outline flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Open in Google Maps
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Open in Apple Maps
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <h2 className="font-heading text-xl font-semibold">Reviews</h2>
        <ReviewForm
          shopId={shop.id}
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
          dexNumber={shop.dex_number}
        />
      </div>
    </main>
  );
}
