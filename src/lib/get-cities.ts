import { createClient } from "@/utils/supabase/server";

// Small, infrequently-changing list (a handful of cities at most) — a
// plain select + JS dedupe is simpler than reaching for a DISTINCT query
// or a separate cities table.
export async function getCities(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("coffee_shops").select("city");
  return Array.from(new Set((data ?? []).map((row) => row.city))).sort();
}
