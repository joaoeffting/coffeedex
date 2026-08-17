"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getStoredConsent,
  setStoredConsent,
  subscribeToConsent,
} from "@/lib/analytics-consent";
import { Button } from "@/components/ui/button";

// Null on the server snapshot (and the very first client render) means "no
// decision yet" renders nothing until hydration settles, avoiding a
// server/client mismatch. Once a real client snapshot resolves, the banner
// shows only when there's genuinely no stored decision.
export function AnalyticsConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getStoredConsent,
    () => null,
  );

  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-border bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          We&apos;d like to use analytics cookies to understand how Coffeedex
          is used. No tracking happens unless you accept — see our{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => setStoredConsent("declined")}>
            Decline
          </Button>
          <Button onClick={() => setStoredConsent("accepted")}>Accept</Button>
        </div>
      </div>
    </div>
  );
}
