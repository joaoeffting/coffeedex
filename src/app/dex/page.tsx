"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredCitySlug } from "@/lib/city-preference";

// The preferred city lives in localStorage (client-only), so reading it
// has to happen client-side after mount — a server redirect can't see
// it. No stored city (a genuinely first-ever visit, not just a fresh
// session) means asking rather than silently guessing Stockholm — every
// visitor lands here without a preference exactly once.
export default function DexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const citySlug = getStoredCitySlug();
    router.replace(citySlug ? `/dex/${citySlug}` : "/change-city?from=dex");
  }, [router]);

  return null;
}
