"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// One review per (shop, user) — resubmitting is an edit, enforced by the
// unique(shop_id, user_id) constraint + upsert on that same pair. user_id
// itself isn't sent from here: the column defaults to auth.uid() and the
// RLS WITH CHECK re-verifies it, so there's nothing client-suppliable to
// trust for ownership.
export async function upsertReview(
  shopId: string,
  dexNumber: number,
  formData: FormData,
) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) redirect("/login");

  const rating = Number(formData.get("rating"));
  const comment = ((formData.get("comment") as string) || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(
      `/shops/${dexNumber}?review_error=${encodeURIComponent("Pick a star rating before submitting.")}`,
    );
  }

  const { error } = await supabase.from("shop_reviews").upsert(
    {
      shop_id: shopId,
      rating,
      comment: comment || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id,user_id" },
  );

  if (error) {
    redirect(
      `/shops/${dexNumber}?review_error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/shops/${dexNumber}`);
}

export async function deleteReview(reviewId: string, dexNumber: number) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) redirect("/login");

  // No .eq("user_id", ...) filter needed — the delete RLS policy already
  // scopes this to rows the caller owns.
  await supabase.from("shop_reviews").delete().eq("id", reviewId);

  revalidatePath(`/shops/${dexNumber}`);
}
