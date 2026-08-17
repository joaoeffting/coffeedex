"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Central Stockholm — Gamla Stan. No shop markers yet (Phase 3 seeds real
// coffee_shops rows); this is a smoke test confirming the Leaflet + OSM
// tile stack works before anything else depends on it.
const STOCKHOLM_CENTER: [number, number] = [59.3293, 18.0686];

export function StockholmMap() {
  return (
    <MapContainer
      center={STOCKHOLM_CENTER}
      zoom={13}
      scrollWheelZoom
      className="dex-outline size-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}
