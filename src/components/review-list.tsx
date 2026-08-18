import { Star } from "lucide-react";
import { deleteReview } from "@/app/shops/[dexNumber]/actions";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function ReviewList({
  reviews,
  currentUserId,
  dexNumber,
}: {
  reviews: Review[];
  currentUserId: string | null;
  dexNumber: number;
}) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet — be the first.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={
                    i < review.rating
                      ? "h-4 w-4 fill-primary text-primary"
                      : "h-4 w-4 text-muted-foreground"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {review.user_id === currentUserId && (
                <span className="font-medium text-foreground">You</span>
              )}
              <time dateTime={review.created_at}>
                {new Date(review.created_at).toLocaleDateString()}
              </time>
              {review.user_id === currentUserId && (
                <form action={deleteReview.bind(null, review.id, dexNumber)}>
                  <button
                    type="submit"
                    className="text-destructive underline underline-offset-2"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          </div>
          {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
