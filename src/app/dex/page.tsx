import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { DexGrid } from "@/components/dex-grid";
import { DexMapToggle } from "@/components/dex-map-toggle";

export const metadata: Metadata = {
  title: "Dex",
};

export default async function DexPage() {
  const supabase = await createClient();

  const [{ data: shops }, { data: claims }] = await Promise.all([
    supabase
      .from("coffee_shops")
      .select("id, dex_number, name, neighborhood, tags")
      .order("dex_number"),
    supabase.auth.getClaims(),
  ]);

  const signedIn = claims?.claims != null;

  let visitedIds: string[] = [];
  if (signedIn) {
    const { data: visited } = await supabase
      .from("visited_shops")
      .select("shop_id");
    visitedIds = (visited ?? []).map((v) => v.shop_id);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Coffeedex</h1>
          <p className="text-muted-foreground">
            Every specialty coffee shop we&apos;ve catalogued — mark one
            visited once you&apos;ve actually had a cup there.
          </p>
        </div>
        <DexMapToggle active="dex" />
      </div>

      <DexGrid
        shops={shops ?? []}
        initiallyVisited={visitedIds}
        signedIn={signedIn}
      />
    </main>
  );
}
