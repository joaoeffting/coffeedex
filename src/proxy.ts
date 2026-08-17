import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Nonce-based, not 'unsafe-inline', on script-src. style-src stays on
  // 'unsafe-inline' though — both shadcn/ui's Base UI-driven components
  // (dialog/dropdown positioning) and Leaflet (marker/tile-layer
  // transforms) set styles via inline style="" attributes at runtime,
  // which a CSP nonce can only ever cover for <style> elements, never for
  // style="" attributes or element.style.x assignments.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://*.tile.openstreetmap.org https://tile.openstreetmap.org;
    font-src 'self';
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.i.posthog.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Set in place so Server Components/Actions can read it back via
  // `headers()` (e.g. to pass the nonce to next/script) without a second
  // NextResponse getting built that would clobber it.
  request.headers.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // geolocation=(self) — deliberately NOT blocked, unlike a typical
  // lockdown default: browser geolocation (distance sort, the "You're
  // here!" check-in nudge) is a core Coffeedex feature, not incidental.
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)",
  );
  // Defense-in-depth alongside CSP's frame-ancestors 'none' above, for
  // older browsers that don't understand frame-ancestors.
  response.headers.set("X-Frame-Options", "DENY");
  if (!isDev) {
    // Only in production — sending this from a dev server would pin the
    // browser into HTTPS-only for the dev host too.
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return updateSession(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
