import Link from "next/link";
import { StarRatingInput } from "@/components/star-rating-input";
import { Button } from "@/components/ui/button";
import { upsertReview } from "@/app/shops/[city]/[dexNumber]/actions";

export function ReviewForm({
  shopId,
  citySlug,
  dexNumber,
  signedIn,
  existing,
  error,
}: {
  shopId: string;
  citySlug: string;
  dexNumber: number;
  signedIn: boolean;
  existing: { rating: number; comment: string | null } | null;
  error?: string;
}) {
  if (!signedIn) {
    return (
      <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline">
          Log in
        </Link>{" "}
        to rate and review this shop.
      </p>
    );
  }

  return (
    <form
      action={upsertReview.bind(null, shopId, citySlug, dexNumber)}
      className="space-y-3 rounded-lg border border-border p-4"
    >
      <p className="text-sm font-medium">
        {existing ? "Your review" : "Rate this shop"}
      </p>
      <StarRatingInput name="rating" defaultValue={existing?.rating ?? 0} />
      <textarea
        name="comment"
        defaultValue={existing?.comment ?? ""}
        placeholder="Optional comment"
        rows={3}
        className="w-full rounded-lg border border-border p-2 text-sm"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" size="sm">
        {existing ? "Update review" : "Post review"}
      </Button>
    </form>
  );
}
