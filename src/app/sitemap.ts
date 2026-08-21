import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";
import { citySlug } from "@/lib/city";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: shops } = await supabase
    .from("coffee_shops")
    .select("city, dex_number");

  const cities = [...new Set((shops ?? []).map((s) => s.city))];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "monthly" },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly" },
  ];

  const cityRoutes: MetadataRoute.Sitemap = cities.flatMap((city) => {
    const slug = citySlug(city);
    return [
      {
        url: `${siteUrl}/discover/${slug}`,
        changeFrequency: "weekly" as const,
      },
      { url: `${siteUrl}/dex/${slug}`, changeFrequency: "weekly" as const },
    ];
  });

  const shopRoutes: MetadataRoute.Sitemap = (shops ?? []).map((shop) => ({
    url: `${siteUrl}/shops/${citySlug(shop.city)}/${shop.dex_number}`,
    changeFrequency: "monthly",
  }));

  return [...staticRoutes, ...cityRoutes, ...shopRoutes];
}
