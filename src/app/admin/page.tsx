import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { AdminUserList } from "@/components/admin-user-list";
import { isAdmin } from "@/lib/admin";

// Only linked from Account, and only for that one account — not a
// general nav item. The real access control is admin_get_stats() itself
// (hard-gated to the app_metadata role claim inside the function body);
// this redirect is just so a non-admin hitting the URL directly sees a
// normal navigation instead of an error page.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

type AdminStats = {
  total_users: number;
  new_users_7d: number;
  new_users_30d: number;
  total_reviews: number;
  total_visited: number;
  total_saved: number;
  users_with_a_visit: number;
  by_city: {
    city: string;
    shop_count: number;
    visited_count: number;
    saved_count: number;
    review_count: number;
  }[];
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !isAdmin(data?.claims)) {
    redirect("/");
  }

  const { data: stats, error: statsError } =
    await supabase.rpc("admin_get_stats");

  if (statsError || !stats) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <h1 className="font-heading text-2xl font-semibold">Admin</h1>
        <p className="text-destructive">
          Couldn&apos;t load stats: {statsError?.message ?? "no data returned"}
        </p>
      </main>
    );
  }

  const s = stats as unknown as AdminStats;

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="font-heading text-2xl font-semibold">Admin</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Registered users" value={s.total_users} />
        <StatCard label="New (7 days)" value={s.new_users_7d} />
        <StatCard label="New (30 days)" value={s.new_users_30d} />
        <StatCard
          label="Users w/ a visit"
          value={s.users_with_a_visit}
          hint={
            s.total_users > 0
              ? `${Math.round((s.users_with_a_visit / s.total_users) * 100)}% of users`
              : undefined
          }
        />
        <StatCard label="Shops visited" value={s.total_visited} />
        <StatCard label="Shops saved" value={s.total_saved} />
        <StatCard label="Reviews written" value={s.total_reviews} />
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">By city</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b-2 border-border text-left text-muted-foreground">
                <th className="py-2 pr-3 font-medium">City</th>
                <th className="py-2 pr-3 font-medium">Shops</th>
                <th className="py-2 pr-3 font-medium">Visited</th>
                <th className="py-2 pr-3 font-medium">Saved</th>
                <th className="py-2 pr-3 font-medium">Reviews</th>
              </tr>
            </thead>
            <tbody>
              {s.by_city.map((row) => (
                <tr key={row.city} className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium">{row.city}</td>
                  <td className="py-2 pr-3">{row.shop_count}</td>
                  <td className="py-2 pr-3">{row.visited_count}</td>
                  <td className="py-2 pr-3">{row.saved_count}</td>
                  <td className="py-2 pr-3">{row.review_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          Registered users
        </h2>
        <AdminUserList />
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="dex-outline rounded-2xl bg-card p-3">
      <p className="font-heading text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
