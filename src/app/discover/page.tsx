import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { StockholmMapLoader } from "@/components/stockholm-map-loader";

export const metadata: Metadata = {
  title: "Discover",
  description: "Browse Stockholm's coffee shops on the map.",
};

export default async function DiscoverPage() {
  const supabase = await createClient();
  const { data: shops } = await supabase
    .from("coffee_shops")
    .select("id, dex_number, name, neighborhood, lat, lng")
    .order("dex_number");

  return (
    <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Discover</h1>
        <p className="text-sm text-muted-foreground">
          {shops?.length ?? 0} Stockholm coffee shops — tap a pin to see
          which.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <StockholmMapLoader shops={shops ?? []} />
      </div>
    </main>
  );
}
