"use client";

import { useEffect, useSyncExternalStore } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { getStoredConsent, subscribeToConsent } from "@/lib/analytics-consent";
import { applyTheme, getStoredTheme } from "@/lib/theme-preference";

// posthog.init() is what actually starts loading PostHog's script and
// sending data — gating it behind this (rather than initializing
// unconditionally) is what makes the consent banner meaningful. Passing the
// uninitialized `posthog` singleton to PostHogProvider below is harmless
// either way — it's just a context reference, no network activity happens
// until init() is actually called.
//
// The NODE_ENV check keeps local dev traffic out of the real project
// entirely, regardless of what's in .env.local — `next dev` always sets
// NODE_ENV=development, `next build`/`next start` (and Vercel's
// Production environment) set it to "production", so this can't be
// accidentally re-enabled just by someone filling in a dev API key later.
function initPostHogIfConsented() {
  if (posthog.__loaded) return;
  if (process.env.NODE_ENV !== "production") return;
  if (getStoredConsent() !== "accepted") return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // captured manually — see posthog-pageview.tsx
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore just reads the current value (getSnapshot must
  // stay pure — no side effects in there); the actual init() call lives in
  // the effect below, which re-runs on every consent change (the banner's
  // Accept button, or a "Cookie preferences" link), not just once on mount
  // — a returning visitor who already accepted gets tracked immediately,
  // and someone accepting mid-session starts right then too.
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getStoredConsent,
    () => null,
  );

  useEffect(() => {
    initPostHogIfConsented();
  }, [consent]);

  // The blocking script in layout.tsx already sets .dark correctly for
  // first paint — this is for while the app stays open: if the
  // preference is "system" and the OS theme flips (e.g. sunset, or the
  // user changes it in settings), the app should follow live rather
  // than needing a reload. Providers mounts once per hard navigation
  // and persists across client-side route changes, so this listener
  // stays attached the whole session.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange() {
      if (getStoredTheme() === "system") applyTheme("system");
    }
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
