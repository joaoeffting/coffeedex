"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { getStoredConsent, subscribeToConsent } from "@/lib/analytics-consent";
import {
  dismissInstallPrompt,
  getInstallPromptDismissed,
  getIsIosInstallable,
  subscribeToInstallPromptDismissed,
} from "@/lib/install-prompt";

// isIOS/isStandalone don't change over a page's lifetime, so this never
// needs to notify of an update — just a snapshot read guarded against SSR.
function subscribeNever() {
  return () => {};
}

export function IosInstallPrompt() {
  const isInstallable = useSyncExternalStore(
    subscribeNever,
    getIsIosInstallable,
    () => false,
  );
  const dismissed = useSyncExternalStore(
    subscribeToInstallPromptDismissed,
    getInstallPromptDismissed,
    () => true,
  );
  // Only shows once the cookie-consent banner is resolved — both are
  // fixed bottom banners, and stacking them on a fresh iOS visit would
  // overlap.
  const consentDecided =
    useSyncExternalStore(subscribeToConsent, getStoredConsent, () => null) !==
    null;

  if (!isInstallable || dismissed || !consentDecided) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-border bg-card p-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Install Coffeedex: tap the share icon{" "}
          <span aria-hidden="true">⎋</span> then &quot;Add to Home
          Screen&quot; <span aria-hidden="true">➕</span>.
        </p>
        <Button variant="outline" onClick={dismissInstallPrompt}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
