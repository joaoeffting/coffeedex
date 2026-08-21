"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
import { HoldToConfirmButton } from "@/components/hold-to-confirm-button";
import { markVisited, unmarkVisited } from "@/app/dex/actions";

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
// The app's own primary green (--primary in globals.css, same value used
// by .dex-outline-visited on the dex grid cards) — read via CSS var with
// the same literal as fallback so a divIcon's raw HTML string (rendered
// outside Tailwind's cascade) still matches if the var is ever missing.
const VISITED_PIN_COLOR = "var(--primary, #c7dd5a)";

// The name label is absolutely positioned below the emoji rather than
// sized into the icon's own box — Leaflet's iconSize/iconAnchor drive
// where the *pin* lands on the coordinate, and a variable-width label
// would throw that off if it were part of the sized box instead of
// floating free underneath it.
//
// A visited shop gets a green ring around the emoji, and the same green
// on the label's border — sized to the same 26x26 box via box-sizing so
// the ring doesn't shift iconAnchor's pin-tip math — giving an at-a-glance
// "already been here" without opening the popup.
function buildShopIcon(name: string, visited: boolean) {
  const emojiHtml = visited
    ? `<span style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; box-sizing: border-box; border: 2.5px solid ${VISITED_PIN_COLOR}; border-radius: 50%; background: var(--card, #fffbf2); font-size: 17px; line-height: 1;">☕</span>`
    : `<span style="font-size: 26px; line-height: 1;">☕</span>`;
  const labelBorderColor = visited
    ? VISITED_PIN_COLOR
    : "var(--border, #2b1d12)";
  return divIcon({
    html: `
      <div style="position: relative;">
        ${emojiHtml}
        <span style="position: absolute; top: 26px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: var(--card, #fffbf2); border: 2px solid ${labelBorderColor}; border-radius: 999px; padding: 1px 7px; font-size: 11px; font-weight: 600; font-family: var(--font-heading), sans-serif; color: var(--foreground, #2b1d12); box-shadow: 2px 2px 0 0 var(--border, #2b1d12);">${escapeHtml(name)}</span>
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
  // undefined (the default) hides the visited control entirely — the
  // shop detail page's own pinpoint map already has a visited toggle on
  // the page itself, so a second one in the popup would be redundant.
  // The discover map (many pins, no per-shop toggle elsewhere) passes
  // both of these to opt in.
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
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [visited, setVisited] = useState(() => new Set(initiallyVisited));
  const [isPending, startTransition] = useTransition();

  // Optimistic, same pattern as DexGrid — flips immediately, reverts only
  // if the server action reports failure.
  function toggleVisited(shopId: string) {
    const wasVisited = visited.has(shopId);
    setVisited((prev) => {
      const next = new Set(prev);
      if (wasVisited) next.delete(shopId);
      else next.add(shopId);
      return next;
    });
    startTransition(async () => {
      const result = wasVisited
        ? await unmarkVisited(shopId)
        : await markVisited(shopId);
      if (!result.ok) {
        setVisited((prev) => {
          const next = new Set(prev);
          if (wasVisited) next.add(shopId);
          else next.delete(shopId);
          return next;
        });
      }
    });
  }

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

  function startLocating() {
    if (watchIdRef.current != null) return;

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

  function stopLocating() {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocating(false);
    setUserPosition(null);
  }

  // Auto-show the user's dot on load, but only if permission was already
  // granted on a previous visit — checked via the Permissions API so this
  // never itself triggers the browser's permission prompt. Calling
  // watchPosition blind on mount would prompt on every page load for
  // anyone who hasn't granted yet, not just the already-granted case this
  // is meant for. Browsers without Permissions API support for
  // "geolocation" (older Safari) just keep the manual button.
  useEffect(() => {
    if (!("permissions" in navigator)) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (!cancelled && status.state === "granted") startLocating();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function toggleLocate() {
    if (watchIdRef.current != null) {
      stopLocating();
    } else {
      startLocating();
    }
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
            icon={buildShopIcon(shop.name, visited.has(shop.id))}
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
              {signedIn != null && (
                <div className="mt-1.5">
                  {visited.has(shop.id) ? (
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border-2 border-border bg-primary px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-primary-foreground uppercase">
                        Visited
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleVisited(shop.id)}
                        disabled={isPending}
                        className="text-xs font-medium text-muted-foreground underline underline-offset-2 disabled:opacity-60"
                      >
                        Unmark
                      </button>
                    </div>
                  ) : signedIn ? (
                    <HoldToConfirmButton
                      onConfirm={() => toggleVisited(shop.id)}
                      idleLabel="Hold to mark visited"
                      holdingLabel="Keep holding…"
                      className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                    />
                  ) : (
                    <Link
                      href="/login"
                      className="text-xs text-primary underline"
                    >
                      Log in to track visits
                    </Link>
                  )}
                </div>
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
