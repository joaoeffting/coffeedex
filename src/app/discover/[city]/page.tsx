import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { CityMapLoader } from "@/components/city-map-loader";
import { DexMapToggle } from "@/components/dex-map-toggle";
import { RememberCity } from "@/components/remember-city";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  return {
    title: `Discover · ${city}`,
    description: `Browse ${city}'s coffee shops on the map.`,
  };
}

export default async function DiscoverPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const supabase = await createClient();

  const { data: shops } = await supabase
    .from("coffee_shops")
    .select("id, dex_number, name, neighborhood, lat, lng, city")
    .ilike("city", city)
    .order("dex_number");

  if (!shops || shops.length === 0) notFound();

  const cityName = shops[0].city;
  // No fixed per-city coordinates to maintain — the centroid of that
  // city's own shops centers the map reasonably for any city, including
  // ones added after this was written.
  const center: [number, number] = [
    shops.reduce((sum, s) => sum + s.lat, 0) / shops.length,
    shops.reduce((sum, s) => sum + s.lng, 0) / shops.length,
  ];

  return (
    <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4 px-4 py-6">
      <RememberCity citySlug={city} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Discover · {cityName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {shops.length} {cityName} coffee shops — tap a pin to see which.
          </p>
        </div>
        <DexMapToggle citySlug={city} active="map" />
      </div>
      <div className="min-h-0 flex-1">
        <CityMapLoader shops={shops} citySlug={city} center={center} />
      </div>
    </main>
  );
}
