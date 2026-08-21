"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// Saving is a separate fact from visiting (app/dex/actions.ts) — a shop
// can be saved after already being visited (e.g. "go back here"), so
// this never reads or writes visited_shops.
export async function saveShop(
  shopId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) redirect("/login");

  const { error } = await supabase
    .from("saved_shops")
    .upsert({ shop_id: shopId }, { onConflict: "shop_id,user_id", ignoreDuplicates: true });

  if (error) return { ok: false, error: error.message };

  revalidateSavedSurfaces();
  return { ok: true };
}

export async function unsaveShop(
  shopId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) redirect("/login");

  // No .eq("user_id", ...) needed — the delete RLS policy already scopes
  // this to rows the caller owns.
  const { error } = await supabase
    .from("saved_shops")
    .delete()
    .eq("shop_id", shopId);

  if (error) return { ok: false, error: error.message };

  revalidateSavedSurfaces();
  return { ok: true };
}

function revalidateSavedSurfaces() {
  revalidatePath("/saved/[city]", "page");
  revalidatePath("/shops/[city]/[dexNumber]", "page");
}
