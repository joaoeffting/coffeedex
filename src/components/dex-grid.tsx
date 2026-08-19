"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HoldToConfirmButton } from "@/components/hold-to-confirm-button";
import { markVisited, unmarkVisited } from "@/app/dex/actions";

type DexShop = {
  id: string;
  dex_number: number;
  name: string;
  neighborhood: string;
  tags: string[];
};

type Filter = "all" | "visited" | "not-visited";

export function DexGrid({
  shops,
  citySlug,
  initiallyVisited,
  signedIn,
}: {
  shops: DexShop[];
  citySlug: string;
  initiallyVisited: string[];
  signedIn: boolean;
}) {
  const [visited, setVisited] = useState(() => new Set(initiallyVisited));
  const [filter, setFilter] = useState<Filter>("all");
  const [isPending, startTransition] = useTransition();

  // Optimistic — flips immediately, reverts only if the server action
  // reports failure. revalidatePath inside the action keeps the next
  // real navigation in sync regardless.
  function toggle(shopId: string) {
    const wasVisited = visited.has(shopId);
    setVisited((prev) => {
      const next = new Set(prev);
      if (wasVisited) next.delete(shopId);
      else next.add(shopId);
      return next;
    });
    startTransition(async () => {
      const result = wasVisited
        ? await unmarkVisited(shopId)
        : await markVisited(shopId);
      if (!result.ok) {
        setVisited((prev) => {
          const next = new Set(prev);
          if (wasVisited) next.add(shopId);
          else next.delete(shopId);
          return next;
        });
      }
    });
  }

  const visibleShops = shops.filter((s) => {
    if (filter === "visited") return visited.has(s.id);
    if (filter === "not-visited") return !visited.has(s.id);
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="dex-outline flex items-center justify-between gap-4 rounded-2xl bg-card px-4 py-3">
        <p className="font-heading text-xl font-semibold">
          {visited.size}{" "}
          <span className="text-sm font-medium text-muted-foreground">
            of {shops.length} visited
          </span>
        </p>
        <div className="h-2.5 w-28 overflow-hidden rounded-full border-2 border-border bg-muted">
          <div
            className="h-full bg-primary transition-[width]"
            style={{
              width: `${shops.length ? (visited.size / shops.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "visited", "not-visited"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={
              filter === f
                ? "rounded-full border-2 border-border bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground"
                : "rounded-full border-2 border-border bg-card px-3 py-1 text-sm font-semibold hover:bg-muted"
            }
          >
            {f === "all" && `All (${shops.length})`}
            {f === "visited" && `Visited (${visited.size})`}
            {f === "not-visited" && `Not yet (${shops.length - visited.size})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {visibleShops.map((shop) => {
          const isVisited = visited.has(shop.id);
          return (
            <div
              key={shop.id}
              className={
                isVisited
                  ? "dex-outline flex flex-col gap-2 rounded-2xl bg-card p-3"
                  : "flex flex-col gap-2 rounded-2xl border-2 border-dashed border-border/50 bg-muted/50 p-3"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-heading text-xs font-semibold text-muted-foreground">
                  #{String(shop.dex_number).padStart(2, "0")}
                </span>
                {isVisited && (
                  <span className="-rotate-6 rounded-full border-2 border-border bg-primary px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-primary-foreground uppercase">
                    Visited
                  </span>
                )}
              </div>
              <span
                className={
                  isVisited ? "text-2xl" : "text-2xl opacity-55 grayscale"
                }
              >
                ☕
              </span>
              <Link
                href={`/shops/${citySlug}/${shop.dex_number}`}
                className={
                  isVisited
                    ? "font-heading text-base font-semibold hover:underline"
                    : "font-heading text-base font-semibold text-muted-foreground hover:underline"
                }
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
                    <Badge
                      key={tag}
                      variant={isVisited ? "secondary" : "outline"}
                      className="text-[0.65rem]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-auto pt-1">
                {signedIn ? (
                  isVisited ? (
                    <button
                      type="button"
                      onClick={() => toggle(shop.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-muted-foreground underline underline-offset-2 disabled:opacity-60"
                    >
                      Unmark visited
                    </button>
                  ) : (
                    <HoldToConfirmButton
                      onConfirm={() => toggle(shop.id)}
                      idleLabel="Hold to mark visited"
                      holdingLabel="Keep holding…"
                      className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
                    />
                  )
                ) : (
                  <Link
                    href="/login"
                    className="text-xs text-primary underline"
                  >
                    Log in to track visits
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
