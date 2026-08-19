"use client";

import { useEffect } from "react";
import { setStoredCitySlug } from "@/lib/city-preference";

// Renders nothing — dropped onto every city-scoped page so that simply
// viewing a city (via any link: the city selector, the header, a shared
// URL) becomes the remembered preference, without every individual link
// needing its own click handler to persist it.
export function RememberCity({ citySlug }: { citySlug: string }) {
  useEffect(() => {
    setStoredCitySlug(citySlug);
  }, [citySlug]);

  return null;
}
