import type { Metadata } from "next";
import { StockholmMapLoader } from "@/components/stockholm-map-loader";

export const metadata: Metadata = {
  title: "Discover",
  description: "Browse Stockholm's coffee shops on the map.",
};

export default function DiscoverPage() {
  return (
    <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Discover</h1>
        <p className="text-sm text-muted-foreground">
          Stockholm coffee shops — pins land here once Phase 3 seeds real
          data.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <StockholmMapLoader />
      </div>
    </main>
  );
}
