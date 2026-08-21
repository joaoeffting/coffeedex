"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareShopButton({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Native share sheet where available (basically every phone browser)
    // — lets someone send this straight into a chat instead of just
    // copying a link they then have to paste somewhere themselves.
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Cancelling the native share sheet also rejects the promise —
        // not an error worth surfacing.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg border-2 border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted active:bg-muted"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Link copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </>
      )}
    </button>
  );
}
