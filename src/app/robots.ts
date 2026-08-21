import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth/account flows and utility redirects have nothing worth
      // indexing and shouldn't show up as search results.
      disallow: [
        "/account",
        "/login",
        "/check-email",
        "/change-city",
        "/admin",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
