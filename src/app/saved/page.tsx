"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredCitySlug } from "@/lib/city-preference";

// Same pattern as /dex and /discover — the preferred city lives in
// localStorage (client-only), so picking a default has to happen
// client-side after mount.
export default function SavedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/saved/${getStoredCitySlug() ?? "stockholm"}`);
  }, [router]);

  return null;
}
