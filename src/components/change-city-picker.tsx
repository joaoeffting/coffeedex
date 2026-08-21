"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { citySlug } from "@/lib/city";
import { getStoredCitySlug, setStoredCitySlug } from "@/lib/city-preference";

// No actual cross-tab subscription — localStorage doesn't need one here,
// this is just the React-approved way to read an external (non-React)
// value without the server/client mismatch a useState+useEffect read
// would cause on the first paint.
function subscribe() {
  return () => {};
}

export function ChangeCityPicker({
  cities,
  returnSection = "dex",
}: {
  cities: string[];
  returnSection?: "dex" | "discover" | "saved";
}) {
  const router = useRouter();
  const current = useSyncExternalStore(
    subscribe,
    getStoredCitySlug,
    () => null,
  );

  function choose(city: string) {
    const slug = citySlug(city);
    setStoredCitySlug(slug);
    router.push(`/${returnSection}/${slug}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cities.map((city) => {
        const slug = citySlug(city);
        const isCurrent = slug === current;
        return (
          <button
            key={city}
            type="button"
            onClick={() => choose(city)}
            className={
              isCurrent
                ? "dex-outline dex-press rounded-2xl bg-accent px-4 py-3 text-left font-heading text-lg font-semibold text-accent-foreground"
                : "dex-outline dex-press rounded-2xl bg-card px-4 py-3 text-left font-heading text-lg font-semibold hover:bg-muted"
            }
          >
            {city}
            {isCurrent && (
              <span className="ml-2 text-xs font-medium tracking-wide uppercase opacity-75">
                Current
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
