"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import { divIcon } from "leaflet";
import { Star, LocateFixed } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Just a sane fallback if a caller omits `center` — every real caller
// currently passes an explicit one (a shop's own coordinates, or a
// city's shop centroid), so this rarely if ever applies.
const FALLBACK_CENTER: [number, number] = [59.3293, 18.0686];

export type MapShop = {
  id: string;
  dex_number: number;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
  // Live coffeedex average when reviews exist, falling back to the
  // curated snapshot rating otherwise — same resolution the shop detail
  // page uses, so the popup and the detail page never disagree.
  rating: number | null;
  reviewCount: number;
};

// divIcon's `html` is raw innerHTML, not React-escaped — shop names are
// curator-entered today, not user-generated, but escaping costs nothing
// and stops this from becoming an XSS hole if that ever changes.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// A plain emoji divIcon, not Leaflet's default marker image — the default
// bundles two PNGs via relative paths that break under most bundlers
// (Turbopack included) unless separately patched. A divIcon sidesteps
// that entirely and reads as more on-brand than a generic pin anyway.
//
// The name label is absolutely positioned below the emoji rather than
// sized into the icon's own box — Leaflet's iconSize/iconAnchor drive
// where the *pin* lands on the coordinate, and a variable-width label
// would throw that off if it were part of the sized box instead of
// floating free underneath it.
function buildShopIcon(name: string) {
  return divIcon({
    html: `
      <div style="position: relative;">
        <span style="font-size: 26px; line-height: 1;">☕</span>
        <span style="position: absolute; top: 26px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: var(--card, #fffbf2); border: 2px solid var(--border, #2b1d12); border-radius: 999px; padding: 1px 7px; font-size: 11px; font-weight: 600; font-family: var(--font-heading), sans-serif; color: var(--foreground, #2b1d12); box-shadow: 2px 2px 0 0 var(--border, #2b1d12);">${escapeHtml(name)}</span>
      </div>
    `,
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

// Blue dot, not the app's own palette — "current location" is a strong,
// universally-recognized convention from Google/Apple Maps, and matching
// that reads more clearly at a glance than a brand-consistent color would.
const USER_LOCATION_COLOR = "#4285F4";

const youAreHereIcon = divIcon({
  html: `<div style="width: 16px; height: 16px; border-radius: 50%; background: ${USER_LOCATION_COLOR}; border: 3px solid white; box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.35);"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Recenters the map on the user's position the first time a fix comes
// in (a direct result of them clicking "locate me"), but not on every
// subsequent watchPosition update while they're browsing — otherwise
// the view would keep yanking back to them as they walk around.
function FlyToUserOnce({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const flownRef = useRef(false);

  useEffect(() => {
    if (flownRef.current) return;
    flownRef.current = true;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15));
  }, [map, lat, lng]);

  return null;
}

export function CityMap({
  shops,
  citySlug,
  center = FALLBACK_CENTER,
  zoom = 13,
  // Popups link to the shop detail page by default — the shop detail
  // page itself reuses this same component for its own pinpoint map,
  // where a self-link back to the page you're already on would be
  // pointless (and Leaflet's popupAnchor math makes it easy to miss that
  // case if it isn't opt-out-able).
  linkToDetail = true,
}: {
  shops: MapShop[];
  citySlug: string;
  center?: [number, number];
  zoom?: number;
  linkToDetail?: boolean;
}) {
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Stop watching on unmount (navigating away, or the [city] route
  // changing underneath this component) — a dangling watch would keep
  // firing into a component that's no longer there.
  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function toggleLocate() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setLocating(false);
      setUserPosition(null);
      return;
    }

    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation isn't supported on this device.");
      return;
    }

    setGeoError(null);
    setLocating(true);
    // watchPosition, not a one-shot getCurrentPosition — the whole point
    // is knowing whether a shop is close *as you walk around*, not just
    // where you were the moment you tapped the button.
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied."
            : "Couldn't get your location.",
        );
        setLocating(false);
        watchIdRef.current = null;
      },
      { enableHighAccuracy: true },
    );
  }

  return (
    <div className="relative size-full">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="dex-outline size-full rounded-2xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.lat, shop.lng]}
            icon={buildShopIcon(shop.name)}
          >
            <Popup>
              <p className="font-heading font-semibold">
                #{shop.dex_number} {shop.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {shop.neighborhood}
              </p>
              {shop.rating != null && (
                <p className="flex items-center gap-1 text-sm">
                  <Star
                    className="h-3.5 w-3.5 fill-primary text-primary"
                    aria-hidden="true"
                  />
                  <span className="font-medium">{shop.rating.toFixed(1)}</span>
                  {shop.reviewCount > 0 && (
                    <span className="text-muted-foreground">
                      ({shop.reviewCount})
                    </span>
                  )}
                </p>
              )}
              {linkToDetail && (
                <Link
                  href={`/shops/${citySlug}/${shop.dex_number}`}
                  className="text-sm underline underline-offset-4"
                >
                  View details →
                </Link>
              )}
            </Popup>
          </Marker>
        ))}
        {userPosition && (
          <>
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={userPosition.accuracy}
              pathOptions={{
                color: USER_LOCATION_COLOR,
                fillColor: USER_LOCATION_COLOR,
                fillOpacity: 0.12,
                weight: 1,
              }}
            />
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={youAreHereIcon}
            />
            <FlyToUserOnce lat={userPosition.lat} lng={userPosition.lng} />
          </>
        )}
      </MapContainer>

      <button
        type="button"
        onClick={toggleLocate}
        aria-pressed={locating}
        title={locating ? "Stop showing my location" : "Show my location"}
        aria-label={locating ? "Stop showing my location" : "Show my location"}
        className={
          locating
            ? "dex-outline absolute top-3 right-3 z-[1000] flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
            : "dex-outline absolute top-3 right-3 z-[1000] flex size-9 items-center justify-center rounded-full bg-card text-foreground hover:bg-muted"
        }
      >
        <LocateFixed className="h-4 w-4" aria-hidden="true" />
      </button>

      {geoError && (
        <p className="absolute top-14 right-3 z-[1000] max-w-48 rounded-lg border-2 border-border bg-card px-2 py-1.5 text-xs text-destructive shadow-lg">
          {geoError}
        </p>
      )}
    </div>
  );
}
