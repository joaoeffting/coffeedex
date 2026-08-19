"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// DexGrid only renders these controls for signed-in users, so the
// redirect below is a defensive fallback, not the primary UX path.
export async function markVisited(
  shopId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) redirect("/login");

  const { error } = await supabase
    .from("visited_shops")
    .upsert({ shop_id: shopId }, { onConflict: "shop_id,user_id", ignoreDuplicates: true });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dex");
  return { ok: true };
}

export async function unmarkVisited(
  shopId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  if (authError || !data?.claims) redirect("/login");

  // No .eq("user_id", ...) needed — the delete RLS policy already scopes
  // this to rows the caller owns.
  const { error } = await supabase
    .from("visited_shops")
    .delete()
    .eq("shop_id", shopId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dex");
  return { ok: true };
}
