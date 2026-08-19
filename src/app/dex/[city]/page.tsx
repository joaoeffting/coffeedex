import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { DexGrid } from "@/components/dex-grid";
import { DexMapToggle } from "@/components/dex-map-toggle";
import { RememberCity } from "@/components/remember-city";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  return { title: `Dex · ${city}` };
}

export default async function DexPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const supabase = await createClient();

  const [{ data: shops }, { data: claims }] = await Promise.all([
    supabase
      .from("coffee_shops")
      .select("id, dex_number, name, neighborhood, tags, city")
      .ilike("city", city)
      .order("dex_number"),
    supabase.auth.getClaims(),
  ]);

  if (!shops || shops.length === 0) notFound();

  const cityName = shops[0].city;
  const signedIn = claims?.claims != null;

  let visitedIds: string[] = [];
  if (signedIn) {
    const { data: visited } = await supabase
      .from("visited_shops")
      .select("shop_id")
      .in(
        "shop_id",
        shops.map((s) => s.id),
      );
    visitedIds = (visited ?? []).map((v) => v.shop_id);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <RememberCity citySlug={city} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">
            Coffeedex · {cityName}
          </h1>
          <p className="text-muted-foreground">
            Every specialty coffee shop we&apos;ve catalogued in{" "}
            {cityName} — mark one visited once you&apos;ve actually had a
            cup there.
          </p>
        </div>
        <DexMapToggle citySlug={city} active="dex" />
      </div>

      <DexGrid
        shops={shops}
        citySlug={city}
        initiallyVisited={visitedIds}
        signedIn={signedIn}
      />
    </main>
  );
}
