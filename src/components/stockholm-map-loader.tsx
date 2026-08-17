"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` during map initialization — ssr: false keeps it
// out of the server render entirely rather than fighting a hydration
// mismatch. `dynamic(..., { ssr: false })` is only valid inside a Client
// Component, hence this thin wrapper around the Server Component page.
const StockholmMap = dynamic(
  () => import("@/components/stockholm-map").then((mod) => mod.StockholmMap),
  {
    ssr: false,
    loading: () => (
      <div className="dex-outline flex size-full items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

export { StockholmMap as StockholmMapLoader };
