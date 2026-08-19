import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coffeedex",
    short_name: "Coffeedex",
    description:
      "A Pokédex-style collection game for real coffee shops — visit a cafe, mark it visited, and watch your personal album fill in.",
    // Straight into the collection grid, not the marketing landing page —
    // that's the actual app once it's installed, same as tapping any
    // other icon on your home screen.
    start_url: "/dex",
    display: "standalone",
    background_color: "#f7efde",
    theme_color: "#c7dd5a",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
