"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { saveShop, unsaveShop } from "@/app/saved/actions";

// Plain tap, not hold-to-confirm — unlike marking a shop visited (a claim
// about the real world, worth a deliberate gesture), saving is just a
// personal to-do note. Freely reversible, so no friction needed.
export function SaveToggle({
  shopId,
  initiallySaved,
  signedIn,
}: {
  shopId: string;
  initiallySaved: boolean;
  signedIn: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  if (!signedIn) return null;

  function toggle() {
    const wasSaved = saved;
    setSaved(!wasSaved);
    startTransition(async () => {
      const result = wasSaved
        ? await unsaveShop(shopId)
        : await saveShop(shopId);
      if (!result.ok) setSaved(wasSaved);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={saved}
      className={
        saved
          ? "dex-outline flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          : "flex items-center gap-1.5 rounded-lg border-2 border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
      }
    >
      <Bookmark
        className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"}
        aria-hidden="true"
      />
      {saved ? "Saved" : "Save to visit"}
    </button>
  );
}
