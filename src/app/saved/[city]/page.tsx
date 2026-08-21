import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { SavedGrid } from "@/components/saved-grid";
import { RememberCity } from "@/components/remember-city";
import { CitySwitchLink } from "@/components/city-switch-link";

// A saved list is inherently personal (same as visited_shops — no
// public-read RLS policy either), so this page requires a session
// rather than showing gated actions on a public list like /dex does.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SavedPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/login");

  const { data: shops } = await supabase
    .from("coffee_shops")
    .select("id, dex_number, name, neighborhood, tags, city")
    .ilike("city", city)
    .order("dex_number");

  if (!shops || shops.length === 0) notFound();

  const cityName = shops[0].city;
  const shopIds = shops.map((s) => s.id);

  const [{ data: saved }, { data: visited }] = await Promise.all([
    supabase.from("saved_shops").select("shop_id").in("shop_id", shopIds),
    supabase.from("visited_shops").select("shop_id").in("shop_id", shopIds),
  ]);

  const savedIds = new Set((saved ?? []).map((s) => s.shop_id));
  const visitedIds = new Set((visited ?? []).map((v) => v.shop_id));

  const savedShops = shops
    .filter((s) => savedIds.has(s.id))
    .map((s) => ({ ...s, visited: visitedIds.has(s.id) }));

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <RememberCity citySlug={city} />
      <div>
        <h1 className="font-heading text-3xl font-semibold">
          Saved · {cityName}
        </h1>
        <p className="text-muted-foreground">
          Shops you&apos;ve bookmarked to visit.
        </p>
        <div className="mt-2">
          <CitySwitchLink section="saved" />
        </div>
      </div>

      <SavedGrid shops={savedShops} citySlug={city} />
    </main>
  );
}
