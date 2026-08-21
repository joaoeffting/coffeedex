"use client";

import dynamic from "next/dynamic";
import type { MapShop } from "@/components/city-map";

// Leaflet touches `window` during map initialization — ssr: false keeps it
// out of the server render entirely rather than fighting a hydration
// mismatch. `dynamic(..., { ssr: false })` is only valid inside a Client
// Component, hence this thin wrapper around the Server Component page.
const CityMap = dynamic(
  () => import("@/components/city-map").then((mod) => mod.CityMap),
  {
    ssr: false,
    loading: () => (
      <div className="dex-outline flex size-full items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

export function CityMapLoader({
  shops,
  citySlug,
  center,
  zoom,
  linkToDetail,
  signedIn,
  initiallyVisited,
}: {
  shops: MapShop[];
  citySlug: string;
  center?: [number, number];
  zoom?: number;
  linkToDetail?: boolean;
  signedIn?: boolean;
  initiallyVisited?: string[];
}) {
  return (
    <CityMap
      shops={shops}
      citySlug={citySlug}
      center={center}
      zoom={zoom}
      linkToDetail={linkToDetail}
      signedIn={signedIn}
      initiallyVisited={initiallyVisited}
    />
  );
}
