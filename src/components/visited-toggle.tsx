"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { HoldToConfirmButton } from "@/components/hold-to-confirm-button";
import { markVisited, unmarkVisited } from "@/app/dex/actions";

export function VisitedToggle({
  shopId,
  initiallyVisited,
  signedIn,
}: {
  shopId: string;
  initiallyVisited: boolean;
  signedIn: boolean;
}) {
  const [visited, setVisited] = useState(initiallyVisited);
  const [isPending, startTransition] = useTransition();

  // Optimistic, same pattern as DexGrid — flips immediately, reverts only
  // if the server action reports failure.
  function toggle() {
    const wasVisited = visited;
    setVisited(!wasVisited);
    startTransition(async () => {
      const result = wasVisited
        ? await unmarkVisited(shopId)
        : await markVisited(shopId);
      if (!result.ok) setVisited(wasVisited);
    });
  }

  if (!signedIn) {
    return (
      <Link href="/login" className="text-sm text-primary underline">
        Log in to track visits
      </Link>
    );
  }

  if (visited) {
    return (
      <div className="flex items-center gap-2">
        <span className="dex-outline -rotate-6 rounded-full border-2 border-border bg-primary px-3 py-1 text-xs font-bold tracking-wide text-primary-foreground uppercase">
          Visited
        </span>
        <button
          type="button"
          onClick={toggle}
          disabled={isPending}
          className="text-xs font-medium text-muted-foreground underline underline-offset-2 transition-colors active:text-foreground disabled:opacity-60"
        >
          Unmark
        </button>
      </div>
    );
  }

  return (
    <HoldToConfirmButton
      onConfirm={toggle}
      idleLabel="Hold to mark visited"
      holdingLabel="Keep holding…"
      className="dex-outline rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
    />
  );
}
