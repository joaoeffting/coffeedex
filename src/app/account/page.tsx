import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { citySlug } from "@/lib/city";
import { logout } from "../login/actions";

// Belt-and-suspenders alongside robots.ts's disallow — a noindex meta tag
// holds even if a crawler ignores robots.txt or reaches this URL via a
// stray external link before the auth redirect above kicks in.
export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const supabase = await createClient();
  // getClaims() (not getSession()) round-trips to Supabase's auth server to
  // verify the token is genuinely valid — session data read straight off
  // the cookie hasn't been independently re-checked, so it's the wrong
  // thing to gate access on.
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect("/login");

  const userId = data.claims.sub as string;

  const [{ data: allShops }, { data: visited }, { count: reviewCount }] =
    await Promise.all([
      supabase.from("coffee_shops").select("id, city"),
      // RLS already scopes this to the caller's own rows — no .eq("user_id")
      // needed, unlike shop_reviews below (which is publicly readable).
      supabase.from("visited_shops").select("shop_id, coffee_shops(city)"),
      supabase
        .from("shop_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  const totalsByCity = new Map<string, number>();
  for (const shop of allShops ?? []) {
    totalsByCity.set(shop.city, (totalsByCity.get(shop.city) ?? 0) + 1);
  }

  const visitedByCity = new Map<string, number>();
  for (const row of visited ?? []) {
    const city = row.coffee_shops?.city;
    if (!city) continue;
    visitedByCity.set(city, (visitedByCity.get(city) ?? 0) + 1);
  }

  const cityStats = Array.from(totalsByCity.entries())
    .map(([city, total]) => ({
      city,
      total,
      visitedCount: visitedByCity.get(city) ?? 0,
    }))
    .sort((a, b) => a.city.localeCompare(b.city));

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Your account</h1>
        <p className="text-muted-foreground">{data.claims.email}</p>
      </div>

      {cityStats.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">
            Your progress
          </h2>
          {cityStats.map(({ city, total, visitedCount }) => (
            <Link
              key={city}
              href={`/dex/${citySlug(city)}`}
              className="dex-outline flex items-center justify-between gap-4 rounded-2xl bg-card px-4 py-3 hover:bg-muted"
            >
              <div>
                <p className="font-heading font-semibold">{city}</p>
                <p className="text-sm text-muted-foreground">
                  {visitedCount} of {total} visited
                </p>
              </div>
              <div className="h-2.5 w-20 overflow-hidden rounded-full border-2 border-border bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${total ? (visitedCount / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </Link>
          ))}
          <p className="text-sm text-muted-foreground">
            You&apos;ve left {reviewCount ?? 0} review
            {reviewCount === 1 ? "" : "s"}.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          render={<Link href="/change-city">Change City</Link>}
        />
        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full">
            Log out
          </Button>
        </form>
      </div>
    </main>
  );
}
