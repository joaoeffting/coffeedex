import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <Card className="dex-outline w-full items-center bg-accent px-6 py-10 text-accent-foreground">
        <CardContent className="flex w-full flex-col items-center gap-4 px-0">
          {/* Stand-in for a real shop-collection illustration — swapped
              in once Phase 3 seeds real shop photos. */}
          <div className="dex-outline flex size-40 items-center justify-center rounded-2xl bg-card text-6xl">
            ☕
          </div>
          <p className="font-heading text-sm font-medium uppercase tracking-wide">
            Stockholm · #001
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold text-balance">
          Collect Stockholm&apos;s coffee shops
        </h1>
        <p className="text-muted-foreground text-balance">
          Visit a real cafe, mark it visited, and watch your personal album
          fill in — Pokédex-style.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button
          size="lg"
          className="dex-outline w-full"
          render={<Link href="/dex">Get started!</Link>}
        />
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          render={<Link href="/discover">Preview the map</Link>}
        />
      </div>
    </main>
  );
}
