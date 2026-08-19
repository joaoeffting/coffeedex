"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredCitySlug } from "@/lib/city-preference";

// The preferred city lives in localStorage (client-only), so picking a
// default here has to happen client-side after mount — a server redirect
// can't see it. Stockholm's the fallback when nothing's been chosen yet.
export default function DexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dex/${getStoredCitySlug() ?? "stockholm"}`);
  }, [router]);

  return null;
}
