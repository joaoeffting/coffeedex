"use client";

import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
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
};

// A plain emoji divIcon, not Leaflet's default marker image — the default
// bundles two PNGs via relative paths that break under most bundlers
// (Turbopack included) unless separately patched. A divIcon sidesteps
// that entirely and reads as more on-brand than a generic pin anyway.
const shopIcon = divIcon({
  html: '<span style="font-size: 28px; line-height: 1;">☕</span>',
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

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
  return (
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
        <Marker key={shop.id} position={[shop.lat, shop.lng]} icon={shopIcon}>
          <Popup>
            <p className="font-heading font-semibold">
              #{shop.dex_number} {shop.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {shop.neighborhood}
            </p>
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
    </MapContainer>
  );
}
