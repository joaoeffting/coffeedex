"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredCitySlug } from "@/lib/city-preference";

// No stored city (a genuinely first-ever visit, not just a fresh
// session) means asking rather than silently guessing Stockholm — every
// visitor lands here without a preference exactly once. Same pattern as
// /dex and /saved.
export default function DiscoverRedirect() {
  const router = useRouter();

  useEffect(() => {
    const citySlug = getStoredCitySlug();
    router.replace(
      citySlug ? `/discover/${citySlug}` : "/change-city?from=discover",
    );
  }, [router]);

  return null;
}
