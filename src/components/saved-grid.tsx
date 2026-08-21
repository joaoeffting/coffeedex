"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { unsaveShop } from "@/app/saved/actions";

type SavedShop = {
  id: string;
  dex_number: number;
  name: string;
  neighborhood: string;
  tags: string[];
  visited: boolean;
};

export function SavedGrid({
  shops,
  citySlug,
}: {
  shops: SavedShop[];
  citySlug: string;
}) {
  const [items, setItems] = useState(shops);
  const [isPending, startTransition] = useTransition();

  // Optimistic, same pattern as DexGrid — the card drops out of the list
  // immediately, only comes back if the server action reports failure.
  function unsave(shopId: string) {
    const prevItems = items;
    setItems((current) => current.filter((s) => s.id !== shopId));
    startTransition(async () => {
      const result = await unsaveShop(shopId);
      if (!result.ok) setItems(prevItems);
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nothing saved yet — browse the{" "}
        <Link href={`/discover/${citySlug}`} className="underline">
          map
        </Link>{" "}
        or the{" "}
        <Link href={`/dex/${citySlug}`} className="underline">
          dex
        </Link>{" "}
        and tap &ldquo;Save to visit&rdquo; on a shop.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {items.map((shop) => (
        <div
          key={shop.id}
          className="dex-outline flex flex-col gap-2 rounded-2xl bg-card p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-heading text-xs font-semibold text-muted-foreground">
              #{String(shop.dex_number).padStart(2, "0")}
            </span>
            {shop.visited && (
              <span className="-rotate-6 rounded-full border-2 border-border bg-primary px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-primary-foreground uppercase">
                Visited
              </span>
            )}
          </div>
          <span className="text-2xl">☕</span>
          <Link
            href={`/shops/${citySlug}/${shop.dex_number}`}
            className="font-heading text-base font-semibold hover:underline"
          >
            {shop.name}
          </Link>
          <p className="-mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {shop.neighborhood}
          </p>
          {shop.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {shop.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[0.65rem]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => unsave(shop.id)}
            disabled={isPending}
            className="mt-auto flex items-center gap-1 pt-1 text-xs font-medium text-muted-foreground underline underline-offset-2 disabled:opacity-60"
          >
            <Bookmark className="h-3 w-3 fill-current" aria-hidden="true" />
            Unsave
          </button>
        </div>
      ))}
    </div>
  );
}
