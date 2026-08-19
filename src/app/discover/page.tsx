"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredCitySlug } from "@/lib/city-preference";

export default function DiscoverRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/discover/${getStoredCitySlug() ?? "stockholm"}`);
  }, [router]);

  return null;
}
