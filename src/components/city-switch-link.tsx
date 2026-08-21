import Link from "next/link";
import { MapPin } from "lucide-react";

// A small, visible control on every city-scoped page (Dex, Discover,
// Saved) rather than a single nav-level link — city switching is
// context for the page you're already on, not a top-level destination,
// so it lives where that context is set.
//
// `section` rides along as a query param so ChangeCityPicker can send
// the user back to the same section (just for the new city) instead of
// always landing on Dex — picking a city from the map shouldn't dump
// you onto the grid.
export function CitySwitchLink({
  section,
}: {
  section: "dex" | "discover" | "saved";
}) {
  return (
    <Link
      href={`/change-city?from=${section}`}
      className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-1 text-sm font-medium hover:bg-muted"
    >
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
      Change city
    </Link>
  );
}
